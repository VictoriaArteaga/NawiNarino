"""Primera tanda de revision humana de Borman (1976): PDF pp. 95, 102 y 118.

Usa el paquete existente (review/borman_castellano_cofan/). NO ejecuta OCR y NO modifica imagenes, PDF ni OCR:
solo LEE review_items.jsonl, el OCR actual, las lecturas thick600/spaeng300 ya guardadas y las imagenes de pagina
(se enlazan por ruta relativa, no se copian). Escribe unicamente en review/borman_castellano_cofan/batch_01/.

Principios
  * Dos vias separadas: DOCUMENTAL (que se imprime, palabras partidas, omisiones visibles) y LINGUISTICA (requiere
    hablantes o especialistas cofan). Una decision documental nunca cambia el estado de validacion linguistica.
  * Ningun valor se corrige: las lecturas se copian tal cual. Las transcripciones de trabajo del asistente
    (ocr/experiments/ground_truth) NO se usan aqui, para no condicionar a los revisores.
  * Todo local y no indexable; revisar no autoriza reproducir ni publicar.

Uso: python -X utf8 build_batch01.py
"""
import csv
import difflib
import html
import json
import re
from collections import Counter
from pathlib import Path

RAG = Path(__file__).resolve().parents[1]
PKG = RAG / "review" / "borman_castellano_cofan"
OUT = PKG / "batch_01"
BASE = RAG / "ocr" / "unreviewed" / "sil-borman_vocabulario-cofan-1976.pages.jsonl"
EXPD = RAG / "ocr" / "experiments" / "borman"
PAGES = [95, 102, 118]
PRINT_OFFSET = 8
STRIP = ',.;:()"“”«»[]‘’'
LING_DEFAULT = "not_validated"
RIGHTS = "Uso local. Revisar no autoriza reproducir ni publicar: la obra es de SIL; faltan permisos de SIL y de las comunidades."

DOC_DECISIONS = ["confirmed_ocr_correct", "transcription_corrected", "printed_form_unclear", "not_an_error",
                 "omissions_found", "no_omissions_found", "cannot_determine"]
LING_DECISIONS = ["confirmed_form", "corrected_form", "variant_noted", "loanword", "misprint_in_book", "cannot_determine", "refer_to_community"]
LING_STATUS = ["not_validated", "validated_by_speaker", "validated_by_specialist", "disputed"]

# tipo -> (via, ling_needed, disparador)
ROUTE = {
    "discrepancia": ("documental", "no", None),
    "latin_y_v": ("documental_y_linguistico", "si", "Después de que el revisor documental fije qué se imprime (y/v). Consulta a un especialista en taxonomía; no requiere hablante cofán."),
    "grupo_tildes": ("documental_y_linguistico", "si", "Siempre: tras anotar qué tildes se imprimen, ¿qué indican en las entradas cofán? El libro no lo explica."),
    "lectura_completa_de_pagina": ("documental", "no", None),
    "pares_de_formas_parecidas": ("linguistico", "si", "Siempre: ¿son variantes dialectales, de escritura u otra cosa? El libro no lo explica."),
}
ALSO_ROUTE = {  # marcas sistematicas que anaden pregunta linguistica condicional a una discrepancia
    "l_en_forma_cofan": ("condicional", "Solo si la imagen muestra una 'l' real en una palabra cofán: ¿préstamo del español o errata del libro?"),
    "marca_doble_o_variante": ("condicional", "Solo si la imagen muestra que la marca impresa varía en forma o posición: ¿distingue algo que el libro no explica?"),
}


def norm(t):
    return t.strip(STRIP)


def lines_of(text):
    return [l for l in text.split("\n") if l.strip()]


def load_readings():
    base = {}
    for l in BASE.read_text(encoding="utf-8").splitlines():
        r = json.loads(l)
        if r["page"] in PAGES:
            base[r["page"]] = r
    out = {}
    for p in PAGES:
        out[p] = {
            "ocr_actual": base[p]["text"],
            "thick600": (EXPD / "thick600" / f"p{p:04d}.txt").read_text(encoding="utf-8"),
            "spaeng300": (EXPD / "spaeng300" / f"p{p:04d}.txt").read_text(encoding="utf-8"),
            "conf": base[p]["mean_conf"],
        }
    return out


