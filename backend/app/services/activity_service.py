from fastapi import HTTPException, status

from app.models.activity import Activity
from app.repositories.lesson_repository import LessonRepository
from app.repositories.progress_repository import ProgressRepository
from app.schemas.activity import ActivitySubmission
from app.schemas.progress import ProgressResponse


class ActivityService:
    def __init__(
        self,
        lessons: LessonRepository,
        progress: ProgressRepository,
    ) -> None:
        self.lessons = lessons
        self.progress = progress

    def get(self, activity_id: int) -> Activity:
        activity = self.lessons.get_activity(activity_id)
        if activity is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Activity not found",
            )
        return activity

    def submit(
        self,
        activity_id: int,
        user_id: str,
        submission: ActivitySubmission,
    ) -> tuple[dict[str, int | bool | str], ProgressResponse]:
        activity = self.get(activity_id)
        questions = activity.questions
        if not questions:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Activity has no questions",
            )

        answer_by_question = {}
        for answer in submission.answers:
            if answer.question_id in answer_by_question:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                    detail="A question may only be answered once",
                )
            answer_by_question[answer.question_id] = answer.option_id

        expected_question_ids = {question.id for question in questions}
        if set(answer_by_question) != expected_question_ids:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Submit exactly one answer for every question",
            )

        correct_count = 0
        for question in questions:
            selected_option_id = answer_by_question[question.id]
            option = next(
                (item for item in question.options if item.id == selected_option_id),
                None,
            )
            if option is None:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                    detail="Selected option does not belong to its question",
                )
            correct_count += int(option.is_correct)

        score = round(correct_count / len(questions) * 100)
        is_correct = score == 100
        progress = self.progress.save_submission(user_id, activity_id, score)
        return (
            {
                "activity_id": activity_id,
                "is_correct": is_correct,
                "score": score,
                "attempts": progress.attempts,
                "feedback": "Resultado de demostración.",
                "is_mock": True,
            },
            ProgressResponse.model_validate(progress),
        )
