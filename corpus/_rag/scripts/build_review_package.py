"""Paquete de revision humana de Borman (1976), seccion castellano->cofan (PDF pp. 84-121).

NO ejecuta OCR. Lee:
  - OCR actual: ocr/unreviewed/sil-borman_vocabulario-cofan-1976.pages.jsonl (base provisional)
  - lecturas alternativas ya existentes (solo pp. 95, 102, 118): ocr/experiments/borman/{thick600,spaeng300}/
  - el PDF original, solo para renderizar imagenes de pagina de apoyo a la revision
Escribe unicamente en corpus/_rag/review/borman_castellano_cofan/.

Reglas de diseno
  * Solo DETECTA y ORGANIZA. Nunca sustituye ni normaliza caracteres: todo texto se guarda tal como salio del OCR.
  * Las coincidencias entre lecturas no validan nada (se avisa en cada registro).
  * Las reglas son heuristicas de apoyo, con recall conocido solo en las paginas con referencia manual (ver README).

Uso: python -X utf8 build_review_package.py
"""
import csv
import difflib
import html
import json
import os
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, os.path.expandvars(r"%APPDATA%\Python\Python312\site-packages"))
import pymupdf  # noqa: E402  (solo renderiza imagenes; no hay OCR)

CORPUS = Path(__file__).resolve().parents[2]
RAG = CORPUS / "_rag"
PDF = CORPUS / "ainga-cofan" / "sil-borman_vocabulario-cofan-1976.pdf"
BASE = RAG / "ocr" / "unreviewed" / "sil-borman_vocabulario-cofan-1976.pages.jsonl"
EXPD = RAG / "ocr" / "experiments" / "borman"
OUT = RAG / "review" / "borman_castellano_cofan"
PAGES = list(range(84, 122))
ALTS = ["thick600", "spaeng300"]
STRIP = ',.;:()"“”«»[]‘’'
PRINT_OFFSET = 8  # pagina impresa = pagina PDF - 8 (comprobado en 34 de 38 paginas por el numero que lee el OCR)

ACC = set("áéíóúüñÁÉÍÓÚÜÑ")
COFAN_DIGRAPHS = ("cc", "tt", "tss", "qq", "pp", "chh", "dy", "tsh")
COFAN_ENDINGS = ("ye", "ñe", "eñe", "aye", "oye", "cho", "cco", "ccu", "ngo", "mba")

# tipo -> (prioridad, descripcion corta, pregunta visual, tema para especialista o None)
FLAGS = {
    "discrepancia": (1, "Las lecturas del OCR actual, thick600 y spaeng300 difieren", "¿Qué dice la imagen? Transcribir tal como se imprime.", None),
    "exclam_en_palabra": (1, "'!' o '|' dentro de una palabra: posible lectura errónea de la marca glotal", "¿La imagen muestra la marca vertical elevada (la letra glotal descrita en la p. 124 del PDF) en este lugar?", None),
    "marca_doble_o_variante": (1, "Marca doble (!' , ''), o variante tipográfica (’ ‘ ´ `) dentro de una palabra", "¿Cuántas marcas se imprimen y en qué posición?", "Si la marca impresa varía (posición, forma), ¿hay una distinción que el libro no explica?"),
    "l_en_forma_cofan": (2, "'l' dentro de una palabra con forma de cofán (dígrafos o terminaciones cofán): 'l' no está en el alfabeto del libro", "¿La imagen muestra una 'l' o la marca glotal?", "Si la imagen muestra una 'l' real: ¿es un préstamo del español o una errata del libro?"),
    "n_sin_enie": (2, "Terminación -ane/-ene/-ine/-one/-une en una palabra con forma de cofán: posible 'ñ' leída como 'n'", "¿Se imprime 'ñ' o 'n'?", None),
    "latin_y_v": (2, "Nombre latino (cursiva) con 'v' o 'y': posible confusión y/v", "¿Se imprime 'y' o 'v'?", "Especialista en taxonomía (no necesariamente cofán): ¿ortografía correcta del nombre científico?"),
    "diéresis_o_tilde_dudosa": (2, "Secuencia sospechosa de diéresis o tilde (p. ej. gú-e, gi-i)", "¿Qué diacrítico se imprime?", None),
    "palabra_partida_posible": (2, "Posible palabra partida (sílaba corta + fragmento que empieza por ng-/nd-/nt-/mb-/ns-)", "¿Se imprime una sola palabra o dos? (No unir sin mirar la imagen.)", None),
    "digito_o_simbolo_en_palabra": (2, "Dígito o símbolo extraño dentro de una palabra", "¿Qué carácter se imprime?", None),
    "letra_inicial_ausente": (2, "Fragmento que parece haber perdido su letra inicial (p. ej. cabecera 'uien')", "¿Qué se imprime al comienzo?", None),
    "guion_fin_de_linea": (3, "Guion de fin de línea: palabra partida por el formato de impresión", "¿Es un corte de línea tipográfico o un guion de la palabra?", None),
    "ruido_ilustracion": (3, "Línea muy corta o con pocas letras: posible ruido de ilustración o pie de figura", "¿Es texto impreso, un pie de figura o ruido?", None),
    "grupo_tildes": (3, "Lista de palabras con tilde, diéresis o ñ en la página (verificar presencia y posición)", "Para cada palabra: ¿coinciden las tildes/ñ con la imagen? ¿Faltan tildes en otras palabras?", "¿Qué indican las tildes escritas en las entradas cofán? El libro no lo explica en las páginas leídas."),
}


