from functools import lru_cache

from fastapi import APIRouter, Depends

from app.core.config import get_settings
from app.rag.factory import ExplorerEngine, build_engine
from app.schemas.explorer import AnswerResponse, AskRequest

router = APIRouter(prefix="/explorer", tags=["explorer"])


@lru_cache
def get_pipeline() -> ExplorerEngine:
    """Construye el motor (índice + recuperador) una vez, según la configuración.

    El manifiesto por defecto contiene solo documentos sintéticos; la puerta
    de permisos rechaza cualquier documento sin autorización de indexación.
    """
    return build_engine(get_settings())


@router.post("/ask", response_model=AnswerResponse)
def ask(
    payload: AskRequest, pipeline: ExplorerEngine = Depends(get_pipeline)
) -> AnswerResponse:
    answer = pipeline.ask(payload.question, language=payload.language)
    return AnswerResponse.model_validate(answer.model_dump())
