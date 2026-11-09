"""Separación de contenido NO indexable (avisos, notas, instrucciones).

Un párrafo se excluye del índice solo si el autor del documento lo marca con
una etiqueta explícita al inicio: ``[[editorial]]``, ``[[revision]]``,
``[[advertencia]]``, ``[[interno]]`` o ``[[metadatos]]``. No hay heurística
por palabras: un filtro automático podría descartar contenido lingüístico
legítimo (p. ej. un ejemplo que contenga la palabra «aviso»).

El archivo original no se modifica: el texto excluido sigue en él y se
informa en el reporte de ingesta (documento, página, etiqueta, texto).
"""

import re
from dataclasses import dataclass

from app.rag.cleaning import clean_text

NON_INDEXABLE_TAGS = frozenset(
    {"editorial", "revision", "advertencia", "interno", "metadatos"}
)
_LEADING_TAG = re.compile(r"^\[\[\s*([^\]\s]+)\s*\]\]\s*", re.UNICODE)


class UnknownTagError(ValueError):
    """Etiqueta ``[[...]]`` desconocida: se rechaza en vez de indexarla."""


@dataclass(frozen=True)
class ExcludedBlock:
    page: int
    tag: str
    text: str


def partition_page(page: int, text: str) -> tuple[str, list[ExcludedBlock]]:
    """Devuelve (texto indexable, bloques excluidos) de una página."""
    kept: list[str] = []
    excluded: list[ExcludedBlock] = []
    for paragraph in re.split(r"\n\s*\n", clean_text(text)):
        paragraph = paragraph.strip()
        if not paragraph:
            continue
        match = _LEADING_TAG.match(paragraph)
        if match is None:
            kept.append(paragraph)
            continue
        tag = match.group(1).lower().replace("ó", "o")
        if tag not in NON_INDEXABLE_TAGS:
            raise UnknownTagError(
                f"página {page}: etiqueta desconocida [[{match.group(1)}]]"
            )
        excluded.append(ExcludedBlock(page, tag, paragraph[match.end():].strip()))
    return "\n\n".join(kept), excluded
