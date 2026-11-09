"""Recuperación semántica con umbrales de evidencia."""

import math
from collections import Counter
from dataclasses import dataclass

from app.rag.embeddings import Embedder, content_tokens
from app.rag.vectorstore import IndexedChunk, VectorStore


@dataclass(frozen=True)
class Hit:
    chunk: IndexedChunk
    score: float
    overlap: int  # términos de contenido de la pregunta presentes en el fragmento
    weights: dict[str, float]  # peso (IDF^2) de los términos de la pregunta


class Retriever:
    def __init__(
        self,
        store: VectorStore,
        embedder: Embedder,
        top_k: int = 4,
        min_score: float = 0.15,
        min_overlap: int = 1,
        relative_min: float = 0.85,
        min_coverage: float = 0.0,
    ) -> None:
        self.store = store
        self.embedder = embedder
        self.top_k = top_k
        self.min_score = min_score
        self.min_overlap = min_overlap
        self.relative_min = relative_min  # fracción del mejor puntaje
        # Fracción (ponderada por rareza) de los términos de la pregunta que
        # debe aparecer en el fragmento. 0 = desactivado (valor por defecto).
        self.min_coverage = min_coverage
        self._df: Counter[str] = Counter()
        self._df_size = -1

    def _idf(self, terms: set[str]) -> dict[str, float]:
        if self._df_size != len(self.store.chunks):
            self._df = Counter()
            for c in self.store.chunks:
                self._df.update(content_tokens(c.text))
            self._df_size = len(self.store.chunks)
        n = max(len(self.store.chunks), 1)
        return {t: (math.log((n + 1) / (self._df[t] + 1)) + 1) ** 2 for t in terms}

    def retrieve(
        self,
        question: str,
        language: str | None = None,
        content_type: str | None = None,
    ) -> list[Hit]:
        """Fragmentos con evidencia suficiente. Lista vacía = abstenerse.

        Un fragmento exige similitud >= ``min_score`` Y al menos
        ``min_overlap`` términos de contenido compartidos con la pregunta:
        la similitud sola puede dar falsos positivos con n-gramas.
        """
        terms = content_tokens(question)
        if not terms:
            return []
        candidates = self.store.search(
            self.embedder.embed(question),
            top_k=self.top_k * 3,
            language=language,
            content_type=content_type,
        )
        weights = self._idf(terms)
        hits: list[Hit] = []
        for chunk, score in candidates:
            overlap = len(terms & content_tokens(chunk.text))
            total = sum(weights.values()) or 1.0
            matched = sum(weights[t] for t in terms & content_tokens(chunk.text))
            if (
                score >= self.min_score
                and overlap >= self.min_overlap
                and matched / total >= self.min_coverage
            ):
                hits.append(Hit(chunk, score, overlap, weights))
        if hits:
            floor = hits[0].score * self.relative_min
            hits = [h for h in hits if h.score >= floor]
        return hits[: self.top_k]
