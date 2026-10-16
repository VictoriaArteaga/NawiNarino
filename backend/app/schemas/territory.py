from datetime import datetime

from app.schemas.common import ResponseSchema


class TerritoryResponse(ResponseSchema):
    id: int
    name: str
    description: str
    latitude: float | None
    longitude: float | None
    region: str
    language_id: int | None
    is_mock: bool
    created_at: datetime
    updated_at: datetime
