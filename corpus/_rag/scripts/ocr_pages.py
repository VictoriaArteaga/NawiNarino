"""OCR por pagina con Tesseract. Solo LEE los PDF originales; escribe en corpus/_rag/ocr/unreviewed/.

Uso:
  python -X utf8 ocr_pages.py borman                 # las 130 paginas del vocabulario cofan
  python -X utf8 ocr_pages.py curnow                 # solo paginas marcadas 'noisy' en _rag/pages.jsonl
  python -X utf8 ocr_pages.py curnow --pages 100,101 # subconjunto (pruebas)

Salida: <doc>.pages.jsonl con {document, page (indice PDF 1-based), text, mean_conf, n_words,
low_conf_words, engine, lang, psm, dpi, status:"ocr_unreviewed"}. Reanuda si el archivo ya existe.
El texto OCR NO se corrige ni se normaliza: lo que ve Tesseract es lo que se guarda.
"""
import argparse
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
import pymupdf  # noqa: E402

CORPUS = Path(__file__).resolve().parents[2]
RAG = CORPUS / "_rag"
TESS = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
TESSDATA = str(RAG / "ocr" / "tessdata")

JOBS = {
    "borman": dict(
        pdf=CORPUS / "ainga-cofan" / "sil-borman_vocabulario-cofan-1976.pdf",
        doc_id="ainga-cofan/sil-borman_vocabulario-cofan-1976.pdf",
        lang="spa", psm=3, dpi=300,  # psm 1 exige el modelo osd, que no esta en nuestro tessdata
    ),
    "curnow": dict(
        pdf=CORPUS / "awapit" / "anu_curnow-1997_grammar-of-awa-pit.pdf",
        doc_id="awapit/anu_curnow-1997_grammar-of-awa-pit.pdf",
        lang="eng", psm=4, dpi=300,
    ),
}
LOWCONF = 60  # palabras por debajo de este valor se cuentan como dudosas


def ocr_one(args):
    pdf, page, lang, psm, dpi = args
    with tempfile.TemporaryDirectory() as td:
        img = Path(td) / "p.png"
        doc = pymupdf.open(pdf)
        doc[page - 1].get_pixmap(dpi=dpi).save(str(img))
        base = Path(td) / "out"
        cmd = [TESS, str(img), str(base), "--tessdata-dir", TESSDATA, "-l", lang, "--psm", str(psm),
               "-c", "preserve_interword_spaces=1", "txt", "tsv"]
        r = subprocess.run(cmd, capture_output=True, timeout=600)
        if r.returncode != 0:
            return page, None, r.stderr.decode("utf-8", "replace")[:300]
        text = (base.with_suffix(".txt")).read_text(encoding="utf-8")
        tsv = (base.with_suffix(".tsv")).read_text(encoding="utf-8")
    confs = []
    for row in csv.DictReader(io.StringIO(tsv), delimiter="\t", quoting=csv.QUOTE_NONE):
        if row.get("level") == "5" and (row.get("text") or "").strip():
            confs.append(float(row["conf"]))
    n = len(confs)
    return page, {
        "text": text.rstrip("\n") + "\n",
        "mean_conf": round(sum(confs) / n, 1) if n else None,
        "n_words": n,
        "low_conf_words": sum(c < LOWCONF for c in confs),
    }, None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("job", choices=JOBS)
    ap.add_argument("--pages", help="lista separada por comas (indice PDF 1-based)")
    ap.add_argument("--workers", type=int, default=max(1, (os.cpu_count() or 2) - 1))
    a = ap.parse_args()
    j = JOBS[a.job]

    if a.pages:
        pages = [int(x) for x in a.pages.split(",")]
    elif a.job == "borman":
        pages = list(range(1, len(pymupdf.open(j["pdf"])) + 1))
    else:
        pages = []
        for line in (RAG / "pages.jsonl").read_text(encoding="utf-8").splitlines():
            r = json.loads(line)
            if r["document_id"] == "awapit__anu_curnow-1997_grammar-of-awa-pit" and r["page_quality"] == "noisy":
                pages.append(r["page"])

    out_dir = RAG / "ocr" / "unreviewed"
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / (Path(j["doc_id"]).stem + ".pages.jsonl")
    done = {}
    if out.exists():
        for line in out.read_text(encoding="utf-8").splitlines():
            r = json.loads(line)
            done[r["page"]] = r
    todo = [p for p in pages if p not in done]
    print(f"{a.job}: {len(pages)} paginas pedidas, {len(done)} ya hechas, {len(todo)} por procesar, {a.workers} procesos", flush=True)

    errors = {}
    with ProcessPoolExecutor(a.workers) as ex:
        for page, res, err in ex.map(ocr_one, [(str(j["pdf"]), p, j["lang"], j["psm"], j["dpi"]) for p in todo]):
            if res is None:
                errors[page] = err
                print("ERROR pagina", page, err, flush=True)
                continue
            done[page] = {"document": j["doc_id"], "page": page, **res, "engine": "tesseract 5.4.0",
                          "lang": j["lang"], "psm": j["psm"], "dpi": j["dpi"], "status": "ocr_unreviewed"}
            if len(done) % 10 == 0:
                print("  ", len(done), "paginas", flush=True)
    with out.open("w", encoding="utf-8", newline="\n") as f:
        for p in sorted(done):
            f.write(json.dumps(done[p], ensure_ascii=False) + "\n")
    print("listo", out, "errores:", errors)


if __name__ == "__main__":
    main()
