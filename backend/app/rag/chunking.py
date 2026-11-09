"""Fragmentación por página: un fragmento nunca cruza una página."""

import re

from app.rag.cleaning import clean_text

_SENTENCE = re.compile(r"(?<=[.!?])\s+")


def split_page(text: str, max_chars: int = 600) -> list[str]:
    """Agrupa párrafos hasta ``max_chars``; divide por oraciones lo largo."""
    text = clean_text(text)
    if not text:
        return []
    units: list[str] = []
    for paragraph in re.split(r"\n\s*\n", text):
        paragraph = " ".join(paragraph.split())
        if not paragraph:
            continue
        if len(paragraph) <= max_chars:
            units.append(paragraph)
        else:
            units.extend(s for s in _SENTENCE.split(paragraph) if s)
    chunks: list[str] = []
    current = ""
    for unit in units:
        while len(unit) > max_chars:  # oración gigante: corte duro
            if current:
                chunks.append(current)
                current = ""
            chunks.append(unit[:max_chars])
            unit = unit[max_chars:]
        if current and len(current) + 1 + len(unit) > max_chars:
            chunks.append(current)
            current = unit
        else:
            current = f"{current} {unit}".strip()
    if current:
        chunks.append(current)
    return chunks
