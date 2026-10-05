from fastapi import HTTPException, status

from app.models.language import Language
from app.repositories.language_repository import LanguageRepository


class LanguageService:
    def __init__(self, repository: LanguageRepository) -> None:
        self.repository = repository

    def list_languages(self) -> list[Language]:
        return self.repository.list()

    def get_language(self, language_id: int) -> Language:
        language = self.repository.get(language_id)
        if language is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Language not found",
            )
        return language

