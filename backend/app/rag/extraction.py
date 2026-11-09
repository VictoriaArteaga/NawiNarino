"""Extracción de texto por página. Nunca modifica el archivo original."""

import re
import shutil
import subprocess
from pathlib import Path

PAGE_MARKER = re.compile(r"^\s*\[\[\s*p[aá]gina\s+(\d+)\s*\]\]\s*$", re.I | re.M)


class ExtractionError(Exception):
    pass


def extract_text_file(path: Path) -> list[tuple[int, str]]:
    """``.txt``/``.md``: páginas marcadas con ``[[pagina N]]``; si no hay
    marcas, un solo texto en la página 1."""
    text = path.read_text(encoding="utf-8")
    parts = PAGE_MARKER.split(text)
    if len(parts) == 1:
        return [(1, text)]
    return [(int(parts[i]), parts[i + 1]) for i in range(1, len(parts), 2)]


def extract_pdf(path: Path) -> list[tuple[int, str]]:
    exe = shutil.which("pdftotext")
    if exe is None:
        raise ExtractionError("pdftotext no está disponible en PATH")
    result = subprocess.run(
        [exe, "-enc", "UTF-8", "-layout", str(path), "-"],
        capture_output=True,
        check=False,
    )
    if result.returncode != 0:
        raise ExtractionError(result.stderr.decode("utf-8", "replace"))
    text = result.stdout.decode("utf-8", "replace")
    # pdftotext separa páginas con form feed; la última división es vacía.
    pages = text.split("\f")
    if pages and not pages[-1].strip():
        pages.pop()
    return [(i + 1, p) for i, p in enumerate(pages)]


def extract_pages(path: Path) -> list[tuple[int, str]]:
    suffix = path.suffix.lower()
    if suffix in {".txt", ".md"}:
        return extract_text_file(path)
    if suffix == ".pdf":
        return extract_pdf(path)
    raise ExtractionError(f"Formato no soportado: {suffix}")
