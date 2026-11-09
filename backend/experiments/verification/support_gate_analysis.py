"""Análisis (EXPERIMENTAL, no toca app/): ¿una compuerta determinista de «soporte de
la pregunta» puede evitar respuestas sobre datos no documentados sin perjudicar
las respuestas correctas?

Compuerta evaluada: la respuesta de producción se retira (abstención) si algún
término de contenido de la pregunta no aparece en los fragmentos citados.
Variantes (decididas ANTES de medir):
  G1  todos los términos de contenido deben aparecer (comparación plegada, exacta)
  G2  G1 ignorando una lista cerrada y a priori de verbos/palabras interrogativas genéricas
  G3  G2 con coincidencia por raíz (prefijo de 5 letras) para variantes morfológicas

Conjuntos (todos ficticios): A (38), B (18), demo, dev y test experimentales.
Etiquetas: respondible = hay dato en el corpus; abstención = no lo hay.

    python -m experiments.verification.support_gate_analysis
"""

import json
from collections import defaultdict
from pathlib import Path

from app.core.config import Settings
from app.rag.embeddings import content_tokens, tokenize
from app.rag.factory import build_engine

BACKEND = Path(__file__).resolve().parents[2]
DATA = BACKEND / "rag_data"
GENERIC = frozenset("significa significado significados pasa ocurre hace hacen existe existen llama denomina designa".split())

DEMO_ANSWERABLE = [
    "¿Cuál es el saludo de la mañana en la Lengua de Prueba?", "¿Qué pasa en la Fiesta de la Luna de Papel?",
    "¿Qué plato se prepara en la Fiesta de la Luna de Papel?", "¿Qué significa sa?", "¿Qué cultivan las familias del valle?",
    "¿Cómo se dice uno en la Lengua de Prueba?", "¿En qué orden pone el verbo la Lengua de Prueba?",
]
DEMO_ABSTAIN = [
    "¿Cómo se dice agua en awapit?", "¿Cuál es la capital de Colombia?", "¿Cómo se dice?",
    "¿Cómo se dice dos en la Lengua de Prueba?", "¿Quién fundó el Valle Ficticio?", "¿De qué color es el río Imaginario?",
]


def suites() -> dict[str, tuple[Path, list[tuple[str, bool]]]]:
    out = {}
    load = lambda p: json.loads(p.read_text(encoding="utf-8"))["questions"]
    a = load(DATA / "eval" / "questions.json")
    out["A"] = (DATA / "synthetic" / "manifest.json", [(q["q"], isinstance(q["expect"], dict)) for q in a])
    b = load(DATA / "eval" / "questions_lexical.json")
    out["B"] = (DATA / "synthetic_lexical" / "manifest.json", [(q["q"], isinstance(q["expect"], dict)) for q in b])
    out["demo"] = (DATA / "demo" / "manifest.json", [(q, True) for q in DEMO_ANSWERABLE] + [(q, False) for q in DEMO_ABSTAIN])
    for s in ("dev", "test"):
        qs = load(DATA / "synthetic_experiments" / s / "questions.json")
        out[s] = (DATA / "synthetic_experiments" / s / "manifest.json", [(q["q"], q["behavior"] != "abstain") for q in qs])
    return out


def supported(question: str, texts: list[str], variant: str) -> bool:
    terms = content_tokens(question)
    if variant in ("G2", "G3"):
        terms -= GENERIC
    have = set()
    for t in texts:
        have |= set(tokenize(t))
    if variant == "G3":
        stems = {h[:5] for h in have}
        return all(t in have or t[:5] in stems for t in terms)
    return all(t in have for t in terms)


def main() -> None:
    rows = defaultdict(lambda: defaultdict(int))
    lost: dict[str, list[str]] = defaultdict(list)
    kept_false: dict[str, list[str]] = defaultdict(list)
    for mode in ("hashing", "hybrid"):
        for name, (manifest, qs) in suites().items():
            engine = build_engine(Settings(rag_manifest_path=manifest, rag_retriever=mode))
            # texto del fragmento + metadata del documento (título y lengua): el nombre de la lengua
            # suele estar en la metadata y no repetido en cada página.
            texts = {c.metadata.chunk_id: f"{c.text} {c.metadata.title} {c.metadata.language.replace('_', ' ')}"
                     for c in engine.primary.store.chunks}
            for q, answerable in qs:
                a = engine.ask(q)
                cited = [texts[c.chunk_id] for c in a.citations]
                key = (mode, name)
                if a.abstained:
                    rows[key]["abst_ok" if not answerable else "abst_false"] += 1
                    continue
                rows[key]["answered_ok" if answerable else "answered_false"] += 1
                for v in ("G1", "G2", "G3"):
                    if not supported(q, cited, v):  # la compuerta retiraría la respuesta
                        if answerable:
                            rows[key][f"{v}_lost"] += 1
                            lost[f"{v}/{mode}"].append(f"{name}: {q}")
                        else:
                            rows[key][f"{v}_fixed"] += 1
                    elif not answerable:
                        kept_false[f"{v}/{mode}"].append(f"{name}: {q}")
    print("modo/conjunto | respondidas bien | respondidas SIN dato (falsas) | abstenciones falsas || para cada G: respuestas correctas PERDIDAS / falsas CORREGIDAS")
    tot = defaultdict(int)
    for (mode, name), r in sorted(rows.items()):
        line = f"{mode:<8}{name:<5}| ok {r['answered_ok']:<3} | falsas {r['answered_false']:<3} | abst.falsas {r['abst_false']:<3} ||"
        for v in ("G1", "G2", "G3"):
            line += f" {v}: -{r[v + '_lost']}/+{r[v + '_fixed']}"
            tot[(mode, v, "lost")] += r[v + "_lost"]
            tot[(mode, v, "fixed")] += r[v + "_fixed"]
        tot[(mode, "ok")] += r["answered_ok"]
        tot[(mode, "false")] += r["answered_false"]
        print(line)
    print()
    for mode in ("hashing", "hybrid"):
        print(f"TOTAL {mode}: respuestas correctas={tot[(mode, 'ok')]} falsas={tot[(mode, 'false')]} | " + " | ".join(
            f"{v}: perdidas {tot[(mode, v, 'lost')]} / corregidas {tot[(mode, v, 'fixed')]}" for v in ("G1", "G2", "G3")))
    for k in ("G2/hybrid", "G2/hashing"):
        print(f"\n[{k}] respuestas correctas que la compuerta retiraría ({len(lost[k])}):")
        for x in lost[k][:40]:
            print("   ", x)
    print("\n[G3/hybrid] falsas que NO corrige:")
    for x in kept_false["G3/hybrid"][:20]:
        print("   ", x)


if __name__ == "__main__":
    main()
