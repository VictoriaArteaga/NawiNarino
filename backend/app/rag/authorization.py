"""Compuerta de autorización para documentos REALES (registro en rag_data/real/authorizations.json).

Un documento solo se habilita si su entrada del registro tiene: ``document_id`` existente, ``authorizer``
{name, role, institution}, ``written_reference``, ``date`` ISO no futura y ``scope`` ⊇ {indexing, evaluation,
quoting_excerpts}. Borman y los ids de ``BLOCKED_DOCUMENT_IDS`` nunca se habilitan.

Honestidad del registro: ``authorizer.role`` debe decir quién autoriza realmente. Una decisión del responsable
del proyecto para un uso local de demostración NO equivale al permiso de los titulares de derechos o de las
comunidades; esa diferencia debe constar en ``conditions``.
"""

import json
from datetime import date
from pathlib import Path

from app.rag.metadata import BLOCKED_DOCUMENT_IDS

REQUIRED_SCOPE = {"indexing", "evaluation", "quoting_excerpts"}


class NotAuthorizedError(Exception):
    pass


def problems(entry: dict, known_ids: set[str]) -> list[str]:
    out: list[str] = []
    doc = entry.get("document_id", "")
    if doc not in known_ids:
        out.append("document_id no existe en corpus/_rag/documents.json")
    if doc in BLOCKED_DOCUMENT_IDS:
        out.append("documento bloqueado explícitamente")
    a = entry.get("authorizer") or {}
    if not all(a.get(k) for k in ("name", "role", "institution")):
        out.append("falta authorizer {name, role, institution}")
    if not entry.get("written_reference"):
        out.append("falta written_reference (documento de autorización archivado)")
    try:
        if date.fromisoformat(entry.get("date", "")) > date.today():
            out.append("fecha futura")
    except ValueError:
        out.append("falta fecha ISO válida")
    missing = REQUIRED_SCOPE - set(entry.get("scope") or [])
    if missing:
        out.append(f"scope incompleto, falta: {sorted(missing)}")
    return out


def cleared_documents(registry: dict, known_ids: set[str]) -> dict[str, dict]:
    return {e["document_id"]: e for e in registry.get("entries", []) if "document_id" in e and not problems(e, known_ids)}


def require_cleared(document_ids: list[str], registry: dict, known_ids: set[str]) -> None:
    cleared = cleared_documents(registry, known_ids)
    blocked = [d for d in document_ids if d not in cleared]
    if blocked:
        raise NotAuthorizedError(f"Sin autorización escrita verificable: {blocked}")


def load_registry(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))
