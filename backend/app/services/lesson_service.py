from fastapi import HTTPException, status

from app.models.activity import Activity
from app.models.lesson import Lesson
from app.repositories.language_repository import LanguageRepository
from app.repositories.lesson_repository import LessonRepository


class LessonService:
    def __init__(
        self,
        languages: LanguageRepository,
        lessons: LessonRepository,
    ) -> None:
        self.languages = languages
        self.lessons = lessons

    def list_for_language(self, language_id: int) -> list[Lesson]:
        self._require_language(language_id)
        return self.lessons.list_for_language(language_id)

    def get(self, lesson_id: int) -> Lesson:
        lesson = self.lessons.get(lesson_id)
        if lesson is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lesson not found",
            )
        return lesson

    def list_activities(self, lesson_id: int) -> list[Activity]:
        self.get(lesson_id)
        return self.lessons.list_activities(lesson_id)

    def get_activity(self, activity_id: int) -> Activity:
        activity = self.lessons.get_activity(activity_id)
        if activity is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Activity not found",
            )
        return activity

    def _require_language(self, language_id: int) -> None:
        if self.languages.get(language_id) is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Language not found",
            )
