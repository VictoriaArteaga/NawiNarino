"""Respuesta fundamentada (extractiva) con citas y abstención.

No hay modelo generativo: la respuesta se compone solo con oraciones de los
fragmentos recuperados, citadas literalmente. Así no puede introducir
vocabulario, traducciones ni significados que no estén en las fuentes. Un
LLM podría sumarse después detrás de ``AnswerGenerator`` con el mismo
contrato (solo contexto recuperado, citas obligatorias, abstención).
"""

import re

from typing import Literal

from pydantic import BaseModel

from app.rag.embeddings import content_tokens
from app.rag.retrieval import Hit
from app.rag.support import unmatched_terms

ABSTENTION_MESSAGE = (
    "No encontré evidencia suficiente en las fuentes autorizadas del corpus "
    "para responder esa pregunta. No voy a inventar una respuesta."
)
_SENTENCE = re.compile(r"(?<=[.!?])\s+")


class Citation(BaseModel):
    ref: int
    chunk_id: str
    document_id: str
    title: str
    author: str | None
    year: int | None
    page: int
    language: str
    source: str
    license: str
    validation_status: str
    is_synthetic: bool
    excerpt: str
    score: float


class Answer(BaseModel):
    question: str
    answer: str
    abstained: bool
    citations: list[Citation]
    notices: list[str]
    # direct: la evidencia contiene los términos de la pregunta; related: solo es del mismo tema;
    # none: abstención. Ver app/rag/support.py (etiqueta, no abstiene).
    evidence: Literal["direct", "related", "none"] = "none"
    unmatched_terms: list[str] = []
    # Explicación generada por un modelo local, validada en el backend. Las citas SIEMPRE salen de
    # los metadatos originales (``citations``); el modelo solo usa los marcadores [n] de esos fragmentos.
    # generated: explicación válida · extractive: generación desactivada · extractive_fallback: se intentó y
    # falló (no se simula nada) · none: abstención (no se llama al modelo).
    explanation: str | None = None
    generation_mode: Literal["generated", "extractive", "extractive_fallback", "none"] = "none"
    generation_model: str | None = None
    generation_ms: int | None = None
    generation_note: str | None = None


def _best_sentences(text: str, weights: dict[str, float], limit: int = 2) -> str:
    """Hasta ``limit`` oraciones literales del fragmento, las que más pesan.

    Si no son contiguas se separan con « […] » para no sugerir continuidad.
    """
    sentences = [s for s in _SENTENCE.split(text) if s.strip()]

    def score(i: int) -> tuple[float, float]:
        # El término más raro manda (evita que repetir "lengua" gane a un
        # término específico de la pregunta); la suma desempata.
        ws = [weights.get(t, 0.0) for t in content_tokens(sentences[i])]
        return (max(ws, default=0.0), sum(ws))

    ranked = sorted(range(len(sentences)), key=lambda i: (tuple(-x for x in score(i)), i))
    keep = sorted(i for i in ranked[:limit] if score(i)[0] > 0)
    if not keep:
        return sentences[0]
    out = sentences[keep[0]]
    for prev, cur in zip(keep, keep[1:]):
        out += (" " if cur == prev + 1 else " […] ") + sentences[cur]
    return out


def build_answer(question: str, hits: list[Hit], max_sources: int = 3) -> Answer:
    if not hits:
        return Answer(
            question=question,
            answer=ABSTENTION_MESSAGE,
            abstained=True,
            citations=[],
            notices=[],
        )
    citations: list[Citation] = []
    lines: list[str] = []
    for ref, hit in enumerate(hits[:max_sources], start=1):
        m = hit.chunk.metadata
        excerpt = _best_sentences(hit.chunk.text, hit.weights)
        lines.append(f"{excerpt} [{ref}]")
        citations.append(
            Citation(
                ref=ref,
                chunk_id=m.chunk_id,
                document_id=m.document_id,
                title=m.title,
                author=m.author,
                year=m.year,
                page=m.page,
                language=m.language,
                source=m.source,
                license=m.license,
                validation_status=m.validation_status.value,
                is_synthetic=m.is_synthetic,
                excerpt=excerpt,
                score=round(hit.score, 4),
            )
        )
    notices: list[str] = []
    missing = unmatched_terms(question, hits[:max_sources])
    if missing:
        notices.append(
            "Los fragmentos son del mismo tema, pero no contienen directamente lo que preguntas "
            f"(no aparece: {', '.join(missing)}). No los tomes como una respuesta confirmada."
        )
    if any(c.is_synthetic for c in citations):
        notices.append(
            "Contenido sintético de prueba: no es información real sobre "
            "ninguna lengua ni comunidad."
        )
    if any(c.validation_status == "pending_validation" for c in citations):
        notices.append("Fuente pendiente de validación lingüística o comunitaria.")
    return Answer(
        question=question,
        answer="Según las fuentes del corpus: " + " ".join(lines),
        abstained=False,
        citations=citations,
        notices=notices,
        evidence="related" if missing else "direct",
        unmatched_terms=missing,
        generation_mode="extractive",
    )
