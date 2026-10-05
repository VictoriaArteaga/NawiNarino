from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.vocabulary import Vocabulary
from app.repositories.language_repository import LanguageRepository
from app.repositories.vocabulary_repository import VocabularyRepository
from app.schemas.vocabulary import VocabularyResponse
from app.services.vocabulary_service import VocabularyService

router = APIRouter(prefix="/vocabulary", tags=["vocabulary"])


def get_vocabulary_service(session: Session = Depends(get_db)) -> VocabularyService:
    return VocabularyService(
        LanguageRepository(session),
        VocabularyRepository(session),
    )


@router.get("/{vocabulary_id}", response_model=VocabularyResponse)
def get_vocabulary(
    vocabulary_id: int,
    service: VocabularyService = Depends(get_vocabulary_service),
) -> Vocabulary:
    return service.get_vocabulary(vocabulary_id)
