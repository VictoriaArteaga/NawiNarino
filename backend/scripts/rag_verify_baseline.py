"""Línea base de VERIFICACIÓN: ¿qué hace hoy el pipeline en cada categoría?

No agrega ningún verificador: mide el comportamiento actual (HashingEmbedder,
umbrales actuales) sobre rag_data/eval/questions_verification.json para
fijar el punto de partida del diseño experimental (docs/rag-verification-design.md).
El pipeline actual NO detecta contradicciones: «conflict» solo se cumple si
cita todas las fuentes en disputa Y se señala la contradicción; lo segundo no
existe todavía, por eso se informa por separado.

    python -m scripts.rag_verify_baseline [-v]
"""

import argparse
import json
import sys
from collections import defaultdict
from pathlib import Path

from app.rag.pipeline import RagPipeline

DATA = Path(__file__).resolve().parents[1] / "rag_data"
MANIFEST = DATA / "synthetic_verification" / "manifest.json"
QUESTIONS = DATA / "eval" / "questions_verification.json"


def judge(item: dict, answer) -> dict:
    cited = {(c.document_id, c.page) for c in answer.citations}
    support = {(d, p) for d, p in item["support"]}

    def in_support(doc_id: str, page: int) -> bool:
        return any(sd in doc_id and sp == page for sd, sp in support)

    behavior = item["behavior"]
    sources_ok = bool(cited) and all(in_support(d, p) for d, p in cited)
    covers_all = all(any(sd in d and sp == p for d, p in cited) for sd, sp in support)
    if behavior in ("abstain", "clarify_or_abstain"):
        return {"correct": answer.abstained, "detail": "abstuvo" if answer.abstained else "RESPONDIÓ sin evidencia"}
    if behavior == "answer":
        top = bool(cited) and in_support(*next(iter([(answer.citations[0].document_id, answer.citations[0].page)])))
        return {"correct": (not answer.abstained) and top, "detail": f"1.ª cita {'ok' if top else 'incorrecta'}; todas ok={sources_ok}"}
    if behavior == "answer_all":
        return {"correct": (not answer.abstained) and covers_all, "detail": f"cubre todas las fuentes={covers_all}"}
    if behavior == "conflict":
        # Correcto = cita todas las fuentes en disputa Y señala el conflicto.
        flagged = any("contradic" in n.lower() or "conflicto" in n.lower() for n in answer.notices)
        return {
            "correct": (not answer.abstained) and covers_all and flagged or answer.abstained,
            "detail": f"cita ambas fuentes={covers_all}; contradicción señalada={flagged}",
            "covers_all": covers_all,
            "flagged": flagged,
        }
    raise ValueError(behavior)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("-v", "--verbose", action="store_true")
    args = parser.parse_args()
    pipeline = RagPipeline()
    report = pipeline.ingest(MANIFEST)
    assert not report.rejected, report.rejected
    items = json.loads(QUESTIONS.read_text(encoding="utf-8"))["questions"]
    by_cat: dict[str, list[dict]] = defaultdict(list)
    for item in items:
        result = judge(item, pipeline.ask(item["q"]))
        by_cat[item["category"]].append({**result, "id": item["id"], "q": item["q"]})
    print(f"Fragmentos={len(pipeline.store.chunks)}; preguntas={len(items)}")
    for cat, rs in by_cat.items():
        print(f"  {cat:<15} correctas {sum(r['correct'] for r in rs)}/{len(rs)}")
        if args.verbose:
            for r in rs:
                print(f"      [{r['id']}] {'OK ' if r['correct'] else 'MAL'} {r['detail']} :: {r['q']}")
    conflicts = by_cat.get("contradictory", [])
    print(
        "  contradictory: cita ambas fuentes "
        f"{sum(r['covers_all'] for r in conflicts)}/{len(conflicts)}; "
        f"señala contradicción {sum(r['flagged'] for r in conflicts)}/{len(conflicts)}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
