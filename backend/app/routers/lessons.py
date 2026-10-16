from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.activity import Activity
from app.models.lesson import Lesson
from app.repositories.language_repository import LanguageRepository
from app.repositories.lesson_repository import LessonRepository
from app.schemas.activity import ActivityResponse
from app.schemas.lesson import LessonDetailResponse, LessonResponse
from app.services.lesson_service import LessonService

router = APIRouter(tags=["learning"])


def get_lesson_service(session: Session = Depends(get_db)) -> LessonService:
    return LessonService(LanguageRepository(session), LessonRepository(session))


@router.get(
    "/languages/{language_id}/lessons",
    response_model=list[LessonResponse],
)
def list_lessons(
    language_id: int,
    service: LessonService = Depends(get_lesson_service),
) -> list[Lesson]:
    return service.list_for_language(language_id)


@router.get("/lessons/{lesson_id}", response_model=LessonDetailResponse)
def get_lesson(
    lesson_id: int,
    service: LessonService = Depends(get_lesson_service),
) -> Lesson:
    return service.get(lesson_id)


@router.get(
    "/lessons/{lesson_id}/activities",
    response_model=list[ActivityResponse],
)
def list_activities(
    lesson_id: int,
    service: LessonService = Depends(get_lesson_service),
) -> list[Activity]:
    return service.list_activities(lesson_id)


@router.get("/activities/{activity_id}", response_model=ActivityResponse)
def get_activity(
    activity_id: int,
    service: LessonService = Depends(get_lesson_service),
) -> Activity:
    return service.get_activity(activity_id)
