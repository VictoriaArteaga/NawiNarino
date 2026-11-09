"""Conjunto de verificación de evidencia (línea base, sin verificador).

Fija el comportamiento ACTUAL por categoría. Las categorías que hoy fallan
(`topic_no_datum`, `contradictory`) no se afirman como correctas: se
documentan como limitación; cuando exista un verificador, deben subir.
"""

import json
from collections import defaultdict
from pathlib import Path

import pytest

from app.rag.pipeline import RagPipeline
from scripts.rag_verify_baseline import MANIFEST, QUESTIONS, judge

CATEGORIES = {"answerable", "topic_no_datum", "ambiguous", "contradictory", "must_abstain"}


@pytest.fixture(scope="module")
def pipeline() -> RagPipeline:
    p = RagPipeline()
    assert not p.ingest(MANIFEST).rejected
    return p


@pytest.fixture(scope="module")
def items() -> list[dict]:
    return json.loads(QUESTIONS.read_text(encoding="utf-8"))["questions"]


def test_dataset_is_well_formed(items):
    assert len({i["id"] for i in items}) == len(items) == 15
    assert {i["category"] for i in items} == CATEGORIES
    for i in items:
        assert i["behavior"] in {"answer", "abstain", "answer_all", "conflict", "clarify_or_abstain"}
        if i["behavior"] in ("abstain", "clarify_or_abstain"):
            assert i["support"] == []
        else:
            assert i["support"]


def test_contradiction_is_really_in_the_corpus(pipeline):
    text = " ".join(c.text for c in pipeline.store.chunks)
    assert '"mora"' in text and '"mura"' in text
    docs = {c.metadata.document_id for c in pipeline.store.chunks if '"mora"' in c.text or '"mura"' in c.text}
    assert len(docs) == 2  # en documentos distintos


def test_warning_paragraphs_excluded_from_verification_corpus(pipeline):
    assert all("AVISO" not in c.text and "Contradice a propósito" not in c.text for c in pipeline.store.chunks)


def test_current_baseline_per_category(pipeline, items):
    by_cat = defaultdict(list)
    for item in items:
        by_cat[item["category"]].append(judge(item, pipeline.ask(item["q"])))
    # Lo que hoy funciona no debe empeorar:
    for cat in ("answerable", "ambiguous", "must_abstain"):
        assert all(r["correct"] for r in by_cat[cat]), cat
    # Contradicciones: hoy se citan ambas fuentes, pero NO se señala el conflicto.
    assert all(r["covers_all"] for r in by_cat["contradictory"])
    assert not any(r["flagged"] for r in by_cat["contradictory"])  # limitación conocida
