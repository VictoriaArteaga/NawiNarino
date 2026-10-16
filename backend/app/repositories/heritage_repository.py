from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.heritage import Heritage
from app.models.source import Source
from app.models.toponym import Toponym


class HeritageRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def list_heritage(self, category: str | None = None) -> list[Heritage]:
        statement = select(Heritage).options(selectinload(Heritage.source))
        if category is not None:
            statement = statement.where(Heritage.category == category)
        statement = statement.order_by(Heritage.title, Heritage.id)
        return list(self.session.scalars(statement).all())

    def get_heritage(self, heritage_id: int) -> Heritage | None:
        statement = (
            select(Heritage)
            .options(selectinload(Heritage.source))
            .where(Heritage.id == heritage_id)
        )
        return self.session.scalar(statement)

    def list_toponyms(self, query: str | None = None) -> list[Toponym]:
        statement = select(Toponym).options(selectinload(Toponym.source))
        if query:
            statement = statement.where(Toponym.name.ilike(f"%{query}%"))
        statement = statement.order_by(Toponym.name, Toponym.id)
        return list(self.session.scalars(statement).all())

    def get_toponym(self, toponym_id: int) -> Toponym | None:
        statement = (
            select(Toponym)
            .options(selectinload(Toponym.source))
            .where(Toponym.id == toponym_id)
        )
        return self.session.scalar(statement)

    def list_sources(self) -> list[Source]:
        statement = select(Source).order_by(Source.title, Source.id)
        return list(self.session.scalars(statement).all())

    def get_source(self, source_id: int) -> Source | None:
        return self.session.get(Source, source_id)
