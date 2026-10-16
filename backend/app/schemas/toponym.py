from datetime import datetime

from app.schemas.common import ResponseSchema
from app.schemas.source import SourceResponse


class ToponymResponse(ResponseSchema):
    id: int
    name: str
    description: str
    meaning: str
    historical_context: str
    territory_id: int | None
    source_id: int | None
    is_mock: bool
    created_at: datetime
    updated_at: datetime


class ToponymDetailResponse(ToponymResponse):
    source: SourceResponse | None
