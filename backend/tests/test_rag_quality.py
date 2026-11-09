"""Exclusión de contenido no indexable y evaluación de recuperación.

Las métricas de regresión son la línea base MEDIDA con el HashingEmbedder
(``python -m scripts.rag_eval``). Si mejoran, suba el piso; si empeoran, la
prueba falla. ``MAX_FALSE_ANSWERS`` documenta una limitación conocida.
"""

import json
from pathlib import Path

import pytest

from app.rag.exclusion import UnknownTagError, partition_page
from app.rag.evaluation import evaluate, load_questions
from app.rag.pipeline import RagPipeline
from app.rag.retrieval import Retriever
from tests.test_rag import SYNTHETIC_MANIFEST, base_meta

QUESTIONS = SYNTHETIC_MANIFEST.parents[1] / "eval" / "questions.json"

# Línea base medida (38 preguntas, corpus sintético, HashingEmbedder).
MIN_TOP1, MIN_ANY, MIN_PRECISE = 0.88, 0.96, 0.84
MAX_FALSE_ABSTENTIONS = 1
# Limitación conocida: preguntas con el tema correcto pero el dato ausente
# ("¿Cómo se dice dos en la Lengua de Prueba?") reciben una respuesta con
# citas del tema. Ningún umbral probado lo corrige sin rechazar preguntas
# legítimas (ver backend/docs/rag-evaluation.md).
MAX_FALSE_ANSWERS = 5


@pytest.fixture(scope="module")
def pipeline() -> RagPipeline:
    p = RagPipeline()
    p.ingest(SYNTHETIC_MANIFEST)
    return p


@pytest.fixture(scope="module")
def summary(pipeline):
    return evaluate(pipeline, load_questions(QUESTIONS))


# ---------- exclusión de contenido no indexable ----------


def test_partition_excludes_only_tagged_paragraphs():
    text = (
        "[[advertencia]] AVISO: texto de prueba.\n\n"
        "Una oración legítima que menciona un aviso de lluvia.\n\n"
        "[[Revisión]] Nota interna.\n\n"
        "Otra oración legítima."
    )
    kept, excluded = partition_page(3, text)
    assert "AVISO" not in kept and "Nota interna" not in kept
    assert "aviso de lluvia" in kept and "Otra oración legítima" in kept
    assert [(e.page, e.tag) for e in excluded] == [(3, "advertencia"), (3, "revision")]
    assert "[[" not in kept


def test_unknown_tag_is_rejected_not_indexed():
    with pytest.raises(UnknownTagError):
        partition_page(1, "[[editoral]] typo en la etiqueta")


def test_excluded_text_not_in_index_but_still_in_source_file(pipeline):
    indexed = " ".join(c.text for c in pipeline.store.chunks)
    for fragment in ("AVISO", "Nota de revisión", "Nota para el equipo", "inventada para las pruebas"):
        assert fragment not in indexed
    sources = " ".join(
        f.read_text(encoding="utf-8") for f in SYNTHETIC_MANIFEST.parent.glob("*.md")
    )
    for fragment in ("AVISO", "Nota de revisión", "Nota para el equipo", "inventada para las pruebas"):
        assert fragment in sources  # el original no se toca


def test_legitimate_linguistic_content_is_kept(pipeline):
    indexed = " ".join(c.text for c in pipeline.store.chunks)
    for fragment in ('"zumba lo"', '"kep"', "verbo al final", "-ta", "Fiesta de la Luna de Papel", "Cerro Sin Sombra"):
        assert fragment in indexed


def test_ingest_report_lists_excluded_blocks():
    report = RagPipeline().ingest(SYNTHETIC_MANIFEST)
    blocks = [b for bs in report.excluded.values() for b in bs]
    assert {b.tag for b in blocks} == {"advertencia", "editorial", "interno", "revision"}
    assert all(b.text and b.page >= 1 for b in blocks)


def test_document_with_unknown_tag_is_rejected_by_ingest(tmp_path):
    (tmp_path / "a.md").write_text("[[nota]] algo\n\nTexto.", encoding="utf-8")
    meta = base_meta(access_level="synthetic", validation_status="synthetic")
    (tmp_path / "m.json").write_text(
        json.dumps([{"file": "a.md", "metadata": meta.model_dump(mode="json")}]),
        encoding="utf-8",
    )
    report = RagPipeline().ingest(tmp_path / "m.json")
    assert "doc-1" in report.rejected and not report.indexed


def test_review_note_questions_abstain(pipeline):
    # Preguntar por el contenido excluido no debe recuperarlo.
    assert pipeline.ask("¿Qué instrucciones hay para revisar esta página?").abstained
    assert pipeline.ask("¿Qué dice la nota para el equipo?").abstained


# ---------- evaluación de recuperación ----------


def test_eval_set_is_well_formed():
    questions = load_questions(QUESTIONS)
    assert len(questions) == 38
    assert len({q["id"] for q in questions}) == len(questions)
    assert {q["category"] for q in questions} == {
        "direct", "paraphrase", "synonym", "specific_term", "no_evidence", "ambiguous",
    }


def test_answerable_questions_meet_baseline(summary):
    t = summary.totals()
    assert t["answerable_top1"] >= MIN_TOP1
    assert t["answerable_any"] >= MIN_ANY
    assert t["answerable_precise"] >= MIN_PRECISE
    assert t["false_abstentions"] <= MAX_FALSE_ABSTENTIONS


def test_correct_page_is_preserved_for_direct_questions(summary):
    for r in summary.results:
        if r.category == "direct" and r.cited:
            expected_pages = r.expect["pages"]
            assert any(p in expected_pages for _, p in r.cited), r.question


def test_contentless_questions_always_abstain(summary):
    for r in summary.results:
        if r.expect == "ambiguous_abstain":
            assert r.abstained, r.question


def test_known_limitation_false_answers_do_not_grow(summary):
    assert summary.totals()["false_answers"] <= MAX_FALSE_ANSWERS


# ---------- opción de cobertura ----------


def test_coverage_is_off_by_default_and_filters_when_enabled(pipeline):
    assert pipeline.retriever.min_coverage == 0.0
    q = "¿Cómo se dice dos en la Lengua de Prueba?"
    assert pipeline.ask(q).abstained is False  # limitación conocida (ver arriba)
    strict = Retriever(pipeline.store, pipeline.embedder, min_coverage=0.7)
    assert strict.retrieve(q) == []
