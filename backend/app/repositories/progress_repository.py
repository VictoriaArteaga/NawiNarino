from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.activity import Activity
from app.models.lesson import Lesson
from app.models.progress import Progress


class ProgressRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get(self, user_id: str, activity_id: int) -> Progress | None:
        statement = select(Progress).where(
            Progress.user_id == user_id,
            Progress.activity_id == activity_id,
        )
        return self.session.scalar(statement)

    def save_submission(
        self, user_id: str, activity_id: int, score: int
    ) -> Progress:
        progress = self.get(user_id, activity_id)
        if progress is None:
            progress = Progress(
                user_id=user_id,
                activity_id=activity_id,
                status="completed",
                score=score,
                attempts=1,
            )
            self.session.add(progress)
        else:
            progress.status = "completed"
            progress.score = score
            progress.attempts += 1
        progress.completed_at = datetime.now(timezone.utc)
        self.session.commit()
        self.session.refresh(progress)
        return progress

    def list_for_user(self, user_id: str) -> list[Progress]:
        statement = (
            select(Progress)
            .options(selectinload(Progress.activity).selectinload(Activity.lesson))
            .where(Progress.user_id == user_id)
            .order_by(Progress.updated_at.desc(), Progress.id.desc())
        )
        return list(self.session.scalars(statement).all())

    def list_for_language(self, user_id: str, language_id: int) -> list[Progress]:
        statement = (
            select(Progress)
            .join(Progress.activity)
            .join(Activity.lesson)
            .options(selectinload(Progress.activity).selectinload(Activity.lesson))
            .where(
                Progress.user_id == user_id,
                Lesson.language_id == language_id,
            )
            .order_by(Progress.updated_at.desc(), Progress.id.desc())
        )
        return list(self.session.scalars(statement).all())

    def count_activities(self, language_id: int | None = None) -> int:
        statement = select(Activity.id).join(Activity.lesson)
        if language_id is not None:
            statement = statement.where(Lesson.language_id == language_id)
        return len(self.session.scalars(statement).all())
