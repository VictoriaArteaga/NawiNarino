"""Corpus REAL (corpus/_rag) para la demostración local, con compuerta de autorización y filtros de calidad.

Lee ``corpus/_rag/pages.jsonl`` (texto ya extraído por página; los PDF originales no se tocan) y solo conserva:
  * documentos habilitados en ``rag_data/real/authorizations.json``;
  * documentos con transcripción contra la imagen (``rag_data/real/transcriptions/``), que sustituyen a su texto extraído;
  * páginas con ``page_quality == "ok"`` (se descartan vacías y con OCR ruidoso: las formas en lenguas indígenas
    de esas páginas no son fiables);
  * fragmentos de al menos 100 caracteres (sin encabezados ni números de página sueltos);
  * documentos cuya clase de evidencia admite uso como fuente (se excluyen referencias bibliográficas, propuestas
    técnicas, texto comunitario sin traducir, material sin leer/transcribir y lo pendiente de revisión manual).
Todo queda como ``project_approved`` (la revisión pendiente se da por aprobada por el responsable del proyecto) y
``local_demo_only``: NO es información validada por hablantes, especialistas ni comunidades.
``page`` es el índice de página del PDF (1 = primera), no la numeración impresa.
"""

import hashlib
import json
from collections.abc import Iterator
from dataclasses import dataclass
from pathlib import Path

from app.rag.authorization import cleared_documents, load_registry
from app.rag.chunking import split_page
from app.rag.metadata import (
    BLOCKED_DOCUMENT_IDS, AccessLevel, ChunkMetadata, ContentType, DocumentMetadata, ValidationStatus, assert_indexable,
)

ROOT = Path(__file__).resolve().parents[3]
DOCUMENTS = ROOT / "corpus" / "_rag" / "documents.json"
PAGES = ROOT / "corpus" / "_rag" / "pages.jsonl"
REGISTRY = ROOT / "backend" / "rag_data" / "real" / "authorizations.json"
TRANSCRIPTIONS = ROOT / "backend" / "rag_data" / "real" / "transcriptions"

NON_EVIDENCE_CLASSES = frozenset(
    {"bibliographic_reference", "technical_proposal", "community_text_untranslated", "audio_unverified"}
)
BLOCKED_OCR = frozenset({"required", "transcription_required", "manual_review"})
MIN_CHUNK_CHARS = 100  # descarta encabezados, números de página y títulos sueltos (puntúan alto sin aportar contenido)


@dataclass(frozen=True)
class RealChunk:
    meta: ChunkMetadata
    text: str


def load_transcriptions(directory: Path = TRANSCRIPTIONS) -> dict[str, dict]:
    """Transcripciones hechas contra la imagen (sustituyen al texto extraído poco fiable de ese documento)."""
    out: dict[str, dict] = {}
    if directory.exists():
        for f in sorted(directory.glob("*.json")):
            t = json.loads(f.read_text(encoding="utf-8"))
            out[t["document_id"]] = t
    return out


def transcription_texts(t: dict) -> list[str]:
    """Un fragmento por entrada (mejor recuperación), cada uno con la aclaración de su método."""
    return [
        "Alfabeto Awá (lámina de UNIPA; transcripción contra la imagen, sin revisión de un hablante). "
        f"Awapit = castellano: {e['awapit']} = {e['castellano']}."
        for e in t["entries"]
    ]


def document_exclusion(doc: dict, transcribed: frozenset[str] = frozenset()) -> str | None:
    """Motivo por el que un documento NO se usa como fuente, o None."""
    if doc["document_id"] in BLOCKED_DOCUMENT_IDS:
        return "bloqueado explícitamente"
    if doc["document_id"] in transcribed:
        return None  # el texto extraído no es fiable, pero existe una transcripción contra la imagen
    cls = doc["evidence_class"]
    if cls in NON_EVIDENCE_CLASSES or cls.endswith("_unread"):
        return f"clase de evidencia no usable como fuente ({cls})"
    if doc.get("ocr_action") in BLOCKED_OCR:
        return f"OCR/revisión pendiente ({doc['ocr_action']})"
    return None


def page_exclusion(row: dict) -> str | None:
    return None if row["page_quality"] == "ok" else f"página {row['page_quality']}"


