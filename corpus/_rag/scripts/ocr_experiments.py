"""Banco de pruebas de OCR para Borman (1976): configuraciones alternativas sobre 10 paginas.

SOLO LEE el PDF original. Escribe en corpus/_rag/ocr/experiments/borman/<config>/.
NO sustituye el OCR existente (ocr/unreviewed/) ni procesa las 130 paginas.

Uso: python -X utf8 ocr_experiments.py
"""
import csv
import io
import json
import os
import subprocess
import sys
import tempfile
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

sys.path.insert(0, os.path.expandvars(r"%APPDATA%\Python\Python312\site-packages"))
import numpy as np  # noqa: E402
import pymupdf  # noqa: E402
from PIL import Image, ImageFilter, ImageOps  # noqa: E402

CORPUS = Path(__file__).resolve().parents[2]
RAG = CORPUS / "_rag"
PDF = CORPUS / "ainga-cofan" / "sil-borman_vocabulario-cofan-1976.pdf"
TESS = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
TESSDATA = str(RAG / "ocr" / "tessdata")
OUT = RAG / "ocr" / "experiments" / "borman"

# Paginas del PDF (indice 1-based). Seccion segun la estructura del libro (p. 5)
PAGES = {
    5: "introduccion (prosa)",
    12: "cofan-castellano, cabezas en negrita",
    41: "cofan-castellano (con referencia manual)",
    60: "cofan-castellano, fin de seccion",
    66: "lista de fauna (nombres latinos)",
    95: "castellano-cofan (con referencia manual)",
    118: "castellano-cofan",
    123: "alfabeto, tabla 1 (con referencia manual)",
    124: "alfabeto, tabla 2 (con referencia manual)",
    126: "apuntes de gramatica",
    # ampliacion (ronda 3): fauna, flora y gramatica con referencia manual
    69: "lista de fauna (con referencia manual)",
    78: "lista de flora (con referencia manual)",
    127: "gramatica, raices y ejemplos (con referencia manual)",
    129: "gramatica, sufijos verbales (con referencia manual)",
    # ronda 4: seccion castellano-cofan (pp. 84-121), referencia manual
    102: "castellano-cofan, hoja-inclinado (con referencia manual)",
}
TWO_COL = {12, 41, 60, 95, 118}

# nombre -> parametros
CONFIGS = {
    "base300": dict(dpi=300, lang="spa", psm=3),                       # igual que el OCR actual
    "dpi600": dict(dpi=600, lang="spa", psm=3),
    "bin300": dict(dpi=300, lang="spa", psm=3, pre="otsu"),
    "bin600": dict(dpi=600, lang="spa", psm=3, pre="otsu"),
    "thick600": dict(dpi=600, lang="spa", psm=3, pre="otsu_thick"),   # engrosa trazos finos (la marca elevada)
    "cols300": dict(dpi=300, lang="spa", psm=6, cols=True),            # columnas separadas, bloque unico
    "spaeng300": dict(dpi=300, lang="spa+eng", psm=3),
    "blacklist300": dict(dpi=300, lang="spa", psm=3, extra=["-c", "tessedit_char_blacklist=!|"]),  # experimento
    # segunda ronda: combinaciones de lo mejor de la primera
    "thick600_spaeng": dict(dpi=600, lang="spa+eng", psm=3, pre="otsu_thick"),
    "thick450": dict(dpi=450, lang="spa", psm=3, pre="otsu_thick"),
    "thick600_blacklist": dict(dpi=600, lang="spa", psm=3, pre="otsu_thick", extra=["-c", "tessedit_char_blacklist=!|"]),
}


def otsu_threshold(arr):
    hist = np.bincount(arr.ravel(), minlength=256).astype(float)
    total = arr.size
    sum_all = (np.arange(256) * hist).sum()
    wb = sb = 0.0
    best, thr = 0.0, 127
    for t in range(256):
        wb += hist[t]
        if wb == 0:
            continue
        wf = total - wb
        if wf == 0:
            break
        sb += t * hist[t]
        mb, mf = sb / wb, (sum_all - sb) / wf
        between = wb * wf * (mb - mf) ** 2
        if between > best:
            best, thr = between, t
    return thr


