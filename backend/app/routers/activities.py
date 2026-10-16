from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.lesson_repository import LessonRepository
from app.repositories.progress_repository import ProgressRepository
from app.schemas.activity import ActivityResult, ActivitySubmission
from app.services.activity_service import ActivityService

router = APIRouter(prefix="/activities", tags=["learning"])


def get_activity_service(session: Session = Depends(get_db)) -> ActivityService:
    return ActivityService(LessonRepository(session), ProgressRepository(session))


@router.post("/{activity_id}/submit", response_model=ActivityResult)
def submit_activity(
    activity_id: int,
    submission: ActivitySubmission,
    user_id: str = Query(
        default="local-demo-user",
        alias="userId",
        min_length=1,
        max_length=100,
    ),
    service: ActivityService = Depends(get_activity_service),
) -> dict[str, int | bool | str]:
    result, _progress = service.submit(activity_id, user_id, submission)
    return result
