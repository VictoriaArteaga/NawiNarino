"""Paso 2 (sin torch): sistemas, barrido en AJUSTE y evaluación final en TEST.

Sistemas (todos EXPERIMENTALES, ninguno conectado al endpoint):
  S0 híbrida (bge-m3 + BM25 exacto, configuración de la etapa 5, sin ajustar)
  S1 híbrida + reranker
  S2 híbrida + QA extractivo («sin respuesta» + conflictos)
  S3 híbrida + reranker + QA
  S4 híbrida + QA + puerta léxica de oración
  S5 híbrida + reranker + QA + puerta léxica

Protocolo: los parámetros de cada sistema se eligen SOLO con la caché `dev`
(mínimo de errores totales; empates -> valor central). Luego se congelan y se
miden una vez en `test`.
"""

import itertools
import json
import re
from dataclasses import dataclass
from pathlib import Path

from app.rag.embeddings import tokenize
from experiments.verification.conflict import SourceValue, resolve
from experiments.verification.judge import Out, judge, summarize, total_errors
from experiments.verification.models import sigmoid

ROOT = Path(__file__).resolve().parents[2]
CACHE = ROOT / "experiments" / "cache"
DATA = ROOT / "rag_data" / "synthetic_experiments"
S0_MIN_SCORE, S0_REL, S0_TOP_K = 0.3, 0.85, 4  # etapa 5; NO se ajustan
TOP_CITED = 4

SYSTEMS = {
    "S0": (False, False, False), "S1": (True, False, False), "S2": (False, True, False),
    "S3": (True, True, False), "S4": (False, True, True), "S5": (True, True, True),
}


@dataclass(frozen=True)
class Params:
    tau_r: float = 0.0  # prob. mínima del reranker (sigmoide)
    tau_q: float = 0.0  # margen mínimo del QA (span − nulo)
    theta: int = 3  # términos de la pregunta con df <= theta deben estar en la oración
    oov_strict: bool = False  # un término de la pregunta ausente del corpus (df=0) obliga a abstenerse


def load_questions(split: str) -> list[dict]:
    return json.loads((DATA / split / "questions.json").read_text(encoding="utf-8"))["questions"]


def load_cache(split: str) -> dict:
    return json.loads((CACHE / f"{split}.json").read_text(encoding="utf-8"))


def s0_members(cands: list[dict]) -> list[dict]:
    ok = [c for c in cands if c["fused"] >= S0_MIN_SCORE]
    if ok:
        floor = ok[0]["fused"] * S0_REL
        ok = [c for c in ok if c["fused"] >= floor]
    return ok[:S0_TOP_K]


def _suffix(doc_id: str) -> str:
    return doc_id.removeprefix("synthetic__")


def sentence_gate(q_terms: dict[str, int], text: str, span: str, p: Params) -> bool:
    sentences = re.split(r"(?<=[.!?])\s+", text)
    sent = next((s for s in sentences if span in s), text)
    present = set(tokenize(sent))
    for term, df in q_terms.items():
        if df == 0:
            if p.oov_strict:
                return False
        elif df <= p.theta and term not in present:
            return False
    return True


def run_system(name: str, entry: dict, p: Params) -> tuple[Out, bool]:
    use_rerank, use_qa, use_gate = SYSTEMS[name]
    cands = entry["cands"]
    base = s0_members(cands)
    if use_rerank:
        base = [c for c in cands if sigmoid(c["rerank"]) >= p.tau_r][:TOP_CITED]
    if not use_qa:
        if not base:
            return Out("abstained"), False
        return Out("answered", citations=[(_suffix(c["doc_id"]), c["page"]) for c in base], top_text=base[0]["text"]), False
    accepted = []
    for c in sorted(base, key=lambda c: -c["qa"]["span_score"] + c["qa"]["null_score"]):
        qa = c["qa"]
        if not qa["span"] or qa["span_score"] - qa["null_score"] < p.tau_q:
            continue
        if use_gate and not sentence_gate(entry["q_terms"], c["text"], qa["span"], p):
            continue
        accepted.append(c)
    verdict = resolve([SourceValue(_suffix(c["doc_id"]), c["page"], c["qa"]["span"], c["sim_status"], c["chunk_id"]) for c in accepted])
    return Out(
        verdict.status, verdict.chosen, list(verdict.groups.keys()),
        [(_suffix(c["doc_id"]), c["page"]) for c in accepted],
    ), True


def evaluate_system(name: str, questions: list[dict], cache: dict, p: Params):
    js = []
    for q in questions:
        out, has_qa = run_system(name, cache["items"][q["id"]], p)
        js.append((q, out, judge(q, out, has_qa)))
    return js


def grid(name: str) -> list[Params]:
    use_rerank, use_qa, use_gate = SYSTEMS[name]
    taus_r = [0.0, 0.01, 0.05, 0.1, 0.2, 0.3, 0.5, 0.7] if use_rerank else [0.0]
    taus_q = [float(x) for x in range(-6, 11)] if use_qa else [0.0]
    thetas = [1, 2, 3, 4, 6] if use_gate else [3]
    oovs = [False, True] if use_gate else [False]
    return [Params(r, q, t, o) for r, q, t, o in itertools.product(taus_r, taus_q, thetas, oovs)]


def tune(name: str, questions: list[dict], cache: dict) -> tuple[Params, int, int]:
    """Devuelve (parámetros, errores en ajuste, cuántas combinaciones empataron)."""
    scored = []
    for p in grid(name):
        s = summarize([j for _, _, j in evaluate_system(name, questions, cache, p)])
        scored.append((total_errors(s), p))
    best = min(e for e, _ in scored)
    tied = [p for e, p in scored if e == best]
    return tied[len(tied) // 2], best, len(tied)


def latency(name: str, questions: list[dict], cache: dict, p: Params) -> dict[str, float]:
    """ms por pregunta del paso de verificación (excluye embeddings y recuperación)."""
    use_rerank, use_qa, _ = SYSTEMS[name]
    totals = []
    for q in questions:
        e = cache["items"][q["id"]]
        ms = 0.0
        if use_rerank:
            ms += e["rerank_ms_per_pair"] * len(e["cands"])
        if use_qa:
            base = [c for c in e["cands"] if sigmoid(c["rerank"]) >= p.tau_r][:TOP_CITED] if use_rerank else s0_members(e["cands"])
            ms += sum(c["qa"]["ms"] for c in base)
        totals.append(ms)
    totals.sort()
    return {"mean_ms": sum(totals) / len(totals), "p95_ms": totals[int(0.95 * (len(totals) - 1))]}
