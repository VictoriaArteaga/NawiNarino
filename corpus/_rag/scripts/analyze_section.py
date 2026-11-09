"""Evaluacion de thick600 en la seccion castellano->cofan (PDF pp. 84-121) con paginas NUEVAS.

Paginas nuevas con referencia manual (transcritas desde la imagen ANTES de ver el OCR): p102 y p118.
La p95 ya se uso para formular la hipotesis y se muestra solo como contexto: NO entra en la decision.
Criterios identicos a los originales (analyze_by_type.CRITERIA): glotal >= +5 pts; acentos >= -2 pts;
F1 por pagina no inferior a -0,01.

Uso: python -X utf8 analyze_section.py
"""
import collections
import difflib
import json
from pathlib import Path

import analyze_by_type as A

EXP = A.EXP
NEW = [102, 118]
CTX = [95]
CFG = A.CONFIGS


def confusion(cfg, pages):
    """Que ocupa el lugar de cada marca glotal de la referencia. Solo cuenta; no asume equivalencias."""
    tally = collections.Counter()
    for p in pages:
        o = collections.Counter(A.toks(A.load(cfg, p)))
        pool = list(o)
        for w in A.gt(p):
            if "'" not in w:
                continue
            if o[w] > 0:
                tally["exacto"] += w.count("'")
                continue
            m = difflib.get_close_matches(w, pool, n=1, cutoff=0.6)
            if not m:
                tally["token no encontrado"] += 1
                continue
            sm = difflib.SequenceMatcher(None, w, m[0], autojunk=False)
            for op, i1, i2, j1, j2 in sm.get_opcodes():
                if op != "equal" and "'" in w[i1:i2]:
                    tally["ausente" if op == "delete" else repr(m[0][j1:j2])] += 1
    return dict(tally)


def errors(cfg, p):
    g = collections.Counter(A.gt(p))
    o = collections.Counter(A.toks(A.load(cfg, p)))
    return {"no_leidos_glotal_o_acento": sorted(w for w in (g - o).elements() if A.is_glot(w) or A.is_acc(w)),
            "lecturas_distintas": sorted(w for w in (o - g).elements() if len(w) > 2)}


def main():
    res = {"pages_new": NEW, "context_not_in_decision": CTX, "criteria": A.CRITERIA}
    res["per_page"] = {}
    for p in NEW + CTX:
        res["per_page"][p] = {c: {**A.row(c, [p]), "F1_pagina": round(A.f1(A.gt(p), A.toks(A.load(c, p))), 3)} for c in CFG}
    res["pooled_new"] = {c: A.row(c, NEW) for c in CFG}
    res["glottal_confusion_new"] = {c: confusion(c, NEW) for c in CFG}

    a, t = res["pooled_new"]["ocr_actual"], res["pooled_new"]["thick600"]
    f1d = {p: round(res["per_page"][p]["thick600"]["F1_pagina"] - res["per_page"][p]["ocr_actual"]["F1_pagina"], 3) for p in NEW}
    crit = {
        "glotal: thick600 >= actual + 5 pts": {"valor": round(t["glotal_pct"] - a["glotal_pct"], 1), "cumple": t["glotal_pct"] - a["glotal_pct"] >= 5.0},
        "acentos: thick600 >= actual - 2 pts": {"valor": round(t["acentos_pct"] - a["acentos_pct"], 1), "cumple": t["acentos_pct"] - a["acentos_pct"] >= -2.0},
        "F1 por pagina: ninguna baja mas de 0.01": {"valor": f1d, "cumple": all(v >= -0.01 for v in f1d.values())},
    }
    crit["conclusion"] = "CUMPLE" if all(v["cumple"] for k, v in crit.items() if k != "conclusion") else "NO CUMPLE"
    res["decision_thick600"] = crit

    # ensamble de tres lecturas en las paginas nuevas
    tot = collections.Counter()
    spec = collections.Counter()
    for p in NEW:
        g = set(A.gt(p))
        sets = [set(A.toks(A.load(c, p))) for c in CFG]
        for tk in set().union(*sets):
            n = sum(tk in s for s in sets)
            key = ("acuerdo" if n == 3 else "desacuerdo", "correcto" if tk in g else "incorrecto")
            tot[key] += 1
            if A.is_glot(tk) or A.is_acc(tk) or "!" in tk:
                spec[key] += 1
    res["ensemble_new"] = {"todos": {f"{k[0]}_{k[1]}": v for k, v in tot.items()}, "glotal_acento_exclam": {f"{k[0]}_{k[1]}": v for k, v in spec.items()}}
    res["errors"] = {p: {c: errors(c, p) for c in CFG} for p in NEW}
    (EXP / "results_section_castellano_cofan.json").write_text(json.dumps(res, ensure_ascii=False, indent=2), encoding="utf-8")

    for p in NEW + CTX:
        print(f"## p{p}{' (contexto, no decide)' if p in CTX else ''}")
        for c in CFG:
            r = res["per_page"][p][c]
            print(f'  {c:11s} F1 {r["F1_pagina"]:.3f} | glotal {r["glotal"]} ({r["glotal_pct"]}%) | acentos {r["acentos"]} ({r["acentos_pct"]}%) | ! en palabra {r["exclam_en_palabra"]}')
    print("## agrupado paginas nuevas")
    for c in CFG:
        r = res["pooled_new"][c]
        print(f'  {c:11s} F1 {r["F1"]:.3f} | glotal {r["glotal"]} ({r["glotal_pct"]}%) | acentos {r["acentos"]} ({r["acentos_pct"]}%) | ! en palabra {r["exclam_en_palabra"]}')
    print("## confusion glotal", json.dumps(res["glottal_confusion_new"], ensure_ascii=False))
    print("## decision", json.dumps(res["decision_thick600"], ensure_ascii=False, indent=1))
    print("## ensemble", json.dumps(res["ensemble_new"], ensure_ascii=False))
    for p in NEW:
        for c in CFG:
            print(p, c, res["errors"][p][c]["no_leidos_glotal_o_acento"], res["errors"][p][c]["lecturas_distintas"][:12])


if __name__ == "__main__":
    main()
