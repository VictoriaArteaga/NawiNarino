from datetime import datetime

from app.schemas.common import ResponseSchema


class LessonResponse(ResponseSchema):
    id: int
    language_id: int
    title: str
    description: str
    order: int
    is_mock: bool
    created_at: datetime
    updated_at: datetime


class LessonDetailResponse(LessonResponse):
    pass
