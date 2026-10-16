from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories.language_repository import LanguageRepository
from app.repositories.progress_repository import ProgressRepository
from app.schemas.common import PositivePathId, UserPathId
from app.schemas.progress import ProgressResponse, ProgressSummary
from app.services.progress_service import ProgressService

router = APIRouter(prefix="/progress", tags=["learning"])


def get_progress_service(session: Session = Depends(get_db)) -> ProgressService:
    return ProgressService(LanguageRepository(session), ProgressRepository(session))


@router.get("", response_model=ProgressSummary)
def get_current_progress(
    user_id: str = Query(
        default="local-demo-user",
        alias="userId",
        min_length=1,
        max_length=100,
    ),
    service: ProgressService = Depends(get_progress_service),
) -> ProgressSummary:
    return service.summary(user_id)


@router.get("/{user_id}", response_model=ProgressSummary)
def get_user_progress(
    user_id: UserPathId,
    service: ProgressService = Depends(get_progress_service),
) -> ProgressSummary:
    return service.summary(user_id)


@router.get(
    "/{user_id}/language/{language_id}",
    response_model=ProgressSummary,
)
def get_language_progress(
    user_id: UserPathId,
    language_id: PositivePathId,
    service: ProgressService = Depends(get_progress_service),
) -> ProgressSummary:
    return service.summary(user_id, language_id)
