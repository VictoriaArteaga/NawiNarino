from fastapi import HTTPException, status

from app.models.cultural_content import CulturalContent
from app.models.vocabulary import Vocabulary
from app.repositories.language_repository import LanguageRepository
from app.repositories.vocabulary_repository import VocabularyRepository


class VocabularyService:
    def __init__(
        self,
        languages: LanguageRepository,
        vocabulary: VocabularyRepository,
    ) -> None:
        self.languages = languages
        self.vocabulary = vocabulary

    def list_for_language(self, language_id: int) -> list[Vocabulary]:
        self._require_language(language_id)
        return self.vocabulary.list_for_language(language_id)

    def list_cultural_content(self, language_id: int) -> list[CulturalContent]:
        self._require_language(language_id)
        return self.vocabulary.list_cultural_content(language_id)

    def get_vocabulary(self, vocabulary_id: int) -> Vocabulary:
        vocabulary = self.vocabulary.get(vocabulary_id)
        if vocabulary is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vocabulary item not found",
            )
        return vocabulary

    def _require_language(self, language_id: int) -> None:
        if self.languages.get(language_id) is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Language not found",
            )