def variant_pairs(text):
    """Pares de formas contiguas separadas por coma, parecidas entre si (posibles variantes). Solo detecta."""
    res = []
    for ln, line in enumerate(lines_of(text), start=1):
        parts = [norm(x) for x in line.split(",")]
        for i in range(len(parts) - 1):
            a, b = parts[i].split()[-1:] or [""], parts[i + 1].split()[:1] or [""]
            a, b = norm(a[0]), norm(b[0])
            if len(a) >= 5 and len(b) >= 5 and a != b and re.fullmatch(r"[a-zñáéíóú']+", a) and re.fullmatch(r"[a-zñáéíóú']+", b):
                ratio = difflib.SequenceMatcher(None, a.lower(), b.lower()).ratio()
                if ratio >= 0.75 and ("'" in a + b or "cc" in a + b or "tt" in a + b or "ñ" in a + b):
                    res.append((ln, a, b, round(ratio, 2)))
    return res


def build():
    OUT.mkdir(exist_ok=True)
    readings = load_readings()
    src = [json.loads(l) for l in (PKG / "review_items.jsonl").read_text(encoding="utf-8").splitlines()]
    src = [i for i in src if i["page_pdf"] in PAGES]
    items = []
    seq = Counter()

    def new_id(p):
        seq[p] += 1
        return f"B01-p{p:04d}-{seq[p]:03d}"

    def base_fields(p):
        return {
            "page_pdf": p, "page_printed_derived": p - PRINT_OFFSET,
            "image": f"../pages/p{p:04d}.png",
            "doc_status": "pending", "doc_decision": None, "doc_printed_form_as_seen": None,
            "doc_justification": None, "doc_reviewer_id": None, "doc_date": None,
            "ling_validation_status": LING_DEFAULT, "ling_decision": None, "ling_justification": None,
            "ling_reviewer_id": None, "ling_reviewer_role": None, "ling_date": None,
            "rights_note": RIGHTS,
        }

    # 1) elementos del paquete para estas tres paginas (se copian sin tocar)
    for s in sorted(src, key=lambda x: (x["page_pdf"], x["line_in_ocr_page"] or 999, x["item_id"])):
        p = s["page_pdf"]
        via, need, trig = ROUTE.get(s["item_type"], ("documental", "no", None))
        question = s["step2_specialist_question"]
        for t in s["also_flagged_as"]:
            if t in ALSO_ROUTE:
                via, need = "documental_y_linguistico", "condicional"
                trig = ALSO_ROUTE[t][1] if not trig else trig + " | " + ALSO_ROUTE[t][1]
        if s["item_type"] == "latin_y_v":
            need = "si"
        rd = s["readings"]
        it = base_fields(p)
        it.update({
            "batch_item_id": new_id(p), "source_item_id": s["item_id"], "source": "paquete",
            "header_range": s["header_range"], "line_in_ocr_page": s["line_in_ocr_page"], "token_position_in_line": s["token_position_in_line"],
            "item_type": s["item_type"], "also_flagged_as": s["also_flagged_as"], "priority": s["priority"],
            "track": via, "readings": rd, "context_line": (s["context"] or {}).get("line"),
            "doc_question": s["step1_visual_question"],
            "ling_needed": need, "ling_trigger": trig, "ling_question": question if need != "no" else None,
        })
        items.append(it)

    # 2) lista de comprobacion de pagina completa (omisiones visibles, orden, cabecera, numero de pagina)
    for p in PAGES:
        lines = lines_of(readings[p]["ocr_actual"])
        it = base_fields(p)
        it.update({
            "batch_item_id": new_id(p), "source_item_id": None, "source": "lista_de_pagina",
            "header_range": next((l.strip() for l in lines[:4] if "—" in l), None), "line_in_ocr_page": None, "token_position_in_line": None,
            "item_type": "lectura_completa_de_pagina", "also_flagged_as": [], "priority": 1, "track": "documental",
            "readings": {"ocr_actual": f"{len(lines)} líneas de texto OCR en esta página", "thick600": None, "spaeng300": None},
            "context_line": None,
            "doc_question": ("Comparar la página entera con la imagen, columna por columna: "
                             "(1) ¿coincide el número de página impreso con " + str(p - PRINT_OFFSET) + "? (2) ¿la cabecera coincide con la primera y la última entrada? "
                             "(3) ¿falta alguna entrada o línea en el OCR, hay alguna repetida o fuera de orden? (4) ¿hay ilustraciones con pie de figura y aparecen en el OCR? "
                             "(5) ¿hay palabras partidas por el fin de línea o por la marca glotal? Registrar cada hallazgo en la justificación."),
            "ling_needed": "no", "ling_trigger": None, "ling_question": None,
        })
        items.append(it)

    # 3) pares de formas parecidas separadas por coma: pregunta puramente linguistica (variantes)
    for p in PAGES:
        for ln, a, b, ratio in variant_pairs(readings[p]["ocr_actual"]):
            it = base_fields(p)
            it.update({
                "batch_item_id": new_id(p), "source_item_id": None, "source": "pares_de_formas_parecidas",
                "header_range": next((l.strip() for l in lines_of(readings[p]["ocr_actual"])[:4] if "—" in l), None),
                "line_in_ocr_page": ln, "token_position_in_line": None,
                "item_type": "pares_de_formas_parecidas", "also_flagged_as": [], "priority": 3, "track": "linguistico",
                "readings": {"ocr_actual": f"{a}, {b}", "thick600": None, "spaeng300": None},
                "context_line": lines_of(readings[p]["ocr_actual"])[ln - 1],
                "doc_question": "Documental (antes de la consulta): ¿la imagen imprime ambas formas tal como las lee el OCR?",
                "ling_needed": "si", "ling_trigger": ROUTE["pares_de_formas_parecidas"][2],
                "ling_question": "El libro separa con coma dos formas de ortografía parecida: ¿son variantes dialectales, de escritura u otra clase de relación? El OCR las lee así; no se asume nada.",
            })
            items.append(it)
    return items, readings


