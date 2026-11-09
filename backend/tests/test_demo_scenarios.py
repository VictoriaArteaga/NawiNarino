"""Escenarios de la demostración del Explorador (corpus sintético de demo).

Hermético: usa el recuperador `hashing`. Las mismas comprobaciones se repiten
con el recuperador híbrido si Ollama tiene bge-m3 (si no, se omiten).
"""

import json
import urllib.request

import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.main import app
from app.rag.factory import ExplorerEngine, build_engine, ollama_has_model
from app.rag.generation import ABSTENTION_MESSAGE
from app.routers.explorer import get_pipeline

DEMO = Settings().rag_manifest_path


def _has_bge() -> bool:
    return ollama_has_model("http://127.0.0.1:11434", "bge-m3")


MODES = ["hashing", pytest.param("hybrid", marks=pytest.mark.skipif(not _has_bge(), reason="Ollama/bge-m3 no disponible"))]


@pytest.fixture(scope="module", params=MODES)
def engine(request) -> ExplorerEngine:
    return build_engine(Settings(rag_retriever=request.param))


def cited(answer):
    return {(c.document_id.removeprefix("synthetic__"), c.page) for c in answer.citations}


def test_demo_manifest_is_synthetic_only_and_has_no_real_documents():
    entries = json.loads(DEMO.read_text(encoding="utf-8"))
    assert {e["metadata"]["access_level"] for e in entries} == {"synthetic"}
    assert all("ficticio" in e["metadata"]["title"] for e in entries)
    assert all("corpus/" not in e["file"] for e in entries)


def test_demo_documents_index_without_rejections(engine):
    assert engine.chunks == 7


def test_scenario_direct_answer(engine):
    a = engine.ask("¿Cuál es el saludo de la mañana en la Lengua de Prueba?")
    assert not a.abstained and ("guia-gramatica-lengua-prueba", 2) in cited(a)
    assert 'zumba lo' in a.citations[0].excerpt


def test_scenario_multiple_fragments(engine):
    a = engine.ask("¿Qué pasa en la Fiesta de la Luna de Papel?")
    assert {("relato-territorio-valle-ficticio", 1), ("calendario-valle-ficticio", 1)} <= cited(a)
    assert len({c.document_id for c in a.citations}) >= 2


def test_scenario_specific_page(engine):
    a = engine.ask("¿Qué plato se prepara en la Fiesta de la Luna de Papel?")
    assert cited(a) == {("calendario-valle-ficticio", 2)}
    assert "pan de maíz azul" in a.citations[0].excerpt


def test_scenario_word_with_two_senses(engine):
    a = engine.ask("¿Qué significa sa?")
    assert a.citations[0].document_id.endswith("glosario-sentidos-lengua-prueba")
    assert '"tarde"' in a.citations[0].excerpt and '"orilla"' in a.citations[0].excerpt


@pytest.mark.parametrize("q", ["¿Cómo se dice agua en awapit?", "¿Cuál es la capital de Colombia?", "¿Cómo se dice?", "Cuéntame más"])
def test_scenario_abstention(engine, q):
    a = engine.ask(q)
    assert a.abstained and a.citations == [] and a.answer == ABSTENTION_MESSAGE


def test_every_citation_matches_retrieved_text_and_is_marked_synthetic(engine):
    texts = {c.metadata.chunk_id: c.text for c in engine.primary.store.chunks}
    for q in ["¿Qué pasa en la Fiesta de la Luna de Papel?", "¿Qué significa sa?", "¿Cuál es el saludo de la mañana en la Lengua de Prueba?"]:
        a = engine.ask(q)
        assert any("sintético" in n for n in a.notices)
        for c in a.citations:
            assert c.is_synthetic and c.page >= 1 and c.title and c.validation_status == "synthetic"
            assert all(part.strip() in texts[c.chunk_id] for part in c.excerpt.split("[…]"))


def test_warning_paragraphs_never_reach_the_index(engine):
    indexed = " ".join(c.text for c in engine.primary.store.chunks)
    assert "AVISO" not in indexed and "ficticio creado" not in indexed


# ---------- fábrica y respaldo ----------


def test_auto_falls_back_to_hashing_when_ollama_is_unreachable():
    e = build_engine(Settings(rag_retriever="auto", rag_ollama_host="http://127.0.0.1:9"))
    assert e.mode == "hashing" and e.fallback is None


def test_forced_hybrid_without_ollama_fails_loudly():
    with pytest.raises(Exception):
        build_engine(Settings(rag_retriever="hybrid", rag_ollama_host="http://127.0.0.1:9"))


def test_engine_uses_fallback_when_primary_breaks():
    fallback = build_engine(Settings(rag_retriever="hashing")).primary

    class Broken:
        class store:  # noqa: N801
            chunks: list = []

        def ask(self, *a, **k):
            raise ConnectionError("Ollama apagado")

    e = ExplorerEngine(Broken(), "hybrid", fallback)
    assert not e.ask("¿Qué plato se prepara en la Fiesta de la Luna de Papel?").abstained


# ---------- endpoint ----------


@pytest.fixture
def client():
    get_pipeline.cache_clear()
    with TestClient(app) as c:
        yield c


def test_endpoint_end_to_end_and_health(client):
    assert client.get("/health").json()["explorerRetriever"] == "hashing"
    r = client.post("/explorer/ask", json={"question": "¿Qué significa sa?"})
    body = r.json()
    assert r.status_code == 200 and not body["abstained"]
    assert body["citations"][0]["documentId"].endswith("glosario-sentidos-lengua-prueba")
    assert body["citations"][0]["page"] == 1 and body["citations"][0]["isSynthetic"] is True
    assert client.post("/explorer/ask", json={"question": "¿Cómo se dice agua en awapit?"}).json()["abstained"] is True


@pytest.mark.parametrize("payload", [{"question": ""}, {"question": "a"}, {"question": "   "}, {"question": " ab "}, {}, {"question": "x" * 501}])
def test_endpoint_rejects_invalid_questions(client, payload):
    assert client.post("/explorer/ask", json=payload).status_code == 422


def test_endpoint_accepts_surrounding_spaces(client):
    r = client.post("/explorer/ask", json={"question": "   ¿Qué significa sa?   "})
    assert r.status_code == 200 and r.json()["question"] == "¿Qué significa sa?"
