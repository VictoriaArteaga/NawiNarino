from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.heritage import Heritage
from app.models.source import Source
from app.models.toponym import Toponym
from app.repositories.heritage_repository import HeritageRepository
from app.schemas.heritage import HeritageResponse
from app.schemas.source import SourceResponse
from app.schemas.toponym import ToponymDetailResponse, ToponymResponse
from app.services.heritage_service import HeritageService

router = APIRouter(tags=["heritage"])
HeritageCategoryQuery = Literal["historical", "linguistic", "cultural", "toponymy"]


def get_heritage_service(session: Session = Depends(get_db)) -> HeritageService:
    return HeritageService(HeritageRepository(session))


@router.get("/heritage", response_model=list[HeritageResponse])
def list_heritage(
    category: HeritageCategoryQuery | None = Query(default=None),
    service: HeritageService = Depends(get_heritage_service),
) -> list[Heritage]:
    return service.list_heritage(category)


@router.get("/heritage/{heritage_id}", response_model=HeritageResponse)
def get_heritage(
    heritage_id: int,
    service: HeritageService = Depends(get_heritage_service),
) -> Heritage:
    return service.get_heritage(heritage_id)


@router.get("/toponyms", response_model=list[ToponymDetailResponse])
def list_toponyms(
    search: str | None = Query(default=None, max_length=100),
    service: HeritageService = Depends(get_heritage_service),
) -> list[Toponym]:
    return service.list_toponyms(search)


@router.get("/toponyms/{toponym_id}", response_model=ToponymDetailResponse)
def get_toponym(
    toponym_id: int,
    service: HeritageService = Depends(get_heritage_service),
) -> Toponym:
    return service.get_toponym(toponym_id)


@router.get("/sources", response_model=list[SourceResponse])
def list_sources(
    service: HeritageService = Depends(get_heritage_service),
) -> list[Source]:
    return service.list_sources()


@router.get("/sources/{source_id}", response_model=SourceResponse)
def get_source(
    source_id: int,
    service: HeritageService = Depends(get_heritage_service),
) -> Source:
    return service.get_source(source_id)
