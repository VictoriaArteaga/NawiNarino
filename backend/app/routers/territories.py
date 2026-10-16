from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.territory import Territory
from app.repositories.language_repository import LanguageRepository
from app.repositories.territory_repository import TerritoryRepository
from app.schemas.territory import TerritoryResponse
from app.services.territory_service import TerritoryService

router = APIRouter(tags=["territories"])


def get_territory_service(session: Session = Depends(get_db)) -> TerritoryService:
    return TerritoryService(
        LanguageRepository(session),
        TerritoryRepository(session),
    )


@router.get("/territories", response_model=list[TerritoryResponse])
def list_territories(
    service: TerritoryService = Depends(get_territory_service),
) -> list[Territory]:
    return service.list_all()


@router.get(
    "/languages/{language_id}/territories",
    response_model=list[TerritoryResponse],
)
def list_language_territories(
    language_id: int,
    service: TerritoryService = Depends(get_territory_service),
) -> list[Territory]:
    return service.list_for_language(language_id)


@router.get("/territories/{territory_id}", response_model=TerritoryResponse)
def get_territory(
    territory_id: int,
    service: TerritoryService = Depends(get_territory_service),
) -> Territory:
    return service.get(territory_id)