# ------------------------------------------------------------------ salidas
def write_data(items):
    with (OUT / "items_batch01.jsonl").open("w", encoding="utf-8", newline="\n") as f:
        for it in items:
            f.write(json.dumps(it, ensure_ascii=False) + "\n")
    cols = ["batch_item_id", "source_item_id", "page_pdf", "page_printed_derived", "header_range", "line_in_ocr_page", "token_position_in_line",
            "item_type", "also_flagged_as", "priority", "track",
            "ocr_actual", "thick600", "spaeng300", "context_line",
            "doc_question", "doc_status", "doc_decision", "doc_printed_form_as_seen", "doc_justification", "doc_reviewer_id", "doc_date",
            "ling_needed", "ling_trigger", "ling_question", "ling_validation_status", "ling_decision", "ling_justification",
            "ling_reviewer_id", "ling_reviewer_role", "ling_date", "rights_note"]

    def flat(it):
        rd = it["readings"]
        d = {k: it.get(k) for k in cols}
        d["also_flagged_as"] = "+".join(it["also_flagged_as"])
        if it["item_type"] == "grupo_tildes":
            conv = lambda v: "; ".join(f'{x["token"]} (l{x["line"]})' for x in v) if v else None
            rd = {k: conv(v) if isinstance(v, list) else v for k, v in rd.items()}
        for c in ("ocr_actual", "thick600", "spaeng300"):
            v = rd[c]
            d[c] = "[sin lectura disponible]" if v is None else "[sin texto en esta lectura]" if v == "" else v
        for k in ("doc_decision", "doc_printed_form_as_seen", "doc_justification", "doc_reviewer_id", "doc_date",
                  "ling_decision", "ling_justification", "ling_reviewer_id", "ling_reviewer_role", "ling_date"):
            d[k] = ""
        return d

    with (OUT / "items_batch01.csv").open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        for it in items:
            w.writerow(flat(it))
    lq = [it for it in items if it["ling_needed"] != "no"]
    with (OUT / "linguistic_queue.csv").open("w", encoding="utf-8-sig", newline="") as f:
        lcols = ["batch_item_id", "page_pdf", "page_printed_derived", "item_type", "ling_needed", "ocr_actual", "context_line", "ling_trigger",
                 "ling_question", "doc_status", "ling_validation_status", "ling_decision", "ling_justification",
                 "ling_reviewer_id", "ling_reviewer_role", "ling_date"]
        w = csv.DictWriter(f, fieldnames=lcols, extrasaction="ignore")
        w.writeheader()
        for it in lq:
            w.writerow(flat(it))
    return lq


