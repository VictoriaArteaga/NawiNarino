from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app
from app.models import CulturalContent, Language, Vocabulary

test_engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSessionLocal = sessionmaker(bind=test_engine, autoflush=False, autocommit=False)


@pytest.fixture
def client() -> Iterator[TestClient]:
    Base.metadata.create_all(bind=test_engine)
    with TestSessionLocal() as session:
        language = Language(
            name="Test language",
            short_description="Temporary test data.",
            cultural_description="Information pending validation.",
            is_mock=True,
        )
        session.add(language)
        session.flush()
        session.add(
            Vocabulary(
                language_id=language.id,
                word="Demonstration word",
                translation="Translation pending validation",
                category="Test category",
                description="Placeholder test content.",
                is_mock=True,
            )
        )
        session.add(
            CulturalContent(
                language_id=language.id,
                title="Demonstration content",
                description="Information pending validation.",
                is_mock=True,
            )
        )
        session.commit()

    def override_get_db() -> Iterator[Session]:
        with TestSessionLocal() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=test_engine)