def preprocess(img, mode):
    g = ImageOps.autocontrast(img.convert("L"))
    thr = otsu_threshold(np.asarray(g))
    b = g.point(lambda v: 255 if v > thr else 0)
    if mode == "otsu_thick":
        b = b.filter(ImageFilter.MinFilter(3))  # el negro se expande (fondo blanco)
    return b


def split_columns(img):
    """Parte la pagina en dos columnas por el valle de tinta cerca del centro."""
    g = np.asarray(img.convert("L")) < 128
    h, w = g.shape
    lo, hi = int(w * 0.42), int(w * 0.62)
    ink = g[int(h * 0.08):int(h * 0.95), lo:hi].sum(axis=0)
    x = lo + int(np.argmax(ink))  # la regla vertical impresa entre columnas es el maximo de tinta
    return [img.crop((0, 0, x - 4, h)), img.crop((x + 4, 0, w, h))]


def run_tess(img_path, lang, psm, extra):
    base = img_path.with_suffix("")
    cmd = [TESS, str(img_path), str(base), "--tessdata-dir", TESSDATA, "-l", lang, "--psm", str(psm),
           "-c", "preserve_interword_spaces=1", *extra, "txt", "tsv"]
    r = subprocess.run(cmd, capture_output=True, timeout=900)
    if r.returncode != 0:
        raise RuntimeError(r.stderr.decode("utf-8", "replace")[:300])
    text = base.with_suffix(".txt").read_text(encoding="utf-8")
    confs = []
    for row in csv.DictReader(io.StringIO(base.with_suffix(".tsv").read_text(encoding="utf-8")), delimiter="\t", quoting=csv.QUOTE_NONE):
        if row.get("level") == "5" and (row.get("text") or "").strip():
            confs.append(float(row["conf"]))
    return text, confs


def job(args):
    name, page = args
    cfg = CONFIGS[name]
    doc = pymupdf.open(str(PDF))
    pix = doc[page - 1].get_pixmap(dpi=cfg["dpi"])
    img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    if cfg.get("pre"):
        img = preprocess(img, cfg["pre"])
    parts = split_columns(img) if (cfg.get("cols") and page in TWO_COL) else [img]
    psm = cfg["psm"] if (page in TWO_COL or not cfg.get("cols")) else 4
    texts, confs = [], []
    with tempfile.TemporaryDirectory() as td:
        for i, part in enumerate(parts):
            p = Path(td) / f"part{i}.png"
            part.save(p)
            t, c = run_tess(p, cfg["lang"], psm, cfg.get("extra", []))
            texts.append(t.rstrip("\n"))
            confs += c
    text = "\n".join(texts) + "\n"
    d = OUT / name
    d.mkdir(parents=True, exist_ok=True)
    (d / f"p{page:04d}.txt").write_text(text, encoding="utf-8", newline="\n")
    return name, page, round(sum(confs) / len(confs), 1) if confs else None, len(confs)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    args = sys.argv[1:]
    only = None
    for a in list(args):
        if a.startswith("--pages="):  # p. ej. --pages=69,78
            only = [int(x) for x in a.split("=", 1)[1].split(",")]
            args.remove(a)
    names = args or list(CONFIGS)  # se puede pasar solo algunas configuraciones
    jobs = [(n, p) for n in names for p in (only or PAGES)]
    cj = OUT.parent / "confidence.json"
    res = json.loads(cj.read_text(encoding="utf-8"))["results"] if cj.exists() else {}
    with ProcessPoolExecutor(max(1, (os.cpu_count() or 2) - 2)) as ex:
        for name, page, mc, n in ex.map(job, jobs):
            res.setdefault(name, {})[page] = {"mean_conf": mc, "n_words": n}
            print(name, page, mc, n, flush=True)
    (OUT.parent / "confidence.json").write_text(json.dumps({"configs": CONFIGS, "pages": PAGES, "results": res}, indent=2, ensure_ascii=False), encoding="utf-8")


if __name__ == "__main__":
    main()
