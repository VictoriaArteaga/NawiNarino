from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app
from app.models import (
    Activity,
    ActivityOption,
    ActivityQuestion,
    CulturalContent,
    Heritage,
    Language,
    Lesson,
    Source,
    Territory,
    Toponym,
    Vocabulary,
)

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
        lesson = Lesson(
            language_id=language.id,
            title="Demonstration lesson",
            description="Lesson pending validation.",
            order=1,
            is_mock=True,
        )
        session.add(lesson)
        session.flush()
        activity = Activity(
            lesson_id=lesson.id,
            title="Demonstration activity",
            description="Activity pending validation.",
            type="multiple_choice",
            order=1,
            is_mock=True,
        )
        session.add(activity)
        session.flush()
        question = ActivityQuestion(
            activity_id=activity.id,
            prompt="Demonstration question?",
            type="multiple_choice",
            order=1,
            is_mock=True,
        )
        session.add(question)
        session.flush()
        session.add_all(
            [
                ActivityOption(
                    question_id=question.id,
                    label="Demonstration answer",
                    is_correct=True,
                    is_mock=True,
                ),
                ActivityOption(
                    question_id=question.id,
                    label="Other demonstration option",
                    is_correct=False,
                    is_mock=True,
                ),
            ]
        )
        territory = Territory(
            name="Demonstration territory",
            description="Pending validation.",
            region="Demonstration region",
            language_id=language.id,
            is_mock=True,
        )
        source = Source(
            title="Demonstration source",
            author="Author pending validation",
            type="Test reference",
            reference="Reference pending validation",
            description="No real publication.",
            is_mock=True,
        )
        session.add_all([territory, source])
        session.flush()
        session.add(
            Heritage(
                title="Demonstration heritage record",
                description="Pending validation.",
                category="historical",
                source_id=source.id,
                territory_id=territory.id,
                is_mock=True,
            )
        )
        session.add(
            Toponym(
                name="Demonstration place name",
                description="Pending validation.",
                meaning="Meaning pending validation",
                historical_context="Context pending validation",
                territory_id=territory.id,
                source_id=source.id,
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
