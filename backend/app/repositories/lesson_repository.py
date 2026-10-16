from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.activity import Activity
from app.models.activity_question import ActivityQuestion
from app.models.lesson import Lesson


class LessonRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def list_for_language(self, language_id: int) -> list[Lesson]:
        statement = (
            select(Lesson)
            .where(Lesson.language_id == language_id)
            .order_by(Lesson.order, Lesson.id)
        )
        return list(self.session.scalars(statement).all())

    def get(self, lesson_id: int) -> Lesson | None:
        return self.session.get(Lesson, lesson_id)

    def list_activities(self, lesson_id: int) -> list[Activity]:
        statement = (
            select(Activity)
            .options(
                selectinload(Activity.questions).selectinload(ActivityQuestion.options)
            )
            .where(Activity.lesson_id == lesson_id)
            .order_by(Activity.order, Activity.id)
        )
        return list(self.session.scalars(statement).all())

    def get_activity(self, activity_id: int) -> Activity | None:
        statement = (
            select(Activity)
            .options(
                selectinload(Activity.questions).selectinload(ActivityQuestion.options)
            )
            .where(Activity.id == activity_id)
        )
        return self.session.scalar(statement)