# ---------------------------------------------------------------- utilidades
def norm(t):
    return t.strip(STRIP)


def has_cofan_shape(w):
    x = w.lower().replace("'", "")
    return any(d in x for d in COFAN_DIGRAPHS) or x.endswith(COFAN_ENDINGS)


def load_pages():
    d = {}
    for line in BASE.read_text(encoding="utf-8").splitlines():
        r = json.loads(line)
        if r["page"] in PAGES:
            d[r["page"]] = r
    return d


def load_alt(cfg, p):
    f = EXPD / cfg / f"p{p:04d}.txt"
    return f.read_text(encoding="utf-8") if f.exists() else None


def tokenize(text):
    """Devuelve lista de tokens: dict(raw, line, col_in_line, idx). raw se conserva sin tocar."""
    toks, i = [], 0
    ln = 0
    for line in text.split("\n"):
        if not line.strip():
            continue
        ln += 1
        for c, w in enumerate(line.split()):
            toks.append({"raw": w, "norm": norm(w), "line": ln, "pos": c + 1, "idx": i})
            i += 1
    return toks


def lines_of(text):
    return [l for l in text.split("\n") if l.strip()]


# ---------------------------------------------------------------- reglas de deteccion (solo detectan)
def single_flags(lines):
    """Devuelve lista de (tipo, line_no, pos, token_raw)."""
    out = []
    for ln, line in enumerate(lines, start=1):
        words = line.split()
        alpha = sum(c.isalpha() for c in line)
        s = line.strip()
        # no son ruido: numero de pagina (77, 110) ni la letra de seccion alfabetica (B, Cc, CH, ...)
        is_pageno = bool(re.fullmatch(r"\d{2,3}", s))
        is_letter_heading = bool(re.fullmatch(r"[A-ZÑ][A-Za-zñ]?", s))
        if not (is_pageno or is_letter_heading) and (len(s) <= 2 or (len(s) < 12 and alpha < 0.5 * len(s))):
            out.append(("ruido_ilustracion", ln, 0, s))
        for pos, w in enumerate(words, start=1):
            n = norm(w)
            if not n:
                continue
            if re.search(r"\w[!|]\w|\w[!|]'|'[!|]\w|\w[!|]$", n) and not n.startswith("¡"):
                out.append(("exclam_en_palabra", ln, pos, w))
            if re.search(r"\w[’‘´`ʼʹ]\w|''|!'|'!", n):
                out.append(("marca_doble_o_variante", ln, pos, w))
            # excluye importes (S/.5) y etiquetas de persona (2a, 3a) que el libro imprime a proposito
            if (re.search(r"\d", n) and re.search(r"[^\W\d_]", n) and not re.fullmatch(r"\d+\)?", n)
                    and not re.fullmatch(r"S/\.\d+", n) and not re.fullmatch(r"\d[a-z]", n)):
                out.append(("digito_o_simbolo_en_palabra", ln, pos, w))
            if re.search(r"g[úùû]e|g[íìî][ei]|gii|gü[^aeio]|[úí]ie", n):
                out.append(("diéresis_o_tilde_dudosa", ln, pos, w))
            # 'l' no es letra del alfabeto cofan del libro. Se excluyen nombres propios/latinos (mayuscula inicial)
            # y palabras espanolas en -cion/-ccion que contienen 'cc' por motivos ortograficos del espanol.
            if ("l" in n.lower() and has_cofan_shape(n) and not n[:1].isupper()
                    and not re.search(r"cci[oó]n|ccio", n.lower())):
                out.append(("l_en_forma_cofan", ln, pos, w))
            if re.search(r"[aeiou]ne$", n.lower()) and has_cofan_shape(n) and "ñ" not in n.lower():
                out.append(("n_sin_enie", ln, pos, w))
            if w.endswith("-") and len(n) > 1 and pos == len(words):
                out.append(("guion_fin_de_linea", ln, pos, w))
        # nombres latinos: Genero capitalizado a mitad de linea + epiteto en minuscula
        latin_end = r"(us|a|um|is|ii|ae|ata|ris|ensis|ica|ens|ula|ora|ana|ola|ys|es|ia|on|ax|ix|io|ra|ta)$"
        for m in re.finditer(r"(?<=\s)([A-ZÁÉÍÓÚ][a-z]{4,})\s+([a-z]{5,})\b", line):
            if not (re.search(latin_end, m.group(1)) and re.search(latin_end, m.group(2))):
                continue  # exige forma de binomio latino: ambos terminan como nombres cientificos
            for g in (m.group(1), m.group(2)):
                if re.search(r"[vy]", g):
                    pos = len(line[:m.start()].split()) + (1 if g == m.group(2) else 0) + 1
                    out.append(("latin_y_v", ln, pos, g))
        # palabra partida: token corto terminado en vocal + fragmento que empieza por ng/nd/nt/mb/ns
        for pos in range(len(words) - 1):
            a, b = norm(words[pos]), norm(words[pos + 1])
            if 2 <= len(a) <= 4 and re.search(r"[aeiou]$", a) and re.match(r"^(ng|nd|nt|mb|ns)[a-zñ]", b) and len(b) >= 4:
                out.append(("palabra_partida_posible", ln, pos + 1, words[pos] + " " + words[pos + 1]))
        # letra inicial ausente: primera palabra de cabecera tipo "uien o ¿quién? — remo"
        if ln <= 3 and "—" in line and re.match(r"^(uien|ue|ual|uando)\b", line.strip()):
            out.append(("letra_inicial_ausente", ln, 1, words[0]))
    return out


