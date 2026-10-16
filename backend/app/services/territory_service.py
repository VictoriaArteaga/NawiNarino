from fastapi import HTTPException, status

from app.models.territory import Territory
from app.repositories.language_repository import LanguageRepository
from app.repositories.territory_repository import TerritoryRepository


class TerritoryService:
    def __init__(
        self,
        languages: LanguageRepository,
        territories: TerritoryRepository,
    ) -> None:
        self.languages = languages
        self.territories = territories

    def list_all(self) -> list[Territory]:
        return self.territories.list_all()

    def list_for_language(self, language_id: int) -> list[Territory]:
        if self.languages.get(language_id) is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Language not found",
            )
        return self.territories.list_for_language(language_id)

    def get(self, territory_id: int) -> Territory:
        territory = self.territories.get(territory_id)
        if territory is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Territory not found",
            )
        return territory