def _meta(doc: dict, ref: str) -> DocumentMetadata:
    return DocumentMetadata(
        document_id=doc["document_id"], title=doc["title"], language=doc["language"],
        content_type=ContentType(doc["category"]), source=doc["source"], author=doc.get("authors"), year=doc.get("year"),
        license=doc["license"], access_level=AccessLevel(doc["access_level"]), indexing_authorized=True,
        authorization_ref=ref, validation_status=ValidationStatus.PROJECT_APPROVED, local_demo_only=True,
    )


def iter_real_chunks(
    documents_path: Path = DOCUMENTS, pages_path: Path = PAGES, registry_path: Path = REGISTRY
) -> Iterator[RealChunk]:
    yield from _iter_pdf_chunks(documents_path, pages_path, registry_path)
    yield from iter_transcribed_chunks(documents_path, registry_path)


def _iter_pdf_chunks(
    documents_path: Path = DOCUMENTS, pages_path: Path = PAGES, registry_path: Path = REGISTRY
) -> Iterator[RealChunk]:
    docs = {d["document_id"]: d for d in json.loads(documents_path.read_text(encoding="utf-8"))}
    cleared = cleared_documents(load_registry(registry_path), set(docs))
    transcriptions = load_transcriptions()
    metas: dict[str, DocumentMetadata] = {}
    for doc_id, entry in cleared.items():
        if document_exclusion(docs[doc_id], frozenset(transcriptions)) is None:
            metas[doc_id] = _meta(docs[doc_id], entry["written_reference"])
            assert_indexable(metas[doc_id])  # puerta de permisos (lanza si falta algo)
    with pages_path.open(encoding="utf-8") as f:
        for line in f:
            row = json.loads(line)
            meta = metas.get(row["document_id"])
            if meta is None or row["document_id"] in transcriptions or page_exclusion(row):
                continue  # los documentos transcritos se agregan al final, desde la transcripción
            for n, text in enumerate(split_page(row["text"]), start=1):
                if len(text) < MIN_CHUNK_CHARS:
                    continue
                yield RealChunk(
                    ChunkMetadata(
                        chunk_id=f"{meta.document_id}::p{row['page']:04d}::c{n:02d}", document_id=meta.document_id,
                        title=meta.title, language=meta.language, content_type=meta.content_type, source=meta.source,
                        author=meta.author, year=meta.year, license=meta.license, access_level=meta.access_level,
                        validation_status=meta.validation_status, page=row["page"], is_synthetic=False,
                        evidence_class=docs[meta.document_id]["evidence_class"],
                    ),
                    text,
                )


def corpus_signature(chunks: list[RealChunk]) -> str:
    h = hashlib.sha256()
    for c in chunks:
        h.update(c.meta.chunk_id.encode())
        h.update(c.text.encode())
    return h.hexdigest()[:16]


def iter_transcribed_chunks(
    documents_path: Path = DOCUMENTS, registry_path: Path = REGISTRY
) -> Iterator[RealChunk]:
    """Fragmentos de los documentos transcritos (habilitados en el registro). Se emiten al final para no alterar el resto."""
    docs = {d["document_id"]: d for d in json.loads(documents_path.read_text(encoding="utf-8"))}
    cleared = cleared_documents(load_registry(registry_path), set(docs))
    for doc_id, t in load_transcriptions().items():
        if doc_id not in cleared or doc_id in BLOCKED_DOCUMENT_IDS:
            continue
        meta = _meta(docs[doc_id], cleared[doc_id]["written_reference"])
        assert_indexable(meta)
        for n, text in enumerate(transcription_texts(t), start=1):
            yield RealChunk(
                ChunkMetadata(
                    chunk_id=f"{doc_id}::p{t['page']:04d}::c{n:02d}", document_id=doc_id, title=meta.title,
                    language=meta.language, content_type=meta.content_type, source=meta.source, author=meta.author,
                    year=meta.year, license=meta.license, access_level=meta.access_level,
                    validation_status=meta.validation_status, page=t["page"], is_synthetic=False,
                    evidence_class=docs[doc_id]["evidence_class"],
                ),
                text,
            )
