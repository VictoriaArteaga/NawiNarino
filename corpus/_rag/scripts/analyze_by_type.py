"""Metricas por tipo de contenido para OCR actual, thick600 y spaeng300 (Borman 1976).

Referencias manuales (ocr/experiments/ground_truth/), transcritas y verificadas contra las imagenes:
  diccionario cofan-castellano: p41 | diccionario castellano-cofan: p95 | fauna: p69 | flora: p78
  gramatica: p127, p129 | tabla del alfabeto: 42 palabras de ejemplo (p123-124)
Criterios de decision FIJADOS ANTES de calcular (ver CRITERIA): se aplican a las paginas NUEVAS (69, 78, 127, 129).

No reemplaza ni normaliza caracteres: compara tokens tal cual, solo recortando signos de puntuacion y comillas
tipograficas en los bordes de cada token.

Uso: python -X utf8 analyze_by_type.py
"""
import collections
import json
import re
from pathlib import Path

RAG = Path(__file__).resolve().parents[1]
EXP = RAG / "ocr" / "experiments"
BASE_OCR = RAG / "ocr" / "unreviewed" / "sil-borman_vocabulario-cofan-1976.pages.jsonl"
ACC = set("áéíóúñüÁÉÍÓÚÑ")
STRIP = ',.;:()"“”«»[]‘’'
TYPES = {
    "diccionario cofán→castellano (p41)": [41],
    "diccionario castellano→cofán (p95)": [95],
    "fauna (p69)": [69],
    "flora (p78)": [78],
    "gramática (p127, p129)": [127, 129],
}
NEW_PAGES = [69, 78, 127, 129]
CONFIGS = ["ocr_actual", "thick600", "spaeng300"]
CRITERIA = {
    "glottal_gain_min_points": 5.0,   # recall glotal agrupado en paginas nuevas >= actual + 5 puntos
    "accent_loss_max_points": 2.0,    # recall de acentos >= actual - 2 puntos
    "f1_loss_max_per_page": 0.01,     # F1 de cada pagina nueva >= actual - 0.01
}


def toks(t):
    out = []
    for w in t.split():
        w = w.strip(STRIP).lstrip("'")
        if w and w not in ("—", "-", "–"):
            out.append(w)
    # une el sufijo suelto '-a' (artefacto de tokenizacion comun a todas las lecturas)
    res = []
    for w in out:
        if w == "-a" and res:
            res[-1] += "-a"
        else:
            res.append(w)
    return res


def load(cfg, p):
    if cfg == "ocr_actual":
        for l in BASE_OCR.read_text(encoding="utf-8").splitlines():
            r = json.loads(l)
            if r["page"] == p:
                return r["text"]
    return (EXP / "borman" / cfg / f"p{p:04d}.txt").read_text(encoding="utf-8")


def gt(p):
    return toks((EXP / "ground_truth" / f"p{p:04d}.txt").read_text(encoding="utf-8"))


def f1(g, o):
    G, O = collections.Counter(g), collections.Counter(o)
    tp = sum((G & O).values())
    pr, rc = tp / max(sum(O.values()), 1), tp / max(sum(G.values()), 1)
    return (2 * pr * rc / (pr + rc)) if pr + rc else 0.0


def recall(g, o, pred):
    G = collections.Counter(w for w in g if pred(w))
    tp = sum((G & collections.Counter(o)).values())
    return tp, sum(G.values())


is_glot = lambda w: "'" in w
is_acc = lambda w: any(c in ACC for c in w)


def pooled(cfg, pages):
    g_all, o_all = [], []
    for p in pages:
        g_all += gt(p)
        o_all += toks(load(cfg, p))
    return g_all, o_all


