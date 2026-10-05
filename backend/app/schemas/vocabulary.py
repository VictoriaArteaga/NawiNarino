from datetime import datetime

from app.schemas.common import ResponseSchema


class VocabularyResponse(ResponseSchema):
    id: int
    language_id: int
    word: str
    translation: str
    category: str
    description: str
    audio_url: str | None
    is_mock: bool
    created_at: datetime
    updated_at: datetime

