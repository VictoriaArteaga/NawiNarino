import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import initialize_mock_database
from app.routers import (
    activities,
    auth,
    explorer,
    heritage,
    languages,
    lessons,
    progress,
    territories,
    vocabulary,
)

settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    initialize_mock_database()
    try:  # calienta el índice del Explorador para que la primera consulta no espere
        explorer.get_pipeline()
    except Exception:  # noqa: BLE001
        logging.getLogger("explorer").exception("No se pudo preparar el Explorador al arrancar")
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.rstrip("/") for origin in settings.cors_origins],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
app.include_router(auth.router)
app.include_router(languages.router)
app.include_router(vocabulary.router)
app.include_router(lessons.router)
app.include_router(activities.router)
app.include_router(progress.router)
app.include_router(territories.router)
app.include_router(heritage.router)
app.include_router(explorer.router)


@app.get("/health", tags=["health"])
def health_check() -> dict[str, object]:
    try:
        engine = explorer.get_pipeline()
        retriever, generator = engine.mode, engine.generator_status()
    except Exception:  # noqa: BLE001
        retriever, generator = "unavailable", {"mode": "unavailable"}
    return {"status": "ok", "dataSource": settings.data_source, "explorerRetriever": retriever, "explorerGenerator": generator}
