from fastapi import HTTPException, status

from app.models.progress import Progress
from app.repositories.language_repository import LanguageRepository
from app.repositories.progress_repository import ProgressRepository
from app.schemas.progress import ProgressSummary


class ProgressService:
    def __init__(
        self,
        languages: LanguageRepository,
        progress: ProgressRepository,
    ) -> None:
        self.languages = languages
        self.progress = progress

    def list_for_user(self, user_id: str) -> list[Progress]:
        return self.progress.list_for_user(user_id)

    def summary(self, user_id: str, language_id: int | None = None) -> ProgressSummary:
        if language_id is not None and self.languages.get(language_id) is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Language not found",
            )
        records = (
            self.progress.list_for_language(user_id, language_id)
            if language_id is not None
            else self.progress.list_for_user(user_id)
        )
        total = self.progress.count_activities(language_id)
        completed = sum(record.status == "completed" for record in records)
        average = (
            round(sum(record.score for record in records) / len(records))
            if records
            else 0
        )
        return ProgressSummary(
            user_id=user_id,
            language_id=language_id,
            total_activities=total,
            completed_activities=completed,
            average_score=average,
            percentage=round(completed / total * 100) if total else 0,
            activities=records,
        )
