from fastapi import HTTPException, status

from app.models.heritage import Heritage
from app.models.source import Source
from app.models.toponym import Toponym
from app.repositories.heritage_repository import HeritageRepository


class HeritageService:
    def __init__(self, repository: HeritageRepository) -> None:
        self.repository = repository

    def list_heritage(self, category: str | None = None) -> list[Heritage]:
        return self.repository.list_heritage(category)

    def get_heritage(self, heritage_id: int) -> Heritage:
        item = self.repository.get_heritage(heritage_id)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Heritage item not found",
            )
        return item

    def list_toponyms(self, query: str | None = None) -> list[Toponym]:
        return self.repository.list_toponyms(query)

    def get_toponym(self, toponym_id: int) -> Toponym:
        item = self.repository.get_toponym(toponym_id)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Toponym not found",
            )
        return item

    def list_sources(self) -> list[Source]:
        return self.repository.list_sources()

    def get_source(self, source_id: int) -> Source:
        source = self.repository.get_source(source_id)
        if source is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Source not found",
            )
        return source
