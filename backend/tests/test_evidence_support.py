"""Soporte de la pregunta en la evidencia: «direct» frente a «related» (etiqueta, no abstención).

Cubre los tres casos de «tema presente, dato ausente» documentados en
docs/demo-explorador.md, y comprueba que las respuestas correctas de la demo no
se pierden ni se degradan. Se repite con el recuperador híbrido si hay Ollama.
"""

import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.main import app
from app.rag.factory import build_engine, ollama_has_model
from app.rag.generation import ABSTENTION_MESSAGE
from app.rag.support import unmatched_terms
from app.routers.explorer import get_pipeline

MODES = ["hashing", pytest.param("hybrid", marks=pytest.mark.skipif(
    not ollama_has_model("http://127.0.0.1:11434", "bge-m3"), reason="Ollama/bge-m3 no disponible"))]


@pytest.fixture(scope="module", params=MODES)
def engine(request):
    return build_engine(Settings(rag_retriever=request.param))


# ---------- los tres casos problemáticos ----------


@pytest.mark.parametrize(
    "question,missing",
    [
        ("¿Cómo se dice dos en la Lengua de Prueba?", ["dos"]),          # numeral que no aparece
        ("¿Quién fundó el Valle Ficticio?", ["fundó"]),                  # quién fundó un lugar: no hay dato
        ("¿De qué color es el río Imaginario?", ["color"]),              # característica no documentada
    ],
)
def test_topic_without_datum_is_not_presented_as_an_answer(engine, question, missing):
    a = engine.ask(question)
    assert not a.abstained  # decisión medida: no se descartan fragmentos (ver docs/rag-evidence-support.md)
    assert a.evidence == "related"
    assert a.unmatched_terms == missing
    assert a.citations, "se conservan las citas para que el usuario pueda verificar"
    assert any("no contienen directamente" in n and missing[0] in n for n in a.notices)


# ---------- lo que ya funcionaba no se degrada ----------


@pytest.mark.parametrize(
    "question",
    [
        "¿Cuál es el saludo de la mañana en la Lengua de Prueba?",
        "¿Qué pasa en la Fiesta de la Luna de Papel?",            # varios fragmentos
        "¿Qué plato se prepara en la Fiesta de la Luna de Papel?",
        "¿Qué significa sa?",                                      # dos sentidos
        "¿Qué cultivan las familias del valle?",
        "¿Cómo se dice uno en la Lengua de Prueba?",
    ],
)
def test_answerable_demo_questions_stay_direct(engine, question):
    a = engine.ask(question)
    assert not a.abstained and a.evidence == "direct" and a.unmatched_terms == []
    assert all("no contienen directamente" not in n for n in a.notices)
    assert any("sintético" in n for n in a.notices)  # el aviso de contenido sintético se conserva


def test_multi_fragment_and_two_senses_are_preserved(engine):
    a = engine.ask("¿Qué pasa en la Fiesta de la Luna de Papel?")
    assert len({c.document_id for c in a.citations}) >= 2
    s = engine.ask("¿Qué significa sa?")
    assert '"tarde"' in s.citations[0].excerpt and '"orilla"' in s.citations[0].excerpt


def test_paraphrase_cost_is_visible_not_hidden(engine):
    # Costo medido de la etiqueta: una reformulación correcta puede quedar «related»,
    # pero NO se oculta (sigue con citas): el usuario verifica en la fuente.
    a = engine.ask("¿En qué orden pone el verbo la Lengua de Prueba?")
    assert not a.abstained and a.citations
    assert a.evidence in ("direct", "related")


def test_abstentions_are_unchanged(engine):
    for q in ("¿Cómo se dice agua en awapit?", "¿Cuál es la capital de Colombia?", "¿Cómo se dice?"):
        a = engine.ask(q)
        assert a.abstained and a.evidence == "none" and a.answer == ABSTENTION_MESSAGE and a.unmatched_terms == []


# ---------- la función de soporte ----------


def test_support_counts_document_metadata_and_ignores_generic_words(engine):
    hits = engine.primary.retriever.retrieve("¿Qué significa sa?")
    # «significa» es una palabra genérica de pregunta; «sa» está en el fragmento
    assert unmatched_terms("¿Qué significa sa?", hits) == []
    # «prueba» y «lengua» están en la metadata (título/lengua) aunque no en cada fragmento
    hits = engine.primary.retriever.retrieve("¿Qué fiesta celebran en el Valle Ficticio?")
    assert unmatched_terms("lengua prueba valle", hits[:1]) == []


def test_support_is_accent_insensitive_but_exact_otherwise(engine):
    hits = engine.primary.retriever.retrieve("¿Cuál es el saludo de la mañana en la Lengua de Prueba?")
    assert unmatched_terms("saludo manana", hits) == []        # sin diacríticos: coincide
    assert unmatched_terms("saludo madrugada", hits) == ["madrugada"]


# ---------- API ----------


def test_endpoint_exposes_evidence_fields():
    get_pipeline.cache_clear()
    with TestClient(app) as client:
        r = client.post("/explorer/ask", json={"question": "¿Quién fundó el Valle Ficticio?"}).json()
        assert r["evidence"] == "related" and r["unmatchedTerms"] == ["fundó"] and r["citations"]
        r = client.post("/explorer/ask", json={"question": "¿Qué significa sa?"}).json()
        assert r["evidence"] == "direct" and r["unmatchedTerms"] == []
        r = client.post("/explorer/ask", json={"question": "¿Cómo se dice agua en awapit?"}).json()
        assert r["evidence"] == "none" and r["abstained"] is True
