from datetime import datetime

from app.schemas.common import ResponseSchema


class CulturalContentResponse(ResponseSchema):
    id: int
    language_id: int
    title: str
    description: str
    image_url: str | None
    is_mock: bool
    created_at: datetime
    updated_at: datetime

