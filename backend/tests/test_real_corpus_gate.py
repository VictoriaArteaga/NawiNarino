"""Compuerta de autorización para documentos reales (etapa 7).

Garantiza que, sin autorización escrita registrada, ningún documento real
puede considerarse habilitado ni indexarse por error.
"""

import json
from pathlib import Path

import pytest

from app.core.config import get_settings
from app.rag.metadata import BLOCKED_DOCUMENT_IDS
from scripts import rag_authorization_check as gate

BACKEND = Path(__file__).resolve().parents[1]
KNOWN = {"awapit__unipa_alfabeto-awa", "ainga-cofan__sil-borman_vocabulario-cofan-1976",
         "ainga-cofan__fischer-hengeveld_open-linguistics_operators_2018"}


def entry(**over):
    e = {"document_id": "awapit__unipa_alfabeto-awa",
         "authorizer": {"name": "Persona X", "role": "Representante", "institution": "Institución Y"},
         "written_reference": "carta-2026-001", "date": "2026-01-15",
         "scope": ["indexing", "evaluation", "quoting_excerpts"]}
    e.update(over)
    return e


def test_registry_clears_only_usable_documents_and_never_borman():
    registry, known, _ = gate.load()
    cleared = gate.cleared_documents(registry, known)
    assert cleared and not (set(cleared) & BLOCKED_DOCUMENT_IDS)
    assert all(e["written_reference"] and "PENDIENTES" in e["conditions"] for e in cleared.values())


def test_every_real_document_is_still_unauthorized_in_the_corpus_register():
    docs = json.loads(gate.DOCUMENTS.read_text(encoding="utf-8"))
    assert {d["access_level"] for d in docs} <= {"internal_use_only", "community_permission_required", "open_with_conditions"}
    assert not any(d.get("indexing_authorized") for d in docs)


def test_complete_entry_is_cleared_incomplete_ones_are_not():
    assert gate.problems(entry(), KNOWN) == []
    assert gate.problems(entry(written_reference=""), KNOWN)
    assert gate.problems(entry(authorizer={"name": "X"}), KNOWN)
    assert gate.problems(entry(scope=["indexing"]), KNOWN)
    assert gate.problems(entry(date="2999-01-01"), KNOWN)
    assert gate.problems(entry(date=""), KNOWN)
    assert gate.problems(entry(document_id="inexistente"), KNOWN)


def test_borman_is_never_cleared_even_with_a_complete_entry():
    borman = "ainga-cofan__sil-borman_vocabulario-cofan-1976"
    assert borman in BLOCKED_DOCUMENT_IDS
    assert gate.problems(entry(document_id=borman), KNOWN)
    assert gate.cleared_documents({"entries": [entry(document_id=borman)]}, KNOWN) == {}


def test_require_cleared_refuses_uncleared_documents():
    with pytest.raises(gate.NotAuthorizedError):
        gate.require_cleared(["awapit__unipa_alfabeto-awa"], {"entries": []}, KNOWN)
    gate.require_cleared(["awapit__unipa_alfabeto-awa"], {"entries": [entry()]}, KNOWN)  # no lanza


def test_script_reports_cleared_documents(capsys):
    assert gate.main([]) == 0
    assert "habilitados:" in capsys.readouterr().out


def test_no_real_manifest_exists_and_production_manifest_is_synthetic_only():
    assert not list((BACKEND / "rag_data" / "real").glob("manifest*.json"))
    entries = json.loads(get_settings().rag_manifest_path.read_text(encoding="utf-8"))
    assert {e["metadata"]["access_level"] for e in entries} == {"synthetic"}
