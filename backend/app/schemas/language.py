from datetime import datetime

from pydantic import Field

from app.schemas.common import ResponseSchema
from app.schemas.cultural_content import CulturalContentResponse
from app.schemas.vocabulary import VocabularyResponse


class LanguageResponse(ResponseSchema):
    id: int
    name: str
    short_description: str
    is_mock: bool
    created_at: datetime
    updated_at: datetime


class LanguageDetailResponse(LanguageResponse):
    cultural_description: str
    cultural_contents: list[CulturalContentResponse] = Field(default_factory=list)
    vocabulary: list[VocabularyResponse] = Field(default_factory=list)

