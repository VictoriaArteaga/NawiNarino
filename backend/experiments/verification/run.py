"""Orquestador: ajusta en `dev`, congela parámetros, mide UNA vez en `test`.

    python -m experiments.verification.run [--no-write]

Escribe experiments/results/{results.json,errors_test.json}. Requiere las
cachés `dev` y `test` (experiments.verification.precompute).
"""

import argparse
import json
import sys
from pathlib import Path

from experiments.verification.evaluate import (
    SYSTEMS, ROOT, evaluate_system, latency, load_cache, load_questions, tune,
)
from experiments.verification.judge import summarize, total_errors, wilson

RESULTS = ROOT / "experiments" / "results"
NAMES = {
    "S0": "híbrida (sin reranker)", "S1": "híbrida + reranker", "S2": "híbrida + QA",
    "S3": "híbrida + reranker + QA", "S4": "híbrida + QA + puerta léxica",
    "S5": "híbrida + reranker + QA + puerta léxica",
}


def row(name: str, s: dict, lat: dict) -> str:
    a, b, c, d, ci = s["answerable"], s["abstain"], s["conflict"], s["conflict_status"], s["citations"]
    lo, hi = wilson(b["false_answer"], b["n"])
    return (
        f"| {name} {NAMES[name]} | {a['correct']}/{a['n']} | {a['false_abstention']} | {a['wrong_answer']} | "
        f"{a['false_conflict']} | **{b['false_answer']}/{b['n']}** ({lo:.0%}–{hi:.0%}) | "
        f"{c['detected']}/{c['n']} (cierta {c['false_certainty']}) | {d['detected']}/{d['n']} (resuelta {d['resolved_by_status']}, cierta {d['false_certainty']}) | "
        f"{ci['precise']}/{ci['n']} | {ci['with_irrelevant']} | {lat['mean_ms']:.0f} |"
    )


HEADER = (
    "| Sistema | Respuestas correctas | Falsas abstenciones | Respuestas erróneas | Falsos conflictos | Respuestas falsas (IC95 %) "
    "| Conflicto: detectado (certeza falsa) | Conflicto con validada: detectado (resuelta, certeza falsa) | Citas precisas | Con cita irrelevante | ms verificación/pregunta |\n"
    "|---|---|---|---|---|---|---|---|---|---|---|"
)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--no-write", action="store_true")
    args = parser.parse_args()
    dev_q, test_q = load_questions("dev"), load_questions("test")
    dev_c, test_c = load_cache("dev"), load_cache("test")

    chosen, report = {}, {"params": {}, "dev": {}, "test": {}, "latency_test": {}}
    for name in SYSTEMS:
        p, err, ties = tune(name, dev_q, dev_c)
        chosen[name] = p
        report["params"][name] = {**p.__dict__, "dev_errors": err, "tied_combinations": ties}
    for split, qs, cache in (("dev", dev_q, dev_c), ("test", test_q, test_c)):
        lines = []
        for name in SYSTEMS:
            js = evaluate_system(name, qs, cache, chosen[name])
            s = summarize([j for _, _, j in js])
            lat = latency(name, qs, cache, chosen[name])
            report[split][name] = {"summary": s, "errors": total_errors(s)}
            if split == "test":
                report["latency_test"][name] = lat
                report.setdefault("error_cases", {})[name] = [
                    {"id": q["id"], "role": q["role"], "behavior": q["behavior"], "q": q["q"], "status": o.status,
                     "chosen": o.chosen, "values": o.values, "citations": o.citations, "gold": q["gold_values"],
                     "flags": {k: v for k, v in j.flags.items() if v and k in (
                         "false_abstention", "wrong_answer", "false_conflict", "false_answer", "false_certainty")}}
                    for q, o, j in js
                    if any(j.flags.get(f) for f in ("false_abstention", "wrong_answer", "false_conflict", "false_answer", "false_certainty"))
                    or (q["behavior"] in ("conflict", "conflict_status") and not j.flags.get("correct"))
                ]
            lines.append(row(name, s, lat))
        print(f"\n### {split.upper()} ({len(qs)} preguntas)" + (" — parámetros ajustados AQUÍ (optimista)" if split == "dev" else " — evaluación final"))
        print(HEADER)
        print("\n".join(lines))
    print("\nParámetros elegidos en dev:")
    for name, p in report["params"].items():
        print(f"  {name}: {p}")
    if not args.no_write:
        RESULTS.mkdir(parents=True, exist_ok=True)
        (RESULTS / "results.json").write_text(json.dumps({k: v for k, v in report.items() if k != "error_cases"}, ensure_ascii=False, indent=1), encoding="utf-8")
        (RESULTS / "errors_test.json").write_text(json.dumps(report["error_cases"], ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"\nResultados en {RESULTS}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
