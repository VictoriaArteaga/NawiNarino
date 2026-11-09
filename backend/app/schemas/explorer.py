from typing import Annotated

from pydantic import Field, StringConstraints

from app.schemas.common import ResponseSchema


class AskRequest(ResponseSchema):
    question: Annotated[str, StringConstraints(strip_whitespace=True, min_length=3, max_length=500)]
    language: str | None = Field(default=None, max_length=50)


class CitationResponse(ResponseSchema):
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


class AnswerResponse(ResponseSchema):
    question: str
    answer: str
    abstained: bool
    citations: list[CitationResponse]
    notices: list[str]
    evidence: str
    unmatched_terms: list[str]
    explanation: str | None = None
    generation_mode: str = "none"
    generation_model: str | None = None
    generation_ms: int | None = None
    generation_note: str | None = None
