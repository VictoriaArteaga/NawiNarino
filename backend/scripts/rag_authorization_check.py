"""Compuerta de autorización para documentos REALES (no indexa nada).

Lee rag_data/real/authorizations.json y corpus/_rag/documents.json e informa qué
documentos están habilitados para indexación y evaluación. Un documento solo
queda habilitado si su entrada del registro tiene TODO lo siguiente:
  document_id           existente en corpus/_rag/documents.json
  authorizer            {name, role, institution} de quien autoriza (titular de derechos o representante)
  written_reference     identificador del documento de autorización archivado (carta, correo, acuerdo)
  date                  fecha ISO (AAAA-MM-DD), no futura
  scope                 contiene "indexing", "evaluation" y "quoting_excerpts"
  (opcional) conditions texto de condiciones; validator {name, role, date} para validación lingüística
Borman y los ids de app.rag.metadata.BLOCKED_DOCUMENT_IDS no se habilitan nunca.

    python -m scripts.rag_authorization_check        # código de salida 1 si no hay ninguno habilitado
"""

import argparse
import json
import sys
from datetime import date
from pathlib import Path

from app.rag.metadata import BLOCKED_DOCUMENT_IDS

ROOT = Path(__file__).resolve().parents[2]
DOCUMENTS = ROOT / "corpus" / "_rag" / "documents.json"
REGISTRY = Path(__file__).resolve().parents[1] / "rag_data" / "real" / "authorizations.json"
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
    return {
        e["document_id"]: e for e in registry.get("entries", []) if "document_id" in e and not problems(e, known_ids)
    }


def load(registry_path: Path = REGISTRY, documents_path: Path = DOCUMENTS) -> tuple[dict, set[str], list[dict]]:
    registry = json.loads(registry_path.read_text(encoding="utf-8"))
    docs = json.loads(documents_path.read_text(encoding="utf-8"))
    return registry, {d["document_id"] for d in docs}, docs


def require_cleared(document_ids: list[str], registry: dict, known_ids: set[str]) -> None:
    """Lanza si algún documento no está habilitado (úsese antes de leer/indexar un PDF real)."""
    cleared = cleared_documents(registry, known_ids)
    blocked = [d for d in document_ids if d not in cleared]
    if blocked:
        raise NotAuthorizedError(f"Sin autorización escrita verificable: {blocked}")


def main(argv: list[str] | None = None) -> int:
    argparse.ArgumentParser(description=__doc__).parse_args(argv)
    registry, known, _ = load()
    cleared = cleared_documents(registry, known)
    print(f"Documentos en el corpus: {len(known)}; entradas en el registro: {len(registry.get('entries', []))}; habilitados: {len(cleared)}")
    for e in registry.get("entries", []):
        p = problems(e, known)
        print(f"  {e.get('document_id', '<sin id>')}: {'HABILITADO' if not p else 'NO: ' + '; '.join(p)}")
    if not cleared:
        print("BLOQUEADO: ningún documento real tiene autorización escrita registrada; no se indexa ni se evalúa nada real.")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