def row(cfg, pages):
    g, o = pooled(cfg, pages)
    gt_n, gt_d = recall(g, o, is_glot)
    ac_n, ac_d = recall(g, o, is_acc)
    txt = "\n".join(load(cfg, p) for p in pages)
    return {
        "tokens_ref": len(g), "F1": round(f1(g, o), 3),
        "glotal": f"{gt_n}/{gt_d}", "glotal_pct": round(100 * gt_n / max(gt_d, 1), 1),
        "acentos": f"{ac_n}/{ac_d}", "acentos_pct": round(100 * ac_n / max(ac_d, 1), 1),
        "exclam_en_palabra": len(re.findall(r"\w!\w|\w!'|'!\w", txt)),
        "l_por_glotal_candidatos": None,
    }


def alphabet_row(cfg):
    ok = tot = 0
    for line in (EXP / "ground_truth" / "alphabet_examples.txt").read_text(encoding="utf-8").splitlines():
        if line and not line.startswith("#"):
            p, w = line.split("\t")
            ok += w in set(toks(load(cfg, int(p))))
            tot += 1
    return f"{ok}/{tot}"


def main():
    res = {"types": {}, "criteria": CRITERIA}
    for tname, pages in TYPES.items():
        res["types"][tname] = {c: row(c, pages) for c in CONFIGS}
    res["alphabet_table"] = {c: alphabet_row(c) for c in CONFIGS}
    res["pooled_new_pages"] = {c: row(c, NEW_PAGES) for c in CONFIGS}
    res["pooled_all_refs"] = {c: row(c, [41, 95, 69, 78, 127, 129]) for c in CONFIGS}
    per_page_f1 = {c: {p: round(f1(gt(p), toks(load(c, p))), 3) for p in [41, 95] + NEW_PAGES} for c in CONFIGS}
    res["f1_per_page"] = per_page_f1

    a, t = res["pooled_new_pages"]["ocr_actual"], res["pooled_new_pages"]["thick600"]
    checks = {
        "glotal: thick600 >= actual + 5 pts": (t["glotal_pct"] - a["glotal_pct"], t["glotal_pct"] - a["glotal_pct"] >= CRITERIA["glottal_gain_min_points"]),
        "acentos: thick600 >= actual - 2 pts": (t["acentos_pct"] - a["acentos_pct"], t["acentos_pct"] - a["acentos_pct"] >= -CRITERIA["accent_loss_max_points"]),
    }
    worst = min(per_page_f1["thick600"][p] - per_page_f1["ocr_actual"][p] for p in NEW_PAGES)
    checks["F1 por pagina nueva: peor diferencia >= -0.01"] = (round(worst, 3), worst >= -CRITERIA["f1_loss_max_per_page"])
    res["decision_thick600"] = {k: {"valor": v[0], "cumple": bool(v[1])} for k, v in checks.items()}
    res["decision_thick600"]["conclusion"] = "FAVORABLE" if all(v[1] for v in checks.values()) else "NO FAVORABLE"
    (EXP / "results_by_type.json").write_text(json.dumps(res, ensure_ascii=False, indent=2), encoding="utf-8")

    for tname in res["types"]:
        print("##", tname)
        for c in CONFIGS:
            r = res["types"][tname][c]
            print(f'  {c:11s} F1 {r["F1"]:.3f} | glotal {r["glotal"]} ({r["glotal_pct"]}%) | acentos {r["acentos"]} ({r["acentos_pct"]}%) | ! en palabra {r["exclam_en_palabra"]}')
    print("## tabla del alfabeto", res["alphabet_table"])
    for k in ("pooled_new_pages", "pooled_all_refs"):
        print("##", k)
        for c in CONFIGS:
            r = res[k][c]
            print(f'  {c:11s} F1 {r["F1"]:.3f} | glotal {r["glotal"]} ({r["glotal_pct"]}%) | acentos {r["acentos"]} ({r["acentos_pct"]}%) | ! en palabra {r["exclam_en_palabra"]}')
    print("## F1 por pagina", json.dumps(per_page_f1))
    print("## decision", json.dumps(res["decision_thick600"], ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
