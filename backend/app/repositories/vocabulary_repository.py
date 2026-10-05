from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.cultural_content import CulturalContent
from app.models.vocabulary import Vocabulary


class VocabularyRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def list_for_language(self, language_id: int) -> list[Vocabulary]:
        statement = (
            select(Vocabulary)
            .where(Vocabulary.language_id == language_id)
            .order_by(Vocabulary.id)
        )
        return list(self.session.scalars(statement).all())

    def get(self, vocabulary_id: int) -> Vocabulary | None:
        return self.session.get(Vocabulary, vocabulary_id)

    def list_cultural_content(self, language_id: int) -> list[CulturalContent]:
        statement = (
            select(CulturalContent)
            .where(CulturalContent.language_id == language_id)
            .order_by(CulturalContent.id)
        )
        return list(self.session.scalars(statement).all())

