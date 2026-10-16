from datetime import datetime
from typing import Literal

from app.schemas.common import ResponseSchema

ProgressStatus = Literal["in_progress", "completed"]


class ProgressResponse(ResponseSchema):
    id: int
    user_id: str
    activity_id: int
    status: ProgressStatus
    score: int
    attempts: int
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime


class ProgressSummary(ResponseSchema):
    user_id: str
    language_id: int | None
    total_activities: int
    completed_activities: int
    average_score: int
    percentage: int
    activities: list[ProgressResponse]
