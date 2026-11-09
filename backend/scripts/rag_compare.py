"""Compara Hashing, bge-m3 e híbrida sobre los MISMOS documentos y preguntas.

Suites (documentos sintéticos y preguntas de rag_data/):
  A = synthetic/ + eval/questions.json            (38 preguntas)
  B = synthetic_lexical/ + eval/questions_lexical.json (18 preguntas: formas casi idénticas)

Requiere Ollama local con bge-m3. Uso (desde backend/):
    python -m scripts.rag_compare            # configuraciones fijas
    python -m scripts.rag_compare --sweep    # barrido de alpha y min_score de las híbridas
"""

import argparse
import itertools
import json
import sys
from pathlib import Path

from app.rag.embedders_optional import OllamaEmbedder
from app.rag.embeddings import HashingEmbedder
from app.rag.evaluation import evaluate
from app.rag.hybrid import HybridRetriever
from app.rag.pipeline import RagPipeline
from app.rag.retrieval import Retriever

DATA = Path(__file__).resolve().parents[1] / "rag_data"
SUITES = {
    "A": (DATA / "synthetic" / "manifest.json", DATA / "eval" / "questions.json"),
    "B": (DATA / "synthetic_lexical" / "manifest.json", DATA / "eval" / "questions_lexical.json"),
}


def load(path: Path) -> list[dict]:
    return json.loads(path.read_text(encoding="utf-8"))["questions"]


def counts(summary, questions) -> dict[str, str]:
    """Conteos k/n (no porcentajes) para no aparentar precisión."""
    tags = {q["id"]: q.get("tag", q["category"]) for q in questions}
    answ = [r for r in summary.results if isinstance(r.expect, dict)]
    abst = [r for r in summary.results if not isinstance(r.expect, dict)]
    out = {
        "top1": f"{sum(r.ok for r in answ)}/{len(answ)}",
        "precise": f"{sum(r.precise for r in answ)}/{len(answ)}",
        "falsa_abst": f"{sum(r.abstained for r in answ)}",
        "resp_falsas": f"{sum(not r.abstained for r in abst)}/{len(abst)}",
    }
    exact = [r for r in summary.results if tags[r.id] == "exact"]
    if exact:
        out["exact_top1"] = f"{sum(r.ok for r in exact)}/{len(exact)}"
    unk = [r for r in summary.results if tags[r.id] == "unknown_form"]
    if unk:
        out["forma_inexistente_abst"] = f"{sum(r.abstained for r in unk)}/{len(unk)}"
    return out


def fmt(label: str, a: dict, b: dict) -> str:
    return (
        f"{label:<34}| A top1 {a['top1']:<6} prec {a['precise']:<6} fAbst {a['falsa_abst']:<2} respFalsas {a['resp_falsas']:<5}"
        f"| B top1 {b['top1']:<6} exact {b['exact_top1']:<5} prec {b['precise']:<6} fAbst {b['falsa_abst']:<2} "
        f"formaInexist.abst {b['forma_inexistente_abst']:<4} respFalsas {b['resp_falsas']}"
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sweep", action="store_true")
    args = parser.parse_args()

    hashing, bge = HashingEmbedder(), OllamaEmbedder("bge-m3")
    pipes: dict[tuple[str, str], RagPipeline] = {}
    qs = {s: load(q) for s, (_, q) in SUITES.items()}
    for s, (manifest, _) in SUITES.items():
        for name, emb in (("hashing", hashing), ("bge", bge)):
            p = RagPipeline(emb)
            report = p.ingest(manifest)
            assert not report.rejected, report.rejected
            pipes[(s, name)] = p

    def run(label: str, make_retriever) -> tuple[dict, dict]:
        res = {}
        for s in SUITES:
            base = "hashing" if label.startswith("hashing") else "bge"
            p = pipes[(s, base)]
            p.retriever = make_retriever(p)
            res[s] = counts(evaluate(p, qs[s]), qs[s])
        return res["A"], res["B"]

    rows = [
        ("hashing (actual)", lambda p: Retriever(p.store, p.embedder, min_score=0.15, min_overlap=1, relative_min=0.85)),
        ("bge-m3 (min_score .30)", lambda p: Retriever(p.store, p.embedder, min_score=0.30, min_overlap=1, relative_min=0.85)),
    ]
    if args.sweep:
        for lex, alpha, ms in itertools.product(("hash", "bm25"), (0.3, 0.5, 0.7), (0.2, 0.3, 0.4, 0.5)):
            rows.append((f"hibrida {lex} a={alpha} ms={ms}", (lambda lx, al, m: lambda p: HybridRetriever(p.store, p.embedder, lx, al, min_score=m))(lex, alpha, ms)))
    else:
        for lex in ("hash", "bm25"):
            rows.append((f"hibrida bge+{lex} a=.5 ms=.3", (lambda lx: lambda p: HybridRetriever(p.store, p.embedder, lx, 0.5, min_score=0.3))(lex)))
    for label, make in rows:
        # las híbridas parten del almacén bge-m3
        key_label = label if not label.startswith("hibrida") else "bge " + label
        a, b = run(key_label, make)
        print(fmt(label, a, b))
    return 0


if __name__ == "__main__":
    sys.exit(main())
