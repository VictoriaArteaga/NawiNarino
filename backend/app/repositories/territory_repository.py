from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.territory import Territory


class TerritoryRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def list_all(self) -> list[Territory]:
        statement = select(Territory).order_by(Territory.name, Territory.id)
        return list(self.session.scalars(statement).all())

    def list_for_language(self, language_id: int) -> list[Territory]:
        statement = (
            select(Territory)
            .where(Territory.language_id == language_id)
            .order_by(Territory.name, Territory.id)
        )
        return list(self.session.scalars(statement).all())

    def get(self, territory_id: int) -> Territory | None:
        return self.session.get(Territory, territory_id)
