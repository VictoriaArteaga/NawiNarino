"""Evaluación de la recuperación con preguntas de prueba etiquetadas.

Solo mide: ¿se recupera la fuente y página correctas?, ¿se conserva la
página?, ¿se abstiene cuando corresponde? No evalúa calidad de redacción
(las respuestas son extractivas).
"""

import json
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path

from app.rag.pipeline import RagPipeline

ANSWERABLE_CATEGORIES = ("direct", "paraphrase", "synonym", "specific_term")


@dataclass
class QuestionResult:
    id: str
    category: str
    question: str
    expect: object
    abstained: bool
    cited: list[tuple[str, int]]  # (document_id, page) en orden de cita
    ok: bool  # cumple lo esperado (top-1 correcto o abstención correcta)
    any_correct: bool  # alguna cita es la esperada
    precise: bool  # TODAS las citas son esperadas
    top_score: float | None = None


@dataclass
class EvalSummary:
    results: list[QuestionResult] = field(default_factory=list)

    def by_category(self) -> dict[str, dict[str, float]]:
        groups: dict[str, list[QuestionResult]] = defaultdict(list)
        for r in self.results:
            groups[r.category].append(r)
        out: dict[str, dict[str, float]] = {}
        for cat, rs in groups.items():
            n = len(rs)
            out[cat] = {
                "n": n,
                "ok": sum(r.ok for r in rs) / n,
                "any_correct": sum(r.any_correct for r in rs) / n,
                "precise": sum(r.precise for r in rs) / n,
            }
        return out

    def totals(self) -> dict[str, float]:
        answerable = [r for r in self.results if r.category in ANSWERABLE_CATEGORIES]
        abstain = [r for r in self.results if r.expect in ("abstain", "ambiguous_abstain")]
        broad = [r for r in self.results if isinstance(r.expect, dict) and r.expect.get("any_page")]
        return {
            "answerable_top1": _rate(r.ok for r in answerable),
            "answerable_any": _rate(r.any_correct for r in answerable),
            "answerable_precise": _rate(r.precise for r in answerable),
            "false_abstentions": float(sum(r.abstained for r in answerable + broad)),
            "correct_abstentions": _rate(r.abstained for r in abstain),
            "false_answers": float(sum(not r.abstained for r in abstain)),
            "overall_ok": _rate(r.ok for r in self.results),
        }


def _rate(values) -> float:
    values = list(values)
    return sum(values) / len(values) if values else 0.0


def load_questions(path: Path) -> list[dict]:
    return json.loads(path.read_text(encoding="utf-8"))["questions"]


def evaluate(pipeline: RagPipeline, questions: list[dict]) -> EvalSummary:
    summary = EvalSummary()
    for item in questions:
        expect = item["expect"]
        hits = pipeline.retriever.retrieve(item["q"])
        answer = pipeline.ask(item["q"])
        cited = [(c.document_id, c.page) for c in answer.citations]
        top = hits[0].score if hits else None
        if expect in ("abstain", "ambiguous_abstain"):
            ok = answer.abstained
            any_correct = precise = answer.abstained
        else:
            doc = expect["doc"]
            pages = expect.get("pages")

            def match(d: str, p: int) -> bool:
                return doc in d and (expect.get("any_page") or p in pages)

            ok = bool(cited) and match(*cited[0])
            any_correct = any(match(d, p) for d, p in cited)
            precise = bool(cited) and all(match(d, p) for d, p in cited)
        summary.results.append(
            QuestionResult(
                id=item["id"],
                category=item["category"],
                question=item["q"],
                expect=expect,
                abstained=answer.abstained,
                cited=cited,
                ok=ok,
                any_correct=any_correct,
                precise=precise,
                top_score=top,
            )
        )
    return summary
