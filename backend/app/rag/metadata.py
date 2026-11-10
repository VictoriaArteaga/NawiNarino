"""Esquema de metadatos y puerta de indexación (permisos)."""

from enum import Enum

from pydantic import BaseModel, Field, model_validator


class ContentType(str, Enum):
    LINGUISTIC = "linguistico"
    CULTURAL_TERRITORIAL = "cultural_territorial"
    HISTORICAL = "historico"
    SOCIOLINGUISTIC = "sociolinguistico"
    BIBLIOGRAPHIC = "referencia_bibliografica"


class AccessLevel(str, Enum):
    """Mismos valores que ``corpus/_rag/documents.json`` + ``synthetic``."""

    SYNTHETIC = "synthetic"
    OPEN_WITH_CONDITIONS = "open_with_conditions"
    INTERNAL_USE_ONLY = "internal_use_only"
    COMMUNITY_PERMISSION_REQUIRED = "community_permission_required"


class ValidationStatus(str, Enum):
    SYNTHETIC = "synthetic"
    PENDING = "pending_validation"
    # Aprobado por el RESPONSABLE DEL PROYECTO para la demostración local. NO es validación de hablantes,
    # de especialistas ni de las comunidades: no debe presentarse como tal.
    PROJECT_APPROVED = "project_approved"
    SPECIALIST_VALIDATED = "specialist_validated"
    COMMUNITY_VALIDATED = "community_validated"


# Documentos que NO deben indexarse aunque alguien marque una autorización.
BLOCKED_DOCUMENT_IDS: frozenset[str] = frozenset(
    {"ainga-cofan__sil-borman_vocabulario-cofan-1976"}
)


class DocumentMetadata(BaseModel):
    document_id: str = Field(min_length=1)
    title: str = Field(min_length=1)
    language: str = Field(min_length=1)
    content_type: ContentType
    source: str = Field(min_length=1)
    author: str | None = None
    year: int | None = None
    license: str = Field(min_length=1)
    access_level: AccessLevel
    indexing_authorized: bool = False
    authorization_ref: str | None = None
    validation_status: ValidationStatus = ValidationStatus.PENDING
    # Documento real habilitado SOLO para una demostración académica local (sin redistribución).
    local_demo_only: bool = False

    @model_validator(mode="after")
    def check_consistency(self) -> "DocumentMetadata":
        synthetic = self.access_level is AccessLevel.SYNTHETIC
        if synthetic != (self.validation_status is ValidationStatus.SYNTHETIC):
            raise ValueError(
                "access_level 'synthetic' y validation_status 'synthetic' "
                "deben ir juntos"
            )
        return self

    @property
    def is_synthetic(self) -> bool:
        return self.access_level is AccessLevel.SYNTHETIC


class IndexingNotAllowedError(Exception):
    """El documento no tiene permiso confirmado de indexación."""


def assert_indexable(meta: DocumentMetadata) -> None:
    """Puerta de indexación. Lanza si el permiso no está confirmado."""
    if meta.document_id in BLOCKED_DOCUMENT_IDS:
        raise IndexingNotAllowedError(
            f"{meta.document_id}: bloqueado explícitamente (permisos y "
            "calidad de OCR sin resolver)"
        )
    if meta.is_synthetic:
        return
    if not meta.indexing_authorized or not meta.authorization_ref:
        raise IndexingNotAllowedError(
            f"{meta.document_id}: sin autorización expresa de indexación "
            "(se requiere indexing_authorized=true y authorization_ref)"
        )
    if (
        meta.access_level is AccessLevel.COMMUNITY_PERMISSION_REQUIRED
        and meta.validation_status is ValidationStatus.PENDING
        and not meta.local_demo_only
    ):
        raise IndexingNotAllowedError(
            f"{meta.document_id}: requiere permiso comunitario y validación"
        )


class ChunkMetadata(BaseModel):
    """Metadatos que viajan con cada fragmento (trazabilidad)."""

    chunk_id: str
    document_id: str
    title: str
    language: str
    content_type: ContentType
    source: str
    author: str | None
    year: int | None
    license: str
    access_level: AccessLevel
    validation_status: ValidationStatus
    page: int  # número de página del archivo (1 = primera)
    is_synthetic: bool
    # Clase de evidencia del documento (corpus real): permite distinguir fuentes de vocabulario de textos sobre el tema.
    evidence_class: str | None = None
