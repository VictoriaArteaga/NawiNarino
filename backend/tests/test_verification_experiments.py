"""Experimentos de verificación (etapa 6): partes que NO necesitan torch.

Comprueba: corpus experimental coherente y disjunto (ajuste/evaluación),
detección de conflictos, juez de métricas, protocolo de ajuste y que el código
experimental no está conectado a la aplicación.
"""

import json
import re
from pathlib import Path

import pytest

from app.rag.pipeline import RagPipeline
from experiments.verification import evaluate as ev
from experiments.verification import gen_corpus
from experiments.verification.conflict import SourceValue, normalize_value, resolve
from experiments.verification.judge import Out, judge, summarize, total_errors, wilson

BACKEND = Path(__file__).resolve().parents[1]
DATA = BACKEND / "rag_data" / "synthetic_experiments"


def qs(split):
    return json.loads((DATA / split / "questions.json").read_text(encoding="utf-8"))["questions"]


# ---------- corpus ----------


def test_generated_files_are_up_to_date():
    for path, text in gen_corpus.render().items():
        assert path.read_text(encoding="utf-8") == text, f"ejecute gen_corpus: {path.name} desactualizado"


def test_dev_and_test_are_disjoint():
    dev, test = qs("dev"), qs("test")
    assert not ({q["id"] for q in dev} & {q["id"] for q in test})
    key = lambda items: {(q["family"], q["slot"]) for q in items if q["role"] not in ("underspecified", "out_of_corpus")}
    assert not (key(dev) & key(test))
    forms = lambda items: {v for q in items for v in q["gold_values"]}
    assert not (forms(dev) & forms(test))
    texts = lambda s: " ".join(p.read_text(encoding="utf-8") for p in (DATA / s).glob("*.md"))
    for form in forms(test):
        assert f'"{form}"' not in texts("dev") and f"-{form} " not in texts("dev")


@pytest.mark.parametrize("split", ["dev", "test"])
def test_every_case_type_is_present(split):
    roles = {q["role"] for q in qs(split)}
    assert {"single", "agree", "agree_mixed", "conflict_same", "conflict_pending", "conflict_status",
            "pending_only", "absent", "poly", "underspecified", "out_of_corpus"} <= roles


@pytest.mark.parametrize("split", ["dev", "test"])
def test_support_pages_really_contain_the_gold_value(split):
    p = RagPipeline()
    report = p.ingest(DATA / split / "manifest.json")
    assert not report.rejected
    by_page = {(c.metadata.document_id.removeprefix("synthetic__"), c.metadata.page): c.text for c in p.store.chunks}
    for q in qs(split):
        for doc, page in q["support"]:
            text = by_page[(doc, page)]
            assert any(normalize_value(v) in normalize_value(text) for v in q["values_by_doc"].get(doc, q["gold_values"]) or q["gold_values"])
        if q["behavior"] == "abstain" and q["role"] == "absent":
            assert q["support"] == []
            assert not any(f'"{v}"' in " ".join(by_page.values()) for v in q["gold_values"])


def test_conflicting_values_live_in_different_documents():
    for split in ("dev", "test"):
        for q in qs(split):
            if q["behavior"] in ("conflict", "conflict_status"):
                assert len(set(q["values_by_doc"].values())) >= 2 and len(q["values_by_doc"]) >= 2
            if q["role"] in ("agree", "agree_mixed"):
                assert len(set(q["values_by_doc"].values())) == 1 and len(q["values_by_doc"]) == 2


def test_simulated_status_does_not_change_production_gate():
    for split in ("dev", "test"):
        entries = json.loads((DATA / split / "manifest.json").read_text(encoding="utf-8"))
        assert {e["metadata"]["access_level"] for e in entries} == {"synthetic"}
        assert {e["experiment"]["simulated_status"] for e in entries} == {"validated", "pending"}


# ---------- conflictos ----------


def sv(doc, span, status="validated", page=1):
    return SourceValue(doc, page, span, status)


def test_normalize_value():
    assert normalize_value(' "Belu". ') == "belu"
    assert normalize_value("-ra") == "ra"
    assert normalize_value("la plaza de Orvelo") == "plaza de orvelo"


def test_resolve_cases():
    assert resolve([]).status == "abstained"
    assert resolve([sv("a", '"x"')]).status == "answered"
    assert resolve([sv("a", "x"), sv("b", '"X".')]).status == "corroborated"
    v = resolve([sv("a", "x"), sv("b", "y")])
    assert v.status == "conflict" and v.chosen is None and set(v.groups) == {"x", "y"}
    v = resolve([sv("a", "x", "validated"), sv("b", "y", "pending")])
    assert v.status == "conflict_by_status" and v.chosen == "x" and v.flagged_conflict
    assert resolve([sv("a", "x", "pending"), sv("b", "y", "pending")]).status == "conflict"
    assert resolve([sv("a", "x", "pending"), sv("b", "x", "validated")]).status == "corroborated"
    assert resolve([sv("a", "x"), sv("a", "y")]).status == "answered"  # un valor por documento


# ---------- juez ----------


def item(behavior, role="single", gold=("belu",), support=(("dev-v1", 1),), validated=None):
    return {"id": "t", "behavior": behavior, "role": role, "gold_values": list(gold),
            "support": [list(s) for s in support], "validated_value": validated}


