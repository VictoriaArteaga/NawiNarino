"""Juez de resultados (sin torch): compara la salida de un sistema con lo esperado."""

from dataclasses import dataclass, field

from experiments.verification.conflict import normalize_value

ANSWER_STATUSES = ("answered", "corroborated")
CONFLICT_STATUSES = ("conflict", "conflict_by_status")


@dataclass
class Out:
    """Salida común de todos los sistemas."""

    status: str  # abstained | answered | corroborated | conflict | conflict_by_status
    chosen: str | None = None  # valor normalizado (solo sistemas con QA)
    values: list[str] = field(default_factory=list)  # valores normalizados mostrados
    citations: list[tuple[str, int]] = field(default_factory=list)  # (documento, página)
    top_text: str = ""  # sistemas sin QA: texto del primer fragmento citado


@dataclass
class Judgement:
    id: str
    behavior: str
    role: str
    flags: dict[str, bool]
    note: str = ""


def _contains_gold(text: str, gold: list[str]) -> bool:
    low = normalize_value(text)
    return any(normalize_value(g) in low for g in gold)


def judge(item: dict, out: Out, has_qa: bool) -> Judgement:
    b = item["behavior"]
    gold = [normalize_value(g) for g in item["gold_values"]]
    support = {(d, p) for d, p in item["support"]}
    cited = set(out.citations)
    abstained = out.status == "abstained"
    flags: dict[str, bool] = {}

    if b in ("answer", "answer_any"):
        if has_qa:
            correct = out.status in ANSWER_STATUSES and out.chosen in gold
        else:
            correct = (not abstained) and _contains_gold(out.top_text, item["gold_values"])
        flags["correct"] = correct
        flags["false_abstention"] = abstained
        flags["wrong_answer"] = (not abstained) and (not correct) and out.status not in CONFLICT_STATUSES
        flags["false_conflict"] = out.status in CONFLICT_STATUSES
    elif b == "abstain":
        flags["correct"] = abstained
        flags["false_answer"] = not abstained
    elif b == "conflict":
        flags["detected"] = out.status in CONFLICT_STATUSES
        flags["false_certainty"] = out.status in ANSWER_STATUSES or (not has_qa and not abstained)
        flags["safe_abstention"] = abstained
        flags["both_values_shown"] = has_qa and set(gold) <= set(out.values)
        flags["correct"] = flags["detected"] and flags["both_values_shown"]
    elif b == "conflict_status":
        flags["detected"] = out.status in CONFLICT_STATUSES
        flags["false_certainty"] = out.status in ANSWER_STATUSES or (not has_qa and not abstained)
        flags["safe_abstention"] = abstained
        flags["resolved_by_status"] = out.status == "conflict_by_status" and out.chosen == normalize_value(item["validated_value"] or "")
        flags["both_values_shown"] = has_qa and set(gold) <= set(out.values)
        flags["correct"] = flags["resolved_by_status"] and flags["both_values_shown"]
    else:
        raise ValueError(b)

    if cited or support:
        flags["irrelevant_citation"] = bool(cited - support)
        flags["citations_precise"] = bool(cited) and cited <= support
        flags["citations_complete"] = bool(support) and support <= cited
    return Judgement(item["id"], b, item["role"], flags)


def wilson(k: int, n: int, z: float = 1.96) -> tuple[float, float]:
    if n == 0:
        return (0.0, 0.0)
    p = k / n
    denom = 1 + z * z / n
    centre = (p + z * z / (2 * n)) / denom
    half = z * ((p * (1 - p) / n + z * z / (4 * n * n)) ** 0.5) / denom
    return (max(0.0, centre - half), min(1.0, centre + half))


def summarize(judgements: list[Judgement]) -> dict:
    """Conteos por comportamiento (no porcentajes sueltos)."""
    by_b: dict[str, list[Judgement]] = {}
    for j in judgements:
        by_b.setdefault(j.behavior, []).append(j)

    def count(js, flag):
        return sum(1 for j in js if j.flags.get(flag))

    ans = by_b.get("answer", []) + by_b.get("answer_any", [])
    ab = by_b.get("abstain", [])
    cf = by_b.get("conflict", [])
    cs = by_b.get("conflict_status", [])
    cit = [j for j in judgements if "citations_precise" in j.flags and j.behavior != "abstain"]
    return {
        "answerable": {"n": len(ans), "correct": count(ans, "correct"), "false_abstention": count(ans, "false_abstention"),
                       "wrong_answer": count(ans, "wrong_answer"), "false_conflict": count(ans, "false_conflict")},
        "abstain": {"n": len(ab), "false_answer": count(ab, "false_answer")},
        "conflict": {"n": len(cf), "detected": count(cf, "detected"), "false_certainty": count(cf, "false_certainty"),
                     "safe_abstention": count(cf, "safe_abstention"), "both_values_shown": count(cf, "both_values_shown")},
        "conflict_status": {"n": len(cs), "detected": count(cs, "detected"), "resolved_by_status": count(cs, "resolved_by_status"),
                            "false_certainty": count(cs, "false_certainty"), "safe_abstention": count(cs, "safe_abstention")},
        "citations": {"n": len(cit), "precise": count(cit, "citations_precise"), "complete": count(cit, "citations_complete"),
                      "with_irrelevant": count(cit, "irrelevant_citation")},
    }


def total_errors(s: dict) -> int:
    """Objetivo de ajuste (menor es mejor): todos los errores pesan igual."""
    a, b, c, d = s["answerable"], s["abstain"], s["conflict"], s["conflict_status"]
    return (
        a["false_abstention"] + a["wrong_answer"] + a["false_conflict"]
        + b["false_answer"]
        + c["false_certainty"]
        + d["false_certainty"]
    )