def accent_group(lines):
    items = []
    for ln, line in enumerate(lines, start=1):
        for pos, w in enumerate(line.split(), start=1):
            if any(c in ACC for c in w):
                items.append((ln, pos, w))
    return items


# ---------------------------------------------------------------- discrepancias entre lecturas
def opcodes(a, b):
    return difflib.SequenceMatcher(None, [norm(t["raw"]) for t in a], [norm(t["raw"]) for t in b], autojunk=False).get_opcodes()


def map_pos(ops, i, side):
    """posicion en b correspondiente a la posicion i de a. side: 'start' o 'end'."""
    for tag, i1, i2, j1, j2 in ops:
        if i1 <= i <= i2:
            if tag == "equal":
                return j1 + (i - i1), False
            if i == i1:
                return j1, False
            if i == i2:
                return j2, False
            return (j1 if side == "start" else j2), True
    return None, True


def discrepancy_runs(a, alts):
    """alts: {cfg: tokens}. Devuelve lista de runs con rango sobre a y lectura de cada cfg."""
    ranges = []
    allops = {}
    for cfg, b in alts.items():
        ops = opcodes(a, b)
        allops[cfg] = ops
        for tag, i1, i2, j1, j2 in ops:
            if tag == "equal":
                continue
            s, e = (max(0, i1 - 1), min(len(a), i1 + 1)) if i1 == i2 else (i1, i2)
            ranges.append([s, e])
    ranges.sort()
    merged = []
    for s, e in ranges:
        if merged and s <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], e)
        else:
            merged.append([s, e])
    runs = []
    for s, e in merged:
        rec = {"start": s, "end": e, "reading": {"ocr_actual": " ".join(t["raw"] for t in a[s:e])}, "approx": False}
        for cfg, b in alts.items():
            bs, ap1 = map_pos(allops[cfg], s, "start")
            be, ap2 = map_pos(allops[cfg], e, "end")
            if bs is None or be is None:
                rec["reading"][cfg] = None
                rec["approx"] = True
            else:
                rec["reading"][cfg] = " ".join(t["raw"] for t in b[bs:be])
                rec["approx"] = rec["approx"] or ap1 or ap2
        runs.append(rec)
    return runs


