"""Recuperación híbrida (denso + léxico exacto), evaluada en la etapa 5. Se activa
solo vía ``RAG_RETRIEVER`` (``auto``/``hybrid``, ver app/rag/factory.py); si no hay
Ollama, el endpoint usa HashingEmbedder.

Por qué un componente léxico exacto: ``HashingEmbedder`` pliega diacríticos
(``fold``), así que «tamu» y «tamú» son el mismo token; y un modelo denso
trata las formas casi idénticas como casi idénticas. Para vocabulario en
lenguas indígenas la forma exacta (diacríticos, apóstrofo glotal) importa.

``lexical`` puede ser:
  - ``"bm25"``: BM25 sobre tokens que CONSERVAN diacríticos y apóstrofos, más
    una pasada con tokens plegados (peso ``fold_weight``) para consultas
    escritas sin diacríticos.
  - ``"hash"``: coseno del HashingEmbedder actual (plegado, n-gramas).
  - ``"none"``: solo denso.

Puntaje final = alpha * coseno_denso + (1 - alpha) * léxico, con léxico en [0, 1].
"""

import math
import re
import unicodedata
from collections import Counter

from app.rag.embeddings import STOPWORDS, Embedder, HashingEmbedder, content_tokens, fold
from app.rag.retrieval import Hit, Retriever
from app.rag.vectorstore import IndexedChunk, VectorStore

# Se conservan apóstrofos (glotal) como parte de la palabra; no se normalizan
# entre sí (' vs ’ vs ʼ): decisión pendiente con hablantes.
_EXACT_TOKEN = re.compile(r"[\w'’ʼ]+", re.UNICODE)
K1, B = 1.2, 0.75


def exact_tokens(text: str) -> list[str]:
    return _EXACT_TOKEN.findall(unicodedata.normalize("NFC", text).lower())


def _query_tokens(text: str) -> list[str]:
    # Riesgo conocido: una palabra indígena que coincida con una stopword
    # española se descartaría de la consulta.
    return [t for t in exact_tokens(text) if fold(t) not in STOPWORDS and len(t) > 1]


class _Bm25:
    def __init__(self, docs: list[list[str]]) -> None:
        self.docs = [Counter(d) for d in docs]
        self.lengths = [len(d) for d in docs]
        self.avg = (sum(self.lengths) / len(docs)) if docs else 1.0
        self.df: Counter[str] = Counter()
        for d in self.docs:
            self.df.update(d.keys())
        self.n = len(docs)

    def idf(self, term: str) -> float:
        df = self.df.get(term, 0)
        return math.log(1 + (self.n - df + 0.5) / (df + 0.5))

    def score(self, query: list[str], i: int) -> float:
        tf = self.docs[i]
        norm = K1 * (1 - B + B * self.lengths[i] / (self.avg or 1.0))
        return sum(
            self.idf(t) * tf[t] * (K1 + 1) / (tf[t] + norm) for t in set(query) if t in tf
        )

    def bound(self, query: list[str]) -> float:
        return sum(self.idf(t) * (K1 + 1) for t in set(query)) or 1.0


class HybridRetriever(Retriever):
    def __init__(
        self,
        store: VectorStore,
        dense: Embedder,
        lexical: str = "bm25",
        alpha: float = 0.5,
        top_k: int = 4,
        min_score: float = 0.3,
        relative_min: float = 0.85,
        fold_weight: float = 0.25,
    ) -> None:
        super().__init__(
            store, dense, top_k=top_k, min_score=min_score, min_overlap=0,
            relative_min=relative_min,
        )
        assert lexical in {"bm25", "hash", "none"}
        self.lexical = lexical
        self.alpha = alpha
        self.fold_weight = fold_weight
        self._built_for = -1
        self._hasher = HashingEmbedder()

    # --- índice léxico construido de forma perezosa sobre los textos del almacén
    def _build(self) -> None:
        if self._built_for == len(self.store.chunks):
            return
        texts = [c.text for c in self.store.chunks]
        self._exact = _Bm25([exact_tokens(t) for t in texts])
        self._folded = _Bm25([[fold(x) for x in exact_tokens(t)] for t in texts])
        self._hash_vecs = [self._hasher.embed(t) for t in texts]
        self._built_for = len(self.store.chunks)

    def _lex_scores(self, question: str) -> list[float]:
        n = len(self.store.chunks)
        if self.lexical == "none":
            return [0.0] * n
        self._build()
        if self.lexical == "hash":
            qv = self._hasher.embed(question)
            return [max(0.0, sum(a * b for a, b in zip(qv, v))) for v in self._hash_vecs]
        q = _query_tokens(question)
        qf = [fold(t) for t in q]
        if not q:
            return [0.0] * n
        b_exact, b_fold = self._exact.bound(q), self._folded.bound(qf)
        out = []
        for i in range(n):
            s = self._exact.score(q, i) / b_exact
            s_fold = self._folded.score(qf, i) / b_fold
            out.append(min(1.0, (s + self.fold_weight * s_fold) / (1 + self.fold_weight)))
        return out

    def retrieve(self, question, language=None, content_type=None) -> list[Hit]:
        if not (_query_tokens(question) or self.lexical == "none"):
            return []
        dense = {
            id(c): s
            for c, s in self.store.search(
                self.embedder.embed(question),
                top_k=len(self.store.chunks),
                language=language,
                content_type=content_type,
            )
        }
        lex = self._lex_scores(question)
        scored: list[tuple[IndexedChunk, float]] = []
        for chunk, lex_score in zip(self.store.chunks, lex):
            if id(chunk) not in dense:  # filtrado por idioma/tipo
                continue
            final = self.alpha * dense[id(chunk)] + (1 - self.alpha) * lex_score
            scored.append((chunk, final))
        scored.sort(key=lambda item: item[1], reverse=True)
        weights = self._idf(content_tokens(question) or {""})
        hits = [Hit(c, s, 0, weights) for c, s in scored if s >= self.min_score]
        if hits:
            floor = hits[0].score * self.relative_min
            hits = [h for h in hits if h.score >= floor]
        return hits[: self.top_k]
