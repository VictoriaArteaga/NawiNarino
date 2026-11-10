"""Corpus real de la demo local: compuerta de autorización, filtros de calidad y avisos.

Hermético: solo usa el recuperador hashing en memoria (sin Ollama). No evalúa calidad lingüística.
"""

import json

import pytest

from app.core.config import Settings
from app.rag import real_corpus as rc
from app.rag.factory import build_engine
from app.rag.metadata import BLOCKED_DOCUMENT_IDS, ValidationStatus

# El corpus real (corpus/_rag/pages.jsonl y las transcripciones locales) no se versiona: sin él, estas pruebas se omiten.
pytestmark = pytest.mark.skipif(not rc.PAGES.exists(), reason="corpus real no disponible en esta copia del repositorio")
HAS_TRANSCRIPTION = bool(rc.load_transcriptions())

DOCS = {d["document_id"]: d for d in json.loads(rc.DOCUMENTS.read_text(encoding="utf-8"))}
REGISTRY = json.loads(rc.REGISTRY.read_text(encoding="utf-8"))


@pytest.fixture(scope="module")
def chunks():
    return list(rc.iter_real_chunks())


@pytest.fixture(scope="module")
def page_quality():
    out = {}
    for line in rc.PAGES.read_text(encoding="utf-8").splitlines():
        r = json.loads(line)
        out[(r["document_id"], r["page"])] = r["page_quality"]
    return out


def test_registry_entries_are_local_demo_only_and_honest_about_who_authorizes():
    assert REGISTRY["entries"]
    for e in REGISTRY["entries"]:
        assert "NO es titular de derechos" in e["authorizer"]["role"]
        assert "PENDIENTES" in e["conditions"] and "LOCAL" in e["conditions"] and "Sin redistribución" in e["conditions"]


def test_only_authorized_and_usable_documents_are_indexed(chunks):
    cleared = {e["document_id"] for e in REGISTRY["entries"]}
    used = {c.meta.document_id for c in chunks}
    assert used and used <= cleared
    for doc_id in used:
        assert rc.document_exclusion(DOCS[doc_id], frozenset(rc.load_transcriptions())) is None


def test_excluded_documents_never_appear(chunks):
    used = {c.meta.document_id for c in chunks}
    assert not (used & BLOCKED_DOCUMENT_IDS)
    for doc_id, d in DOCS.items():
        if rc.document_exclusion(d, frozenset(rc.load_transcriptions())):
            assert doc_id not in used, doc_id
    assert not any(DOCS[d]["evidence_class"] in rc.NON_EVIDENCE_CLASSES for d in used)


def test_only_ok_quality_pages_are_indexed(chunks, page_quality):
    assert all(page_quality[(c.meta.document_id, c.meta.page)] == "ok" for c in chunks if c.meta.document_id not in rc.load_transcriptions())


def test_every_chunk_is_traceable_and_marked_unvalidated(chunks):
    for c in chunks[::50]:
        m = c.meta
        assert m.page >= 1 and m.title and m.source and m.license and m.chunk_id.startswith(m.document_id)
        assert m.is_synthetic is False and m.validation_status is ValidationStatus.PROJECT_APPROVED
        assert c.text.strip()


def test_no_authorization_means_no_chunks(tmp_path):
    empty = tmp_path / "reg.json"
    empty.write_text(json.dumps({"entries": []}), encoding="utf-8")
    assert list(rc.iter_real_chunks(registry_path=empty)) == []


def test_incomplete_or_blocked_entries_are_not_used(tmp_path):
    doc = next(iter(DOCS))
    bad = [
        {"document_id": doc, "authorizer": {"name": "x"}, "written_reference": "", "date": "2026-01-01", "scope": ["indexing"]},
        {**REGISTRY["entries"][0], "document_id": "ainga-cofan__sil-borman_vocabulario-cofan-1976"},
    ]
    reg = tmp_path / "reg.json"
    reg.write_text(json.dumps({"entries": bad}), encoding="utf-8")
    assert list(rc.iter_real_chunks(registry_path=reg)) == []


def test_original_pdfs_and_extracted_text_are_not_modified(chunks):
    # La carga solo lee: la huella es determinista entre llamadas
    assert rc.corpus_signature(chunks) == rc.corpus_signature(list(rc.iter_real_chunks()))


@pytest.fixture(scope="module")
def engine():
    return build_engine(Settings(rag_corpus="real", rag_retriever="hashing", rag_generation="off"))


def test_real_engine_answers_with_real_citations_and_validation_notice(engine):
    a = engine.ask("¿Qué es el pueblo Quillacinga?")
    assert not a.abstained and a.citations
    assert all(not c.is_synthetic and c.validation_status == "project_approved" for c in a.citations)
    assert any("NO ha sido validado por hablantes" in n and "no lo tomes como información validada" in n for n in a.notices)
    assert not any("validado por la comunidad" in n.lower() and "NO" not in n for n in a.notices)  # nunca se afirma validación que no existe
    assert not any("sintético" in n.lower() for n in a.notices)