# ---------------------------------------------------------------- construccion
def build():
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "pages").mkdir(exist_ok=True)
    pages = load_pages()
    doc = pymupdf.open(str(PDF))
    items, summary = [], {}
    counter = defaultdict(int)

    for p in PAGES:
        text = pages[p]["text"]
        lines = lines_of(text)
        toks = tokenize(text)
        alt_text = {c: load_alt(c, p) for c in ALTS}
        has_alt = all(v is not None for v in alt_text.values())
        printed_seen = next((int(l.strip()) for l in lines[:2] + lines[-2:] if re.fullmatch(r"\d{2,3}", l.strip())), None)
        header = next((l.strip() for l in lines[:4] if "—" in l), None)
        # imagen de apoyo (render del PDF original; no es OCR)
        png = OUT / "pages" / f"p{p:04d}.png"
        if not png.exists():
            doc[p - 1].get_pixmap(dpi=130).save(str(png))

        def add(item_type, line_no, pos, token, readings=None, approx=False, extra=None, also=None):
            counter[p] += 1
            prio, desc, q_visual, expert = FLAGS[item_type]
            also = [t for t in (also or []) if t != item_type]
            experts = [e for e in [expert] + [FLAGS[t][3] for t in also] if e]
            expert = " | ".join(dict.fromkeys(experts)) if experts else None
            prio = min([prio] + [FLAGS[t][0] for t in also])
            rd = readings or {"ocr_actual": token, "thick600": None, "spaeng300": None}
            ln = line_no
            ctx_prev = lines[ln - 2] if 1 < ln <= len(lines) else None
            ctx_here = lines[ln - 1] if 1 <= ln <= len(lines) else None
            ctx_next = lines[ln] if 1 <= ln < len(lines) else None
            it = {
                "item_id": f"BCC-p{p:04d}-{counter[p]:03d}",
                "page_pdf": p, "page_printed_derived": p - PRINT_OFFSET,
                "page_printed_seen_in_ocr": printed_seen,
                "header_range": header,
                "line_in_ocr_page": line_no, "token_position_in_line": pos,
                "context": {"prev_line": ctx_prev, "line": ctx_here, "next_line": ctx_next},
                "location_note": "Línea y posición se cuentan sobre el texto OCR de la página (columna izquierda y luego derecha); no hay coordenadas.",
                "item_type": item_type, "also_flagged_as": also, "priority": prio, "description": desc,
                "readings": rd,
                "alternative_readings_available": has_alt,
                "readings_alignment_approximate": approx,
                "validation_note": "Que las lecturas coincidan NO valida la forma; solo indica que ninguna configuración la distingue.",
                "step1_visual_question": q_visual,
                "step1_resolvable_by": "revisor con acceso al PDF (comparación con la imagen)",
                "step2_requires_specialist": bool(expert),
                "step2_specialist_question": expert,
                "reviewer": {"decision": None, "printed_form_as_seen": None, "notes": None, "reviewer_id": None, "date": None},
            }
            if extra:
                it.update(extra)
            items.append(it)

        # 1) reglas de errores sistematicos conocidos (se aplican siempre, aunque las lecturas coincidan)
        sf = single_flags(lines)
        by_tok = defaultdict(list)  # (linea, pos) -> [(tipo, token)]
        for typ, ln, pos, w in sf:
            if (typ, w) not in by_tok[(ln, pos)]:
                by_tok[(ln, pos)].append((typ, w))
        COVER[p] = {"rules": {norm(w) for _t, _l, _p, w in sf for w in w.split()}, "disc": set()}

        # 2) discrepancias entre lecturas (solo pp. 95, 102, 118, las unicas con thick600 y spaeng300)
        in_disc = set()
        if has_alt:
            a = toks
            alts = {c: tokenize(alt_text[c]) for c in ALTS}
            for r in discrepancy_runs(a, alts):
                t0 = a[r["start"]]
                reading = {"ocr_actual": r["reading"]["ocr_actual"], "thick600": r["reading"]["thick600"], "spaeng300": r["reading"]["spaeng300"]}
                rule_types = []
                for k in range(r["start"], r["end"]):
                    key = (a[k]["line"], a[k]["pos"])
                    in_disc.add(key)
                    COVER[p]["disc"].add(norm(a[k]["raw"]))
                    for typ, _w in by_tok.get(key, []):
                        if typ not in rule_types:
                            rule_types.append(typ)
                add("discrepancia", t0["line"], t0["pos"], reading["ocr_actual"], reading, r["approx"], also=rule_types)

        # 3) marcas sistematicas fuera de discrepancias: un solo registro por palabra aunque tenga varias marcas
        for (ln, pos), fl in sorted(by_tok.items()):
            if (ln, pos) in in_disc:
                continue
            types = [t for t, _w in fl]
            primary = sorted(types, key=lambda t: (FLAGS[t][0], list(FLAGS).index(t)))[0]
            w = fl[0][1]
            readings = {"ocr_actual": w, "thick600": None, "spaeng300": None}
            add(primary, ln, pos, w, readings, False, None, also=types)

        acc = accent_group(lines)
        if acc:
            counter[p] += 1
            prio, desc, qv, expert = FLAGS["grupo_tildes"]
            items.append({
                "item_id": f"BCC-p{p:04d}-{counter[p]:03d}", "page_pdf": p, "page_printed_derived": p - PRINT_OFFSET,
                "page_printed_seen_in_ocr": printed_seen, "header_range": header,
                "line_in_ocr_page": None, "token_position_in_line": None,
                "context": None, "location_note": "Grupo de página: cada palabra indica su línea y posición.",
                "item_type": "grupo_tildes", "also_flagged_as": [], "priority": prio, "description": desc,
                "readings": {"ocr_actual": [{"token": w, "line": l, "pos": ps} for l, ps, w in acc], "thick600": None, "spaeng300": None},
                "alternative_readings_available": has_alt, "readings_alignment_approximate": False,
                "validation_note": "Solo verifica lo que el OCR dejó; no puede detectar tildes que el OCR eliminó. Hay que comparar la página completa.",
                "step1_visual_question": qv, "step1_resolvable_by": "revisor con acceso al PDF (comparación con la imagen)",
                "step2_requires_specialist": True, "step2_specialist_question": expert,
                "reviewer": {"decision": None, "printed_form_as_seen": None, "notes": None, "reviewer_id": None, "date": None},
            })

        summary[p] = {
            "page_pdf": p, "page_printed_derived": p - PRINT_OFFSET, "page_printed_seen_in_ocr": printed_seen,
            "header_range": header, "ocr_mean_conf": pages[p]["mean_conf"], "ocr_words": pages[p]["n_words"],
            "readings_available": ["ocr_actual"] + (ALTS if has_alt else []),
            "image": f"pages/p{p:04d}.png",
        }

    for p in PAGES:
        its = [i for i in items if i["page_pdf"] == p]
        summary[p]["items_total"] = len(its)
        summary[p]["items_by_priority"] = dict(sorted(Counter(i["priority"] for i in its).items()))
        summary[p]["items_by_type"] = dict(Counter(i["item_type"] for i in its))
    return items, summary, pages


