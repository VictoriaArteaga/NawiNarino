from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.language import Language


class LanguageRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def list(self) -> list[Language]:
        statement = select(Language).order_by(Language.name)
        return list(self.session.scalars(statement).all())

    def get(self, language_id: int) -> Language | None:
        return self.session.get(Language, language_id)

