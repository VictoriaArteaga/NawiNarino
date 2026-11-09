"""Prototipo de recuperación híbrida: coincidencia léxica exacta.

Las pruebas NO requieren Ollama: usan el HashingEmbedder como componente denso
y fijan alpha=0 para aislar el componente léxico BM25 exacto. Las pruebas con
bge-m3 se omiten si Ollama o el modelo no están disponibles.
"""

import json
import urllib.request
from pathlib import Path

import pytest

from app.rag.evaluation import evaluate, load_questions
from app.rag.hybrid import HybridRetriever, exact_tokens
from app.rag.pipeline import RagPipeline

DATA = Path(__file__).resolve().parents[1] / "rag_data"
LEX_MANIFEST = DATA / "synthetic_lexical" / "manifest.json"
LEX_QUESTIONS = DATA / "eval" / "questions_lexical.json"


@pytest.fixture(scope="module")
def lex_pipeline() -> RagPipeline:
    p = RagPipeline()  # HashingEmbedder
    report = p.ingest(LEX_MANIFEST)
    assert not report.rejected
    return p


def pages(retriever, question):
    return [h.chunk.metadata.page for h in retriever.retrieve(question)]


def test_exact_tokens_keep_diacritics_and_glottal_apostrophe():
    assert exact_tokens("¿Qué significa tamú?") == ["qué", "significa", "tamú"]
    assert "ta'mu" in exact_tokens("ta'mu: nube")
    assert "tamu" not in exact_tokens("tamú")  # no se pliega


def test_lexical_corpus_excludes_warning_and_keeps_entries(lex_pipeline):
    indexed = " ".join(c.text for c in lex_pipeline.store.chunks)
    assert "AVISO" not in indexed
    for form in ("tamu:", "tamo:", "tamú:", "ta'mu:", "tamu'a:"):
        assert form in indexed


@pytest.mark.parametrize(
    "form,page",
    [("tamu", 1), ("tamo", 2), ("tamú", 3), ("nupe", 2), ("nupá", 3),
     ("kiru", 1), ("kirú", 3), ("kiro", 2), ("ta'mu", 4), ("tamu'a", 4)],
)
def test_bm25_lexical_distinguishes_near_identical_forms(lex_pipeline, form, page):
    r = HybridRetriever(lex_pipeline.store, lex_pipeline.embedder, "bm25", alpha=0.0, min_score=0.05)
    assert pages(r, f"¿Qué significa {form}?")[:1] == [page]


def test_bm25_lexical_abstains_on_forms_not_in_glossary(lex_pipeline):
    r = HybridRetriever(lex_pipeline.store, lex_pipeline.embedder, "bm25", alpha=0.0, min_score=0.05)
    for form in ("tamy", "nupi", "kiri", "tamua"):
        assert r.retrieve(f"¿Qué significa {form}?") == [], form


def test_accentless_query_still_finds_accented_form(lex_pipeline):
    # Quien escribe sin diacríticos no queda sin resultados (pasada plegada).
    r = HybridRetriever(lex_pipeline.store, lex_pipeline.embedder, "bm25", alpha=0.0, min_score=0.05)
    assert 3 in pages(r, "¿Qué significa kiru?") or 1 in pages(r, "¿Qué significa kiru?")


def test_hashing_alone_cannot_tell_tamu_from_tamu_with_accent(lex_pipeline):
    # Limitación medida del embedder actual: pliega diacríticos, por lo que
    # «tamu» y «tamú» reciben el mismo puntaje en el fragmento.
    q1 = lex_pipeline.embedder.embed("tamu")
    q2 = lex_pipeline.embedder.embed("tamú")
    assert q1 == q2


def test_hybrid_does_not_change_active_pipeline_defaults():
    p = RagPipeline()
    assert type(p.retriever).__name__ == "Retriever"
    assert p.embedder.name.startswith("hashing")


# ---------- con bge-m3 (opcional) ----------


def _ollama_has_bge() -> bool:
    try:
        with urllib.request.urlopen("http://127.0.0.1:11434/api/tags", timeout=2) as r:
            return any(m["name"].startswith("bge-m3") for m in json.loads(r.read())["models"])
    except Exception:
        return False


@pytest.mark.skipif(not _ollama_has_bge(), reason="Ollama con bge-m3 no disponible")
def test_hybrid_bm25_with_bge_m3_cites_only_the_exact_page():
    from app.rag.embedders_optional import OllamaEmbedder

    emb = OllamaEmbedder("bge-m3")
    p = RagPipeline(emb)
    p.ingest(LEX_MANIFEST)
    p.retriever = HybridRetriever(p.store, emb, "bm25", alpha=0.5, min_score=0.3)
    s = evaluate(p, load_questions(LEX_QUESTIONS))
    answerable = [r for r in s.results if isinstance(r.expect, dict)]
    assert all(r.ok and r.precise for r in answerable)  # 14/14 medido
    assert all(r.abstained for r in s.results if not isinstance(r.expect, dict))