COVER = {}  # p -> {"rules": set de tokens marcados por reglas, "disc": tokens dentro de discrepancias}


def show(v):
    """None = no hay lectura de esa configuracion para la pagina; '' = la configuracion no produjo texto en ese fragmento."""
    if v is None:
        return "[sin lectura disponible]"
    if v == "":
        return "[sin texto en esta lectura]"
    return v


def cover_with_ground_truth(items, pages):
    """Mide cuantas lecturas erroneas CONOCIDAS (pp. 95, 102, 118, con referencia manual) detectan las reglas.
    Sesgo: las reglas se disenaron mirando estos errores; NO es una prueba independiente."""
    sys.path.insert(0, str(Path(__file__).parent))
    import analyze_by_type as A
    res = {}
    for p in (95, 102, 118):
        g = Counter(A.gt(p))
        o = Counter(A.toks(pages[p]["text"]))
        wrong = [w for w in (o - g).elements() if len(w) > 2]  # lecturas distintas de la referencia
        wrong_set = set(wrong)
        # conjuntos medidos ANTES de fusionar registros, para que reglas y discrepancia se evaluen por separado
        rules = {t for w in COVER[p]["rules"] for t in A.toks(w)}
        disc = {t for w in COVER[p]["disc"] for t in A.toks(w)}
        res[p] = {
            "lecturas_distintas_de_la_referencia": len(wrong_set),
            "detectadas_por_reglas": len(wrong_set & rules),
            "detectadas_por_discrepancia": len(wrong_set & disc),
            "detectadas_por_reglas_o_discrepancia": len(wrong_set & (rules | disc)),
            "no_detectadas": sorted(wrong_set - (rules | disc)),
            "tokens_marcados_por_reglas": len(rules), "de_ellos_erroneos": len(rules & wrong_set),
        }
    return res


