from datetime import datetime

from app.schemas.common import ResponseSchema


class SourceResponse(ResponseSchema):
    id: int
    title: str
    author: str
    year: int | None
    type: str
    reference: str
    url: str | None
    description: str
    is_mock: bool
    created_at: datetime
    updated_at: datetime
