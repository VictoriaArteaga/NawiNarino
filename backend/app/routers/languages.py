from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.cultural_content import CulturalContent
from app.models.language import Language
from app.models.vocabulary import Vocabulary
from app.repositories.language_repository import LanguageRepository
from app.repositories.vocabulary_repository import VocabularyRepository
from app.schemas.cultural_content import CulturalContentResponse
from app.schemas.language import LanguageDetailResponse, LanguageResponse
from app.schemas.vocabulary import VocabularyResponse
from app.services.language_service import LanguageService
from app.services.vocabulary_service import VocabularyService

router = APIRouter(prefix="/languages", tags=["languages"])


def get_language_service(session: Session = Depends(get_db)) -> LanguageService:
    return LanguageService(LanguageRepository(session))


def get_vocabulary_service(session: Session = Depends(get_db)) -> VocabularyService:
    return VocabularyService(
        LanguageRepository(session),
        VocabularyRepository(session),
    )


@router.get("", response_model=list[LanguageResponse])
def list_languages(
    service: LanguageService = Depends(get_language_service),
) -> list[Language]:
    return service.list_languages()


@router.get("/{language_id}", response_model=LanguageDetailResponse)
def get_language(
    language_id: int,
    service: LanguageService = Depends(get_language_service),
) -> Language:
    return service.get_language(language_id)


@router.get(
    "/{language_id}/vocabulary",
    response_model=list[VocabularyResponse],
)
def list_vocabulary(
    language_id: int,
    service: VocabularyService = Depends(get_vocabulary_service),
) -> list[Vocabulary]:
    return service.list_for_language(language_id)


@router.get(
    "/{language_id}/culture",
    response_model=list[CulturalContentResponse],
)
def list_cultural_content(
    language_id: int,
    service: VocabularyService = Depends(get_vocabulary_service),
) -> list[CulturalContent]:
    return service.list_cultural_content(language_id)
