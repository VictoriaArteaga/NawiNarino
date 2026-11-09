"""Evalua las configuraciones de ocr_experiments.py contra las referencias manuales.

Referencias (ocr/experiments/ground_truth/): paginas 41 y 95 completas, y 42 palabras de la tabla
del alfabeto (pp. 123-124). Se transcribieron a mano desde las imagenes; el apostrofo ASCII (') denota
la marca vertical elevada impresa. Son referencias de trabajo, no un estandar de oro revisado por hablantes.

Uso: python -X utf8 analyze_experiments.py
"""
import collections
import difflib
import json
import re
import statistics as st
from pathlib import Path

RAG = Path(__file__).resolve().parents[1]
EXP = RAG / "ocr" / "experiments"
BASE = RAG / "ocr" / "unreviewed" / "sil-borman_vocabulario-cofan-1976.pages.jsonl"
ACC = set("áéíóúñüÁÉÍÓÚÑ")
OUTER = ',.;:()"“”«»[]'


def toks(t):
    out = []
    for w in t.split():
        w = w.strip(OUTER)
        if w and w not in "—-–":
            out.append(w)
    return out


def f1(gt, oc):
    g, o = collections.Counter(gt), collections.Counter(oc)
    tp = sum((g & o).values())
    p = tp / max(sum(o.values()), 1)
    r = tp / max(sum(g.values()), 1)
    return round(2 * p * r / (p + r), 3) if p + r else 0.0, round(p, 3), round(r, 3)


def recall_subset(gt, oc, pred):
    sub = collections.Counter(w for w in gt if pred(w))
    got = collections.Counter(oc)
    tp = sum((sub & got).values())
    return tp, sum(sub.values())


def glottal_confusion(gt, oc, tally):
    """Para cada token de referencia con ' no leido exacto, busca el token OCR mas parecido y
    anota que caracter(es) ocupan el lugar de la marca. No asume equivalencias: solo cuenta."""
    ocs = collections.Counter(oc)
    pool = list(ocs)
    for w in gt:
        if "'" not in w:
            continue
        if ocs[w] > 0:
            tally["leido como ' (exacto)"] += w.count("'")
            continue
        m = difflib.get_close_matches(w, pool, n=1, cutoff=0.7)
        if not m:
            tally["token no encontrado"] += 1
            continue
        sm = difflib.SequenceMatcher(None, w, m[0], autojunk=False)
        for op, i1, i2, j1, j2 in sm.get_opcodes():
            seg = w[i1:i2]
            if op == "equal":
                continue
            if "'" in seg:
                got = m[0][j1:j2]
                tally[("ausente" if op == "delete" else "→ " + repr(got)) if got != seg else "?"] += seg.count("'")
            elif op in ("replace", "insert", "delete"):
                tally["otro error en el token (no glotal)"] += 1


def load_gt():
    gt = {}
    for p in (41, 95):
        gt[p] = toks((EXP / "ground_truth" / f"p{p:04d}.txt").read_text(encoding="utf-8"))
    alpha = collections.defaultdict(list)
    for line in (EXP / "ground_truth" / "alphabet_examples.txt").read_text(encoding="utf-8").splitlines():
        if line and not line.startswith("#"):
            p, w = line.split("\t")
            alpha[int(p)].append(w)
    return gt, alpha


def load_config(name):
    if name == "ocr_actual":
        pages = {}
        for l in BASE.read_text(encoding="utf-8").splitlines():
            r = json.loads(l)
            pages[r["page"]] = r["text"]
        return pages
    d = EXP / "borman" / name
    return {int(f.stem[1:]): f.read_text(encoding="utf-8") for f in d.glob("p*.txt")}


def main():
    conf = json.loads((EXP / "confidence.json").read_text(encoding="utf-8"))
    pages = list(map(int, conf["pages"]))
    gt, alpha = load_gt()
    names = ["ocr_actual"] + list(conf["configs"])
    results = {}
    for n in names:
        D = load_config(n)
        r = {}
        # 1. paginas con referencia completa
        for p in (41, 95):
            oc = toks(D[p])
            r[f"p{p}_f1"], r[f"p{p}_prec"], r[f"p{p}_rec"] = f1(gt[p], oc)
        gall = gt[41] + gt[95]
        oall = toks(D[41]) + toks(D[95])
        tp, tot = recall_subset(gall, oall, lambda w: "'" in w)
        r["glottal_tokens_exact"] = f"{tp}/{tot}"
        r["glottal_tokens_pct"] = round(100 * tp / tot, 1)
        tp, tot = recall_subset(gall, oall, lambda w: any(c in ACC for c in w))
        r["accent_tokens_exact"] = f"{tp}/{tot}"
        r["accent_tokens_pct"] = round(100 * tp / tot, 1)
        # 2. tabla del alfabeto
        found = tot_a = 0
        for p, ws in alpha.items():
            tk = set(toks(D[p]))
            found += sum(w in tk for w in ws)
            tot_a += len(ws)
        r["alphabet_words_exact"] = f"{found}/{tot_a}"
        r["alphabet_words_pct"] = round(100 * found / tot_a, 1)
        # 3. que sale en lugar de la marca
        tally = collections.Counter()
        glottal_confusion(gall, oall, tally)
        for p, ws in alpha.items():
            glottal_confusion(ws, toks(D[p]), tally)
        r["glottal_confusion"] = dict(tally.most_common())
        # 4. contadores en las 10 paginas (no requieren referencia)
        alltxt = "\n".join(D[p] for p in pages)
        r["mid_word_exclam"] = len(re.findall(r"\w!\w|\w!'|'!\w", alltxt))
        r["mid_word_pipe"] = len(re.findall(r"\w\|\w", alltxt))
        r["mid_word_straight_apos"] = len(re.findall(r"\w'\w", alltxt))
        r["mid_word_curly_or_acute"] = len(re.findall(r"\w[’‘´`]\w", alltxt))
        r["accented_chars_total"] = sum(c in ACC for c in alltxt)
        r["words_total"] = len(toks(alltxt))
        if n != "ocr_actual":
            confs = [conf["results"][n][str(p)]["mean_conf"] for p in pages if conf["results"][n][str(p)]["mean_conf"]]
            r["mean_conf_tesseract"] = round(st.mean(confs), 1)
        results[n] = r
    (EXP / "results.json").write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    hdr = ["config", "p41 F1", "p95 F1", "glotal exactos", "acentos exactos", "alfabeto", "'!' en palabra", "'|'", "' recto", "conf"]
    print(" | ".join(hdr))
    for n, r in results.items():
        print(" | ".join(map(str, [n, r["p41_f1"], r["p95_f1"], f'{r["glottal_tokens_exact"]} ({r["glottal_tokens_pct"]}%)',
                                    f'{r["accent_tokens_exact"]} ({r["accent_tokens_pct"]}%)', f'{r["alphabet_words_exact"]} ({r["alphabet_words_pct"]}%)',
                                    r["mid_word_exclam"], r["mid_word_pipe"], r["mid_word_straight_apos"], r.get("mean_conf_tesseract", "-")])))
    print()
    for n, r in results.items():
        print(n, r["glottal_confusion"])


if __name__ == "__main__":
    main()
