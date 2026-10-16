from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routers import (
    activities,
    heritage,
    languages,
    lessons,
    progress,
    territories,
    vocabulary,
)

settings = get_settings()

app = FastAPI(title=settings.app_name)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.rstrip("/") for origin in settings.cors_origins],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
app.include_router(languages.router)
app.include_router(vocabulary.router)
app.include_router(lessons.router)
app.include_router(activities.router)
app.include_router(progress.router)
app.include_router(territories.router)
app.include_router(heritage.router)


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}
