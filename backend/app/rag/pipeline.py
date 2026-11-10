"""Orquestación: manifiesto -> permisos -> extracción -> chunks -> índice."""

import json
from dataclasses import dataclass, field
from pathlib import Path

from pydantic import ValidationError

from app.rag.chunking import split_page
from app.rag.embeddings import Embedder, HashingEmbedder
from app.rag.exclusion import ExcludedBlock, UnknownTagError, partition_page
from app.rag.extraction import ExtractionError, extract_pages
from app.rag.generation import Answer, build_answer
from app.rag.metadata import (
    ChunkMetadata,
    DocumentMetadata,
    IndexingNotAllowedError,
    assert_indexable,
)
from app.rag.retrieval import Hit, Retriever
from app.rag.vectorstore import IndexedChunk, VectorStore


@dataclass
class IngestReport:
    indexed: dict[str, int] = field(default_factory=dict)  # documento -> chunks
    rejected: dict[str, str] = field(default_factory=dict)  # documento -> motivo
    # documento -> bloques marcados como no indexables (avisos, notas...)
    excluded: dict[str, list[ExcludedBlock]] = field(default_factory=dict)


def ingest_manifest(
    manifest_path: Path, embedder: Embedder, store: VectorStore
) -> IngestReport:
    """Indexa los documentos del manifiesto que pasen la puerta de permisos.

    Cada entrada: ``{"file": "ruta relativa", "metadata": {...}}``.
    Los archivos fuente se leen, nunca se escriben.
    """
    report = IngestReport()
    entries = json.loads(manifest_path.read_text(encoding="utf-8"))
    for entry in entries:
        doc_id = entry.get("metadata", {}).get("document_id", "<sin id>")
        try:
            meta = DocumentMetadata.model_validate(entry["metadata"])
            assert_indexable(meta)
            pages = extract_pages(manifest_path.parent / entry["file"])
        except (ValidationError, KeyError) as exc:
            report.rejected[doc_id] = f"metadatos inválidos: {exc}"
            continue
        except IndexingNotAllowedError as exc:
            report.rejected[doc_id] = str(exc)
            continue
        except (ExtractionError, OSError) as exc:
            report.rejected[doc_id] = f"extracción fallida: {exc}"
            continue
        try:
            parts = [(page, *partition_page(page, text)) for page, text in pages]
        except UnknownTagError as exc:
            report.rejected[meta.document_id] = f"etiqueta no reconocida: {exc}"
            continue
        count = 0
        for page, text, excluded in parts:
            if excluded:
                report.excluded.setdefault(meta.document_id, []).extend(excluded)
            for n, chunk_text in enumerate(split_page(text), start=1):
                chunk_meta = ChunkMetadata(
                    chunk_id=f"{meta.document_id}::p{page:04d}::c{n:02d}",
                    document_id=meta.document_id,
                    title=meta.title,
                    language=meta.language,
                    content_type=meta.content_type,
                    source=meta.source,
                    author=meta.author,
                    year=meta.year,
                    license=meta.license,
                    access_level=meta.access_level,
                    validation_status=meta.validation_status,
                    page=page,
                    is_synthetic=meta.is_synthetic,
                )
                store.add(
                    IndexedChunk(
                        metadata=chunk_meta,
                        text=chunk_text,
                        vector=embedder.embed(chunk_text),
                    )
                )
                count += 1
        report.indexed[meta.document_id] = count
    return report


class RagPipeline:
    def __init__(
        self,
        embedder: Embedder | None = None,
        top_k: int = 4,
        min_score: float = 0.15,
        min_overlap: int = 1,
        relative_min: float = 0.85,
        min_coverage: float = 0.0,
    ) -> None:
        self.embedder = embedder or HashingEmbedder()
        self.store = VectorStore(self.embedder.name, self.embedder.dim)
        self.retriever = Retriever(
            self.store,
            self.embedder,
            top_k=top_k,
            min_score=min_score,
            min_overlap=min_overlap,
            relative_min=relative_min,
            min_coverage=min_coverage,
        )

    def use_store(self, store: VectorStore) -> None:
        """Sustituye el almacén (p. ej. uno cargado de caché) manteniendo el recuperador."""
        self.store = store
        self.retriever.store = store

    def ingest(self, manifest_path: Path) -> IngestReport:
        return ingest_manifest(manifest_path, self.embedder, self.store)

    def ask_with_hits(
        self,
        question: str,
        language: str | None = None,
        content_type: str | None = None,
    ) -> tuple[list[Hit], Answer]:
        """Recuperación + respuesta extractiva; devuelve también los fragmentos (para generar)."""
        hits = self.retriever.retrieve(question, language, content_type)
        return hits, build_answer(question, hits)

    def ask(
        self,
        question: str,
        language: str | None = None,
        content_type: str | None = None,
    ) -> Answer:
        return self.ask_with_hits(question, language, content_type)[1]