def test_judge_answer_and_false_answer():
    ok = judge(item("answer"), Out("answered", "belu", ["belu"], [("dev-v1", 1)]), True)
    assert ok.flags["correct"] and ok.flags["citations_precise"]
    wrong = judge(item("answer"), Out("answered", "xxxx", ["xxxx"], [("dev-v1", 1)]), True)
    assert wrong.flags["wrong_answer"] and not wrong.flags["correct"]
    assert judge(item("answer"), Out("abstained"), True).flags["false_abstention"]
    assert judge(item("abstain", support=()), Out("answered", "x", ["x"], [("dev-v1", 1)]), True).flags["false_answer"]
    assert judge(item("abstain", support=()), Out("abstained"), True).flags["correct"]


def test_judge_conflicts_never_accept_silent_certainty():
    c = item("conflict", gold=("dari", "duri"), support=(("dev-v1", 1), ("dev-v2", 1)))
    silent = judge(c, Out("answered", "dari", ["dari"], [("dev-v1", 1)]), True)
    assert silent.flags["false_certainty"] and not silent.flags["correct"]
    good = judge(c, Out("conflict", None, ["dari", "duri"], [("dev-v1", 1), ("dev-v2", 1)]), True)
    assert good.flags["detected"] and good.flags["both_values_shown"] and good.flags["correct"]
    # sistemas sin QA nunca pueden detectar conflictos: responder = certeza falsa
    assert judge(c, Out("answered", citations=[("dev-v1", 1)], top_text="dari"), False).flags["false_certainty"]
    s = item("conflict_status", gold=("pelo", "pila"), validated="pelo", support=(("dev-v2", 1), ("dev-p1", 1)))
    res = judge(s, Out("conflict_by_status", "pelo", ["pelo", "pila"], [("dev-v2", 1), ("dev-p1", 1)]), True)
    assert res.flags["resolved_by_status"] and res.flags["correct"]
    pending_truth = judge(s, Out("answered", "pila", ["pila"], [("dev-p1", 1)]), True)
    assert pending_truth.flags["false_certainty"]


def test_summary_and_wilson():
    js = [judge(item("answer"), Out("answered", "belu", ["belu"], [("dev-v1", 1)]), True),
          judge(item("abstain", support=()), Out("answered", "x", ["x"], []), True)]
    s = summarize(js)
    assert s["answerable"]["correct"] == 1 and s["abstain"]["false_answer"] == 1
    assert total_errors(s) == 1
    lo, hi = wilson(3, 10)
    assert 0.1 < lo < 0.3 < hi < 0.65


# ---------- protocolo ----------


def fake_cache(questions):
    return {"items": {q["id"]: {"cands": [], "rerank_ms_per_pair": 1.0, "q_terms": {}} for q in questions}}


def test_tuning_uses_only_the_dev_set_it_is_given():
    # Si se le pasa un conjunto de preguntas vacío de candidatos, abstenerse es lo único posible.
    dev = qs("dev")
    p, err, ties = ev.tune("S0", dev, fake_cache(dev))
    assert err == sum(1 for q in dev if q["behavior"] in ("answer", "answer_any")) + sum(
        1 for q in dev if q["behavior"] in ("conflict", "conflict_status")) * 0  # conflictos: abstenerse no es certeza falsa
    assert ties >= 1


def test_s0_never_detects_conflicts_by_construction():
    cand = {"chunk_id": "c", "doc_id": "synthetic__dev-v1", "page": 1, "text": 'El numeral ficticio para cuatro es "dari".',
            "fused": 0.9, "rerank": 5.0, "sim_status": "validated",
            "qa": {"span": "dari", "span_score": 5.0, "null_score": 0.0, "ms": 1.0}}
    entry = {"cands": [cand, {**cand, "doc_id": "synthetic__dev-v2", "chunk_id": "d", "fused": 0.88,
                              "qa": {"span": "duri", "span_score": 4.0, "null_score": 0.0, "ms": 1.0}}],
             "rerank_ms_per_pair": 1.0, "q_terms": {"cuatro": 2}}
    out0, qa0 = ev.run_system("S0", entry, ev.Params())
    assert not qa0 and out0.status == "answered"  # certeza falsa: no detecta
    out2, qa2 = ev.run_system("S2", entry, ev.Params(tau_q=0.0))
    assert qa2 and out2.status == "conflict" and set(out2.values) == {"dari", "duri"}


def test_sentence_gate_rejects_unseen_rare_terms():
    text = 'El saludo ficticio de la noche es "raku". El saludo ficticio de la mañana es "fuse".'
    assert ev.sentence_gate({"noche": 1}, text, "raku", ev.Params(theta=3))
    assert not ev.sentence_gate({"madrugada": 1}, text, "raku", ev.Params(theta=3))  # término raro ausente de la oración
    assert not ev.sentence_gate({"madrugada": 0}, text, "raku", ev.Params(oov_strict=True))
    assert ev.sentence_gate({"madrugada": 0}, text, "raku", ev.Params(oov_strict=False))


# ---------- aislamiento ----------


def test_experiments_are_not_wired_into_the_app():
    for py in (BACKEND / "app").rglob("*.py"):
        text = py.read_text(encoding="utf-8")
        assert not re.search(r"^\s*(from|import)\s+experiments", text, re.M), py
        assert "torch" not in text and "transformers" not in text, py
    reqs = (BACKEND / "requirements.txt").read_text(encoding="utf-8")
    assert "torch" not in reqs and "transformers" not in reqs
