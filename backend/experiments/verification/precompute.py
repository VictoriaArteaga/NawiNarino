"""Paso 1 (necesita torch + Ollama con bge-m3): calcula y guarda en caché, para
cada pregunta, el pool de candidatos de la recuperación híbrida y, por
candidato, el puntaje del reranker y la salida del QA extractivo.

    python -m experiments.verification.precompute dev
    python -m experiments.verification.precompute test

El resto del experimento (barridos, métricas) usa SOLO esta caché, así que es
rápido y reproducible. La caché no se versiona.
"""

import json
import sys
import time
from pathlib import Path

from app.rag.embedders_optional import OllamaEmbedder
from app.rag.embeddings import content_tokens, fold
from app.rag.hybrid import HybridRetriever
from app.rag.pipeline import RagPipeline
from experiments.verification.models import QA_MODEL, RERANK_MODEL, ExtractiveQA, Reranker

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "rag_data" / "synthetic_experiments"
CACHE = ROOT / "experiments" / "cache"
POOL = 8


def load_status(manifest: Path) -> dict[str, str]:
    entries = json.loads(manifest.read_text(encoding="utf-8"))
    return {e["metadata"]["document_id"]: e["experiment"]["simulated_status"] for e in entries}


def main(split: str) -> None:
    manifest = DATA / split / "manifest.json"
    questions = json.loads((DATA / split / "questions.json").read_text(encoding="utf-8"))["questions"]
    emb = OllamaEmbedder("bge-m3")
    pipe = RagPipeline(emb)
    report = pipe.ingest(manifest)
    assert not report.rejected, report.rejected
    status = load_status(manifest)
    retriever = HybridRetriever(pipe.store, emb, "bm25", alpha=0.5, top_k=POOL, min_score=-1.0, relative_min=0.0)

    df: dict[str, int] = {}
    for c in pipe.store.chunks:
        for t in content_tokens(c.text):
            df[t] = df.get(t, 0) + 1

    qa, rr = ExtractiveQA(), Reranker()
    items: dict[str, dict] = {}
    t_start = time.perf_counter()
    for n, q in enumerate(questions, start=1):
        hits = retriever.retrieve(q["q"])
        texts = [h.chunk.text for h in hits]
        rr_scores, rr_ms = rr.score(q["q"], texts) if texts else ([], 0.0)
        cands = []
        for h, s in zip(hits, rr_scores):
            m = h.chunk.metadata
            res = qa.answer(q["q"], h.chunk.text)
            cands.append({
                "chunk_id": m.chunk_id, "doc_id": m.document_id, "page": m.page, "text": h.chunk.text,
                "fused": h.score, "rerank": s, "sim_status": status[m.document_id],
                "qa": {"span": res.span, "span_score": res.span_score, "null_score": res.null_score, "ms": res.ms},
            })
        items[q["id"]] = {
            "cands": cands, "rerank_ms_per_pair": rr_ms,
            "q_terms": {t: df.get(t, 0) for t in sorted(content_tokens(q["q"]))},
        }
        if n % 10 == 0:
            print(f"{split}: {n}/{len(questions)} ({time.perf_counter() - t_start:.0f}s)", flush=True)
    CACHE.mkdir(parents=True, exist_ok=True)
    payload = {"meta": {"split": split, "qa_model": QA_MODEL, "rerank_model": RERANK_MODEL,
                        "pool": POOL, "chunks": len(pipe.store.chunks), "embedder": emb.name},
               "items": items}
    (CACHE / f"{split}.json").write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    print(f"Caché escrita: {CACHE / (split + '.json')}")


if __name__ == "__main__":
    main(sys.argv[1])