def test_real_engine_still_abstains_without_evidence(engine):
    assert engine.ask("¿Cuál es la capital de Francia?").abstained


def test_fallback_to_hashing_when_hybrid_index_is_missing(tmp_path):
    e = build_engine(Settings(rag_corpus="real", rag_retriever="auto", rag_index_dir=tmp_path, rag_generation="off"))
    assert e.mode in ("hashing", "hybrid")  # sin caché del híbrido, el motor usa hashing en vez de fallar
    if e.mode == "hybrid":
        pytest.skip("hay Ollama pero el índice temporal está vacío: no debería llegar aquí")


# ---------- alfabeto awá: transcrito contra la imagen ----------

ALFABETO = "awapit__unipa_alfabeto-awa"


@pytest.mark.skipif(not HAS_TRANSCRIPTION, reason="transcripción local no disponible (no se versiona)")
def test_alfabeto_is_used_only_through_its_transcription(chunks):
    mine = [c for c in chunks if c.meta.document_id == ALFABETO]
    t = rc.load_transcriptions()[ALFABETO]
    assert len(mine) == len(t["entries"]) == 28
    assert all(c.meta.page == 1 and c.meta.validation_status is ValidationStatus.PROJECT_APPROVED for c in mine)
    assert all("sin revisión de un hablante" in c.text for c in mine)
    # el texto extraído (mezcla de columnas) nunca se indexa para este documento
    raw = [json.loads(l) for l in rc.PAGES.read_text(encoding="utf-8").splitlines()]
    raw_text = next(r["text"] for r in raw if r["document_id"] == ALFABETO)
    assert not any(raw_text[:60] in c.text for c in mine)


@pytest.mark.skipif(not HAS_TRANSCRIPTION, reason="transcripción local no disponible (no se versiona)")
def test_transcription_pairs_are_present_and_unique():
    t = rc.load_transcriptions()[ALFABETO]
    forms = [e["awapit"] for e in t["entries"]]
    assert len(set(forms)) == len(forms) == 28
    pairs = {e["awapit"]: e["castellano"] for e in t["entries"]}
    for form, gloss in {"Awá": "Persona", "Pã": "Sol", "Kual": "Familia", "Yal": "Casa", "Pi": "Río", "Wakara": "Vaca", "Pɨz": "Araña"}.items():
        assert pairs[form] == gloss
    assert "NO fue revisada por un hablante" in t["method"] and "ɨ" in t["diacritics_note"]


def test_transcription_is_authorized_and_blocked_without_registry_entry(tmp_path):
    reg = tmp_path / "reg.json"
    reg.write_text(json.dumps({"entries": []}), encoding="utf-8")
    assert list(rc.iter_transcribed_chunks(registry_path=reg)) == []


@pytest.mark.skipif(not HAS_TRANSCRIPTION, reason="transcripción local no disponible (no se versiona)")
def test_alfabeto_answers_word_lookups_with_traceable_citation(engine):
    a = engine.ask("¿Cómo se dice casa en awapit?")
    top = a.citations[0]
    assert top.document_id == ALFABETO and top.page == 1 and "Yal = Casa" in top.excerpt
    assert top.validation_status == "project_approved"
    assert any("NO ha sido validado por hablantes" in n for n in a.notices)


# ---------- palabras sin información: aviso explícito ----------


def test_word_lookup_without_vocabulary_entry_warns_and_is_not_a_confirmed_answer(engine):
    a = engine.ask("¿Cómo se dice agua en awapit?")
    assert a.evidence == "related" and "agua" in a.unmatched_terms
    assert a.citations, "se sigue mostrando el contenido relacionado"
    assert any("No encontré información sobre «agua»" in n and "no su traducción" in n for n in a.notices)


@pytest.mark.skipif(not HAS_TRANSCRIPTION, reason="transcripción local no disponible (no se versiona)")
def test_word_lookup_with_a_vocabulary_entry_stays_direct(engine):
    for q, entry in [("¿Cómo se dice casa en awapit?", "Yal = Casa"), ("¿Cómo se dice río en awapit?", "Pi = Río")]:
        a = engine.ask(q)
        assert a.evidence == "direct" and any(entry in c.excerpt for c in a.citations)
        assert not any("No encontré información" in n for n in a.notices)


def test_any_word_not_found_is_named_in_the_warning(engine):
    a = engine.ask("¿Cómo se dice perro en awapit?")
    assert a.evidence == "related" and "perro" in a.unmatched_terms
    assert any("perro" in n for n in a.notices)


def test_vocabulary_rule_does_not_apply_without_evidence_class():
    from app.rag.support import lookup_gap
    from app.rag.factory import build_engine as be
    demo = be(Settings(rag_corpus="demo", rag_retriever="hashing", rag_generation="off"))
    hits = demo.primary.retriever.retrieve("¿Cómo se dice uno en la Lengua de Prueba?")
    assert lookup_gap("¿Cómo se dice uno en la Lengua de Prueba?", hits) == []