def main():
    items, summary, pages = build()
    cov = cover_with_ground_truth(items, pages)

    with (OUT / "review_items.jsonl").open("w", encoding="utf-8", newline="\n") as f:
        for it in sorted(items, key=lambda x: (x["priority"], x["page_pdf"], x["line_in_ocr_page"] or 0, x["item_id"])):
            f.write(json.dumps(it, ensure_ascii=False) + "\n")

    cols = ["item_id", "priority", "page_pdf", "page_printed_derived", "header_range", "line_in_ocr_page", "token_position_in_line",
            "item_type", "ocr_actual", "thick600", "spaeng300", "alternative_readings_available", "context_line",
            "step1_visual_question", "step2_requires_specialist", "step2_specialist_question",
            "reviewer_decision", "printed_form_as_seen", "reviewer_notes", "reviewer_id", "date"]
    with (OUT / "review_items.csv").open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        for it in sorted(items, key=lambda x: (x["priority"], x["page_pdf"], x["line_in_ocr_page"] or 0, x["item_id"])):
            rd = it["readings"]
            if it["item_type"] == "grupo_tildes":
                rd = {k: ("; ".join(f'{x["token"]} (l{x["line"]})' for x in v) if v else None) for k, v in rd.items()}
            w.writerow({
                "item_id": it["item_id"], "priority": it["priority"], "page_pdf": it["page_pdf"], "page_printed_derived": it["page_printed_derived"],
                "header_range": it["header_range"], "line_in_ocr_page": it["line_in_ocr_page"], "token_position_in_line": it["token_position_in_line"],
                "item_type": it["item_type"] + ("+" + "+".join(it["also_flagged_as"]) if it["also_flagged_as"] else ""),
                "ocr_actual": show(rd["ocr_actual"]), "thick600": show(rd["thick600"]), "spaeng300": show(rd["spaeng300"]),
                "alternative_readings_available": it["alternative_readings_available"],
                "context_line": (it["context"] or {}).get("line"), "step1_visual_question": it["step1_visual_question"],
                "step2_requires_specialist": it["step2_requires_specialist"], "step2_specialist_question": it["step2_specialist_question"],
                "reviewer_decision": "", "printed_form_as_seen": "", "reviewer_notes": "", "reviewer_id": "", "date": "",
            })

    stats = {
        "pages": len(PAGES), "pages_with_alternative_readings": [p for p, s in summary.items() if len(s["readings_available"]) > 1],
        "items_total": len(items),
        "items_by_priority": dict(sorted(Counter(i["priority"] for i in items).items())),
        "items_by_type": dict(Counter(i["item_type"] for i in items).most_common()),
        "items_requiring_specialist_step2": sum(i["step2_requires_specialist"] for i in items),
        "rule_coverage_on_pages_with_manual_reference": cov,
        "print_offset": PRINT_OFFSET,
    }
    (OUT / "pages_summary.json").write_text(json.dumps({"stats": stats, "pages": summary}, ensure_ascii=False, indent=2), encoding="utf-8")
    write_html(items, summary, pages)
    print(json.dumps(stats, ensure_ascii=False, indent=1))


