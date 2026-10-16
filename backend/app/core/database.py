from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import get_settings


class Base(DeclarativeBase):
    pass


settings = get_settings()
if settings.data_source == "mock":
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
else:
    if settings.database_url is None:
        raise RuntimeError("DATABASE_URL is required in database mode.")
    engine = create_engine(settings.database_url, pool_pre_ping=True)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db() -> Generator[Session, None, None]:
    with SessionLocal() as session:
        yield session


def initialize_mock_database() -> None:
    if settings.data_source != "mock":
        return

    from app import models
    from scripts.seed import seed_demo_data

    Base.metadata.create_all(bind=engine)
    seed_demo_data()
