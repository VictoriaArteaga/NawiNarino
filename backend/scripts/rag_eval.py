"""Evalúa la recuperación RAG con rag_data/eval/questions.json.

Uso (desde backend/):
    python -m scripts.rag_eval                              # HashingEmbedder, umbrales actuales
    python -m scripts.rag_eval --embedder ollama:bge-m3     # requiere Ollama local con el modelo
    python -m scripts.rag_eval --embedder ollama:bge-m3 --min-score 0.5 --min-overlap 0
    python -m scripts.rag_eval --sweep                      # barrido de umbrales (informe)
    python -m scripts.rag_eval -v                           # detalle por pregunta
"""

import argparse
import itertools
import sys
from pathlib import Path

from app.core.config import get_settings
from app.rag.embedders_optional import OllamaEmbedder
from app.rag.embeddings import HashingEmbedder
from app.rag.evaluation import evaluate, load_questions
from app.rag.pipeline import RagPipeline

SYNTHETIC = Path(__file__).resolve().parents[1] / "rag_data" / "synthetic" / "manifest.json"
QUESTIONS = Path(__file__).resolve().parents[1] / "rag_data" / "eval" / "questions.json"


def build_embedder(spec: str):
    if spec == "hashing":
        return HashingEmbedder()
    if spec.startswith("ollama:"):
        return OllamaEmbedder(spec.split(":", 1)[1])
    raise SystemExit(f"embedder desconocido: {spec}")


def print_summary(summary, verbose: bool) -> None:
    for cat, m in summary.by_category().items():
        print(f"  {cat:<14} n={int(m['n']):<2} ok={m['ok']:.2f} any={m['any_correct']:.2f} precise={m['precise']:.2f}")
    t = summary.totals()
    print(
        "  TOTAL  top1={answerable_top1:.2f} any={answerable_any:.2f} precise={answerable_precise:.2f} "
        "falsas_abstenciones={false_abstentions:.0f} abstenciones_ok={correct_abstentions:.2f} "
        "respuestas_falsas={false_answers:.0f} global={overall_ok:.2f}".format(**t)
    )
    if verbose:
        for r in summary.results:
            if not r.ok or not r.precise:
                print(f"    [{r.id}] ok={r.ok} precise={r.precise} abst={r.abstained} score={r.top_score} cited={r.cited} :: {r.question}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--embedder", default="hashing")
    parser.add_argument("--min-score", type=float, default=0.15)
    parser.add_argument("--min-overlap", type=int, default=1)
    parser.add_argument("--relative-min", type=float, default=0.85)
    parser.add_argument("--min-coverage", type=float, default=0.0)
    parser.add_argument("--sweep", action="store_true")
    parser.add_argument("--sweep-scores", default="0.10,0.15,0.20,0.25,0.30,0.40")
    parser.add_argument("-v", "--verbose", action="store_true")
    args = parser.parse_args()

    embedder = build_embedder(args.embedder)
    pipeline = RagPipeline(
        embedder,
        min_score=args.min_score,
        min_overlap=args.min_overlap,
        relative_min=args.relative_min,
        min_coverage=args.min_coverage,
    )
    report = pipeline.ingest(SYNTHETIC)
    print(f"Embedder: {embedder.name} (dim={embedder.dim}); fragmentos={len(pipeline.store.chunks)}; rechazados={len(report.rejected)}")
    questions = load_questions(QUESTIONS)

    if not args.sweep:
        print(f"Umbrales: min_score={args.min_score} min_overlap={args.min_overlap} relative_min={args.relative_min} min_coverage={args.min_coverage}")
        print_summary(evaluate(pipeline, questions), args.verbose)
        return 0

    print("min_score min_overlap relative_min coverage | top1 any precise falsas_abst abst_ok resp_falsas")
    scores = [float(x) for x in args.sweep_scores.split(',')]
    for ms, mo, rm, mc in itertools.product(scores, (0, 1), (0.0, 0.65, 0.85), (0.0, 0.5, 0.7)):
        r = pipeline.retriever
        r.min_score, r.min_overlap, r.relative_min, r.min_coverage = ms, mo, rm, mc
        t = evaluate(pipeline, questions).totals()
        print(
            f"{ms:>9.2f} {mo:>11} {rm:>12.2f} {mc:>8.2f} | {t['answerable_top1']:.2f} {t['answerable_any']:.2f} "
            f"{t['answerable_precise']:.2f} {t['false_abstentions']:>10.0f} {t['correct_abstentions']:.2f} {t['false_answers']:>11.0f}"
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