def write_html(items, readings):
    by_page = {p: [i for i in items if i["page_pdf"] == p] for p in PAGES}
    h = ['<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
         "<title>Borman 1976: tanda 1 de revisión (pp. 95, 102, 118)</title>",
         "<style>:root{--bg:#fff;--fg:#1d1d1f;--mut:#5b5b62;--line:#d8d8de;--warn:#fff3cd;--hl:#fff0c2;--doc:#e8f1fd;--lin:#f3e8fd}"
         "@media (prefers-color-scheme:dark){:root{--bg:#16161a;--fg:#ececf1;--mut:#a0a0ab;--line:#33333b;--warn:#3a3213;--hl:#4a3d12;--doc:#17283f;--lin:#2e1b44}}"
         "body{background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,sans-serif;margin:0 auto;max-width:1240px;padding:0 16px 48px}"
         ".ban{background:var(--warn);border:1px solid var(--line);padding:10px 14px;border-radius:8px;margin:16px 0}"
         "h1{font-size:22px}h2{font-size:19px;margin-top:44px;border-top:2px solid var(--line);padding-top:14px}h3{font-size:16px;margin:22px 0 6px}"
         "img{max-width:100%;border:1px solid var(--line)}.three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}@media(max-width:1000px){.three{grid-template-columns:1fr}}"
         "pre{white-space:pre-wrap;font:12px/1.4 ui-monospace,Consolas,monospace;border:1px solid var(--line);padding:6px;overflow:auto;max-height:560px;margin:0}"
         ".hl{background:var(--hl)}table{border-collapse:collapse;width:100%;font-size:13px}th,td{border:1px solid var(--line);padding:4px 6px;vertical-align:top;text-align:left}"
         "th{position:sticky;top:0;background:var(--bg)}.doc{background:var(--doc)}.lin{background:var(--lin)}.mut{color:var(--mut)}code{font-family:ui-monospace,Consolas,monospace}"
         "details{margin:8px 0}nav a{margin-right:12px}</style></head><body>",
         "<h1>Primera tanda de revisión — Borman (1976), PDF pp. 95, 102 y 118</h1>",
         '<div class="ban"><b>Material local, no indexable.</b> Obra de SIL con derechos reservados: <b>revisar no autoriza reproducir ni publicar</b>; faltan permisos de SIL y de las comunidades. '
         "<b>Nada aquí está validado lingüísticamente</b> (todos los elementos: <code>not_validated</code>). "
         "Una decisión documental fija <i>qué se imprime</i>; no dice si la forma es correcta en cofán. "
         "Que las tres lecturas coincidan tampoco valida nada. Las decisiones se registran en <code>items_batch01.csv</code> (o <code>linguistic_queue.csv</code>), nunca en el texto OCR.</div>",
         "<nav><a href='#p95'>p. 95</a><a href='#p102'>p. 102</a><a href='#p118'>p. 118</a> "
         "· <a href='instructions_documental.md'>instrucciones: revisor documental</a><a href='instructions_linguistic.md'>instrucciones: hablantes/especialistas</a></nav>"]
    for p in PAGES:
        its = by_page[p]
        rd = readings[p]
        flagged_lines = {i["line_in_ocr_page"] for i in its if i["line_in_ocr_page"] and i["source"] == "paquete"}
        h.append(f'<h2 id="p{p}">PDF p. {p} (impresa {p - PRINT_OFFSET}) — {html.escape(its[0]["header_range"] or "")}</h2>')
        h.append(f'<p class="mut">Confianza media de Tesseract en el OCR actual: {rd["conf"]}. Los números de línea del OCR actual son los que usan las tablas. '
                 f'Las otras dos lecturas tienen su propia numeración y no se alinean línea a línea. Las líneas con elementos del paquete aparecen resaltadas.</p>')
        h.append(f'<p><a href="../pages/p{p:04d}.png"><img loading="lazy" src="../pages/p{p:04d}.png" alt="Página {p} del PDF original (render a 130 dpi)"></a></p>')
        cols = []
        for key, title in (("ocr_actual", "OCR actual (base provisional)"), ("thick600", "thick600"), ("spaeng300", "spaeng300")):
            ls = lines_of(rd[key])
            rows = []
            for n, l in enumerate(ls, start=1):
                row = f"{n:>3}  {html.escape(l)}"
                rows.append(f'<span class="hl">{row}</span>' if key == "ocr_actual" and n in flagged_lines else row)
            cols.append(f"<div><h3>{title}</h3><pre>{chr(10).join(rows)}</pre></div>")
        h.append('<div class="three">' + "".join(cols) + "</div>")

        def render(rows, with_ling):
            t = ['<table><tr><th>ID</th><th>Tipo</th><th>Línea/pos.</th><th>OCR actual</th><th>thick600</th><th>spaeng300</th><th>Qué comprobar</th>'
                 + ("<th>Pregunta lingüística</th>" if with_ling else "") + "</tr>"]
            for i in rows:
                r = i["readings"]
                if i["item_type"] == "grupo_tildes":
                    r = {k: ", ".join(f'{x["token"]} (l{x["line"]})' for x in v) if isinstance(v, list) else v for k, v in r.items()}
                f = lambda v: '<span class="mut">[sin lectura]</span>' if v is None else ('<span class="mut">[sin texto]</span>' if v == "" else html.escape(str(v)))
                loc = f'{i["line_in_ocr_page"]}/{i["token_position_in_line"] or "–"}' if i["line_in_ocr_page"] else "página"
                also = (" + " + ", ".join(i["also_flagged_as"])) if i["also_flagged_as"] else ""
                row = (f'<tr><td>{i["batch_item_id"]}<br><span class="mut">{i["source_item_id"] or i["source"]}</span></td><td>{i["item_type"]}{html.escape(also)}</td>'
                       f"<td>{loc}</td><td>{f(r['ocr_actual'])}</td><td>{f(r['thick600'])}</td><td>{f(r['spaeng300'])}</td><td>{html.escape(i['doc_question'] or '')}</td>")
                if with_ling:
                    row += f'<td>{html.escape((i["ling_question"] or "") + (" ⟶ " + i["ling_trigger"] if i["ling_trigger"] else ""))}</td>'
                t.append(row + "</tr>")
            return "".join(t) + "</table>"

        doc_rows = [i for i in its if i["track"] in ("documental", "documental_y_linguistico")]
        lin_rows = [i for i in its if i["ling_needed"] != "no"]
        h.append(f'<h3 class="doc">A. Decisiones documentales ({len(doc_rows)}): qué se imprime, palabras partidas, omisiones visibles</h3>')
        h.append(render(doc_rows, False))
        h.append(f'<h3 class="lin">B. Cuestiones que requieren hablantes o especialistas cofán ({len(lin_rows)}): no se resuelven con la imagen</h3>')
        h.append(render(lin_rows, True))
    h.append("</body></html>")
    (OUT / "index.html").write_text("\n".join(h), encoding="utf-8")


