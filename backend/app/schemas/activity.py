from datetime import datetime
from typing import Literal

from app.schemas.common import ResponseSchema

ActivityType = Literal["multiple_choice", "true_false", "matching"]


class ActivityOptionResponse(ResponseSchema):
    id: int
    label: str
    is_mock: bool


class ActivityQuestionResponse(ResponseSchema):
    id: int
    prompt: str
    type: str
    order: int
    is_mock: bool
    options: list[ActivityOptionResponse]


class ActivityResponse(ResponseSchema):
    id: int
    lesson_id: int
    title: str
    description: str
    type: ActivityType
    order: int
    is_mock: bool
    created_at: datetime
    updated_at: datetime
    questions: list[ActivityQuestionResponse]


class AnswerSubmission(ResponseSchema):
    question_id: int
    option_id: int


class ActivitySubmission(ResponseSchema):
    answers: list[AnswerSubmission]


class ActivityResult(ResponseSchema):
    activity_id: int
    is_correct: bool
    score: int
    attempts: int
    feedback: str
    is_mock: bool