def write_html(items, summary, pages):
    by_page = defaultdict(list)
    for it in items:
        by_page[it["page_pdf"]].append(it)
    h = ['<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
         "<title>Revisión Borman 1976, castellano→cofán</title>",
         "<style>:root{--bg:#fff;--fg:#1d1d1f;--mut:#5b5b62;--line:#d8d8de;--warn:#fff3cd;--p1:#b42318;--p2:#b54708;--p3:#475467}"
         "@media (prefers-color-scheme:dark){:root{--bg:#16161a;--fg:#ececf1;--mut:#a0a0ab;--line:#33333b;--warn:#3a3213;--p1:#f97066;--p2:#fdb022;--p3:#98a2b3}}"
         "body{background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,sans-serif;margin:0 auto;max-width:1180px;padding:0 16px 48px}"
         ".ban{background:var(--warn);border:1px solid var(--line);padding:10px 14px;border-radius:8px;margin:16px 0}"
         "h1{font-size:22px}h2{font-size:18px;margin-top:40px;border-top:1px solid var(--line);padding-top:16px}"
         ".grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px}@media(max-width:900px){.grid{grid-template-columns:1fr}}"
         "img{max-width:100%;border:1px solid var(--line)}pre{white-space:pre-wrap;font:12.5px/1.45 ui-monospace,Consolas,monospace;border:1px solid var(--line);padding:8px;overflow:auto;max-height:640px}"
         "table{border-collapse:collapse;width:100%;font-size:13px}th,td{border:1px solid var(--line);padding:4px 6px;vertical-align:top;text-align:left}"
         ".p1{color:var(--p1);font-weight:600}.p2{color:var(--p2);font-weight:600}.p3{color:var(--p3)}.mut{color:var(--mut)}code{font-family:ui-monospace,Consolas,monospace}"
         "nav a{margin-right:8px}</style></head><body>",
         "<h1>Revisión humana — Borman (1976), sección castellano→cofán (PDF pp. 84–121)</h1>",
         '<div class="ban"><b>Material local, no indexable, pendiente de permisos (SIL) y de revisión especializada.</b> '
         "El texto es la lectura OCR provisional (Tesseract 5.4.0, español, 300 dpi). Las lecturas <code>thick600</code> y <code>spaeng300</code> existen solo para las pp. 95, 102 y 118. "
         "<b>Que las lecturas coincidan no valida la forma.</b> Nada se ha corregido ni normalizado: la corrección va en la hoja <code>review_items.csv</code>, nunca en el texto.</div>",
         "<nav>" + " ".join(f'<a href="#p{p}">{p}</a>' for p in PAGES) + "</nav>"]
    for p in PAGES:
        s = summary[p]
        its = sorted(by_page[p], key=lambda x: (x["priority"], x["line_in_ocr_page"] or 0))
        h.append(f'<h2 id="p{p}">PDF p. {p} (impresa {s["page_printed_derived"]}) — {html.escape(s["header_range"] or "")}</h2>')
        h.append(f'<p class="mut">Confianza media de Tesseract: {s["ocr_mean_conf"]} · lecturas disponibles: {", ".join(s["readings_available"])} · elementos a revisar: {s["items_total"]} (por prioridad {s["items_by_priority"]})</p>')
        txt = "\n".join(f"{i:>3}  {html.escape(l)}" for i, l in enumerate(lines_of(pages[p]["text"]), start=1))
        h.append(f'<div class="grid"><div><img loading="lazy" src="pages/p{p:04d}.png" alt="Página {p} del PDF original"></div><div><pre>{txt}</pre></div></div>')
        h.append("<table><tr><th>ID</th><th>Prio.</th><th>Tipo</th><th>Línea/pos.</th><th>OCR actual</th><th>thick600</th><th>spaeng300</th><th>¿Especialista?</th></tr>")
        for it in its:
            rd = it["readings"]
            if it["item_type"] == "grupo_tildes":
                cell = ", ".join(f'{html.escape(x["token"])} <span class="mut">(l{x["line"]})</span>' for x in rd["ocr_actual"])
                loc = "—"
                oth = ("", "")
            else:
                cell = html.escape(str(rd["ocr_actual"]))
                loc = f'{it["line_in_ocr_page"]}/{it["token_position_in_line"]}'
                oth = tuple(f'<span class="mut">{html.escape(show(rd[c]))}</span>' if rd[c] in (None, "") else html.escape(str(rd[c])) for c in ALTS)
            also = (" + " + ", ".join(it["also_flagged_as"])) if it["also_flagged_as"] else ""
            h.append(f'<tr><td>{it["item_id"]}</td><td class="p{it["priority"]}">P{it["priority"]}</td><td>{it["item_type"]}{html.escape(also)}<br><span class="mut">{html.escape(it["description"])}</span></td>'
                     f"<td>{loc}</td><td>{cell}</td><td>{oth[0]}</td><td>{oth[1]}</td><td>{'sí' if it['step2_requires_specialist'] else 'no'}</td></tr>")
        h.append("</table>")
    h.append("</body></html>")
    (OUT / "index.html").write_text("\n".join(h), encoding="utf-8")


if __name__ == "__main__":
    main()