def main():
    items, readings = build()
    lq = write_data(items)
    write_html(items, readings)
    manifest = {
        "batch": "borman_castellano_cofan/batch_01", "pages_pdf": PAGES,
        "items_total": len(items),
        "items_by_page": dict(Counter(i["page_pdf"] for i in items)),
        "items_by_track": dict(Counter(i["track"] for i in items)),
        "items_by_type": dict(Counter(i["item_type"] for i in items).most_common()),
        "items_requiring_linguistic_knowledge": {"si": sum(i["ling_needed"] == "si" for i in items),
                                                  "condicional": sum(i["ling_needed"] == "condicional" for i in items)},
        "linguistic_queue_items": len(lq),
        "status": {"doc_status": dict(Counter(i["doc_status"] for i in items)),
                   "ling_validation_status": dict(Counter(i["ling_validation_status"] for i in items))},
        "allowed_values": {"doc_decision": DOC_DECISIONS, "ling_decision": LING_DECISIONS, "ling_validation_status": LING_STATUS,
                           "doc_status": ["pending", "in_review", "done", "disputed"]},
        "rules": ["Una decisión documental no cambia ling_validation_status.",
                  "ling_validation_status solo lo cambia un hablante o especialista, nunca el revisor documental.",
                  "No se corrige el OCR ni se sustituyen caracteres: las correcciones van en doc_printed_form_as_seen.",
                  "Material local, no indexable, no integrado al RAG; revisar no autoriza reproducir ni publicar."],
    }
    (OUT / "batch_manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(manifest, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
