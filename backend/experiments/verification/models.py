"""Modelos locales EXPERIMENTALES: QA extractivo con «sin respuesta» y reranker.

Requiere torch + transformers (requirements-experiments.txt). NO se importa
desde app/. Ambos modelos se ejecutan localmente; ningún texto sale del equipo.

QA extractivo: el tramo devuelto es siempre una subcadena del fragmento
(se verifica con ``assert``), así que no puede completar con conocimiento
externo. La decisión «sin respuesta» usa el margen
    margen = mejor_tramo(inicio+fin) − nulo(inicio[CLS]+fin[CLS])
y un umbral que se ajusta con el conjunto de AJUSTE.
"""

import math
import time
from dataclasses import dataclass

QA_MODEL = "deepset/xlm-roberta-base-squad2"
RERANK_MODEL = "BAAI/bge-reranker-v2-m3"
MAX_ANSWER_TOKENS = 30


@dataclass
class QAResult:
    span: str
    span_score: float
    null_score: float
    ms: float

    @property
    def margin(self) -> float:
        return self.span_score - self.null_score


class ExtractiveQA:
    def __init__(self, model_id: str = QA_MODEL, local_only: bool = False) -> None:
        import torch
        from transformers import AutoModelForQuestionAnswering, AutoTokenizer

        self.torch = torch
        self.model_id = model_id
        self.tok = AutoTokenizer.from_pretrained(model_id, local_files_only=local_only)
        self.model = AutoModelForQuestionAnswering.from_pretrained(model_id, local_files_only=local_only).eval()

    def answer(self, question: str, context: str) -> QAResult:
        torch = self.torch
        t0 = time.perf_counter()
        enc = self.tok(question, context, return_offsets_mapping=True, truncation="only_second",
                       max_length=512, return_tensors="pt")
        offsets = enc.pop("offset_mapping")[0].tolist()
        seq_ids = enc.sequence_ids(0)
        with torch.no_grad():
            out = self.model(**{k: v for k, v in enc.items() if k in ("input_ids", "attention_mask")})
        start, end = out.start_logits[0], out.end_logits[0]
        null = float(start[0] + end[0])
        ctx_idx = [i for i, s in enumerate(seq_ids) if s == 1]
        best, best_ij = -1e9, (None, None)
        for i in ctx_idx:
            for j in ctx_idx:
                if j < i or j - i >= MAX_ANSWER_TOKENS:
                    continue
                score = float(start[i] + end[j])
                if score > best:
                    best, best_ij = score, (i, j)
        if best_ij[0] is None:
            return QAResult("", -1e9, null, (time.perf_counter() - t0) * 1000)
        span = context[offsets[best_ij[0]][0]: offsets[best_ij[1]][1]].strip()
        assert span in context  # extractivo: nunca fuera del fragmento
        return QAResult(span, best, null, (time.perf_counter() - t0) * 1000)


class Reranker:
    def __init__(self, model_id: str = RERANK_MODEL, local_only: bool = False) -> None:
        import torch
        from transformers import AutoModelForSequenceClassification, AutoTokenizer

        self.torch = torch
        self.model_id = model_id
        self.tok = AutoTokenizer.from_pretrained(model_id, local_files_only=local_only)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_id, local_files_only=local_only).eval()

    def score(self, question: str, passages: list[str]) -> tuple[list[float], float]:
        """Devuelve (logits, ms por par)."""
        torch = self.torch
        t0 = time.perf_counter()
        scores: list[float] = []
        for i in range(0, len(passages), 8):
            batch = passages[i:i + 8]
            enc = self.tok([question] * len(batch), batch, padding=True, truncation=True,
                           max_length=512, return_tensors="pt")
            with torch.no_grad():
                logits = self.model(**enc).logits.view(-1)
            scores.extend(float(x) for x in logits)
        return scores, (time.perf_counter() - t0) * 1000 / max(len(passages), 1)


def sigmoid(x: float) -> float:
    return 1 / (1 + math.exp(-x))
