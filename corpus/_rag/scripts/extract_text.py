"""Fase de preparacion RAG: extrae texto por pagina de cada PDF y mide su calidad.

Solo LEE los originales en corpus/<lengua>/. Escribe unicamente en corpus/_rag/.
Requiere `pdftotext` (poppler) en el PATH. Sin OCR: los documentos sin capa de
texto se marcan, no se transcriben.

Uso: python extract_text.py
"""
import json
import re
import subprocess
import sys
from pathlib import Path

CORPUS = Path(__file__).resolve().parents[2]
OUT_TEXT = CORPUS / "_rag" / "text"
FOLDERS = ["nasa-yuwe", "awapit", "ainga-cofan", "inga", "pasto-quillasinga"]

# Palabras funcionales para estimar si el texto "parece" espanol/ingles legible
ES = set("de la el en y que los las del se por con para un una es al lo como mas su sus o este esta son".split())
EN = set("the of and in to a is that for with as by on are this from or an be which at it was".split())


def extract_pages(pdf: Path) -> list[str]:
    r = subprocess.run(
        ["pdftotext", "-enc", "UTF-8", str(pdf), "-"],
        capture_output=True, timeout=1800,
    )
    text = r.stdout.decode("utf-8", errors="replace")
    pages = text.split("\f")
    if pages and pages[-1].strip() == "":
        pages = pages[:-1]
    return pages


def page_metrics(t: str) -> dict:
    chars = len(t)
    letters = sum(c.isalpha() for c in t)
    repl = t.count("�")
    words = re.findall(r"[^\W\d_]+", t.lower())
    nw = len(words)
    fw = sum(w in ES or w in EN for w in words)
    # tokens con digitos pegados a letras ("gra111n1ar") = tipico de OCR malo
    mixed = len(re.findall(r"\b(?=[A-Za-z]*\d)(?=\d*[A-Za-z])[A-Za-z0-9]{4,}\b", t))
    return {
        "chars": chars,
        "words": nw,
        "alpha_ratio": round(letters / chars, 3) if chars else 0.0,
        "replacement_chars": repl,
        "function_word_ratio": round(fw / nw, 3) if nw else 0.0,
        "mixed_alnum_tokens": mixed,
    }


def classify_quality(pages: list[str]) -> dict:
    n = len(pages)
    ms = [page_metrics(p) for p in pages]
    empty = sum(1 for m in ms if m["words"] < 5)
    total_words = sum(m["words"] for m in ms)
    total_chars = sum(m["chars"] for m in ms)
    repl = sum(m["replacement_chars"] for m in ms)
    mixed = sum(m["mixed_alnum_tokens"] for m in ms)
    fw = (sum(m["function_word_ratio"] * m["words"] for m in ms) / total_words) if total_words else 0
    words_per_page = total_words / n if n else 0
    empty_ratio = empty / n if n else 1
    mixed_per_kword = 1000 * mixed / total_words if total_words else 0

    flags = []
    if n == 0 or total_words < 50:
        grade = "E"
        flags.append("sin_capa_de_texto: requiere OCR")
    else:
        if empty_ratio > 0.5:
            flags.append("mayoria_de_paginas_sin_texto: OCR parcial")
        elif empty_ratio > 0.15:
            flags.append("paginas_sin_texto_o_imagen")
        if repl / max(total_chars, 1) > 0.002:
            flags.append("caracteres_de_reemplazo_U+FFFD: codificacion rota")
        if mixed_per_kword > 8:
            flags.append("tokens_alfanumericos_mezclados: OCR ruidoso, requiere limpieza")
        if fw < 0.12:
            flags.append("pocas_palabras_funcionales_es/en: texto lengua indigena o ruido")
        score = 0
        score += 0 if empty_ratio < 0.05 else 1 if empty_ratio < 0.2 else 2 if empty_ratio < 0.5 else 3
        score += 0 if mixed_per_kword <= 3 else 1 if mixed_per_kword <= 8 else 2
        score += 1 if repl / max(total_chars, 1) > 0.002 else 0
        grade = "A" if score == 0 else "B" if score == 1 else "C" if score == 2 else "D"
    return {
        "pages": n,
        "pages_without_text": empty,
        "total_words": total_words,
        "avg_words_per_page": round(words_per_page, 1),
        "function_word_ratio": round(fw, 3),
        "mixed_alnum_per_1000_words": round(mixed_per_kword, 2),
        "replacement_chars": repl,
        "grade": grade,  # A limpio, B menor, C requiere limpieza, D mala, E sin texto
        "flags": flags,
    }


def main():
    OUT_TEXT.mkdir(parents=True, exist_ok=True)
    report = {}
    for folder in FOLDERS:
        for pdf in sorted((CORPUS / folder).glob("*.pdf")):
            doc_id = f"{folder}/{pdf.name}"
            print("extrayendo", doc_id, flush=True)
            pages = extract_pages(pdf)
            q = classify_quality(pages)
            q["size_bytes"] = pdf.stat().st_size
            report[doc_id] = q
            out = OUT_TEXT / folder / (pdf.stem + ".pages.jsonl")
            out.parent.mkdir(parents=True, exist_ok=True)
            with out.open("w", encoding="utf-8", newline="\n") as f:
                for i, t in enumerate(pages, start=1):
                    f.write(json.dumps({"document": doc_id, "page": i, "text": t}, ensure_ascii=False) + "\n")
        for other in sorted((CORPUS / folder).glob("*")):
            if other.suffix.lower() not in (".pdf",):
                report[f"{folder}/{other.name}"] = {
                    "pages": None, "grade": "N/A",
                    "flags": [f"formato {other.suffix}: no es texto; requiere transcripcion/ASR humana verificada"],
                    "size_bytes": other.stat().st_size,
                }
    (CORPUS / "_rag" / "quality_report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print("listo:", len(report), "documentos")


if __name__ == "__main__":
    sys.exit(main())
