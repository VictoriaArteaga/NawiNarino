from sqlalchemy import select

from app.core.database import SessionLocal
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

# Estos nombres son temporales y la selección debe validarse antes de publicarse.
MOCK_LANGUAGE_NAMES = ("Awá Pit", "Inga", "A'ingae", "Nasa Yuwe")


def seed_demo_data() -> None:
    with SessionLocal.begin() as session:
        for language_name in MOCK_LANGUAGE_NAMES:
            language = session.scalar(
                select(Language).where(Language.name == language_name)
            )
            if language is None:
                language = Language(
                    name=language_name,
                    short_description=(
                        "Temporary demonstration record. Information pending "
                        "validation."
                    ),
                    cultural_description=(
                        "Demonstration content only. No cultural claims are "
                        "presented as verified."
                    ),
                    is_mock=True,
                )
                session.add(language)
                session.flush()

            if not language.vocabulary:
                for number in range(1, 3):
                    session.add(
                        Vocabulary(
                            language_id=language.id,
                            word=f"Demonstration word {number}",
                            translation="Translation pending validation",
                            category="Test category",
                            description=(
                                "Placeholder content pending validation. This "
                                "is not real vocabulary or a verified translation."
                            ),
                            is_mock=True,
                        )
                    )

            if not language.cultural_contents:
                session.add(
                    CulturalContent(
                        language_id=language.id,
                        title="Demonstration content",
                        description=(
                            "Information pending validation. This temporary "
                            "record does not make factual cultural claims."
                        ),
                        is_mock=True,
                    )
                )

            for lesson_order in range(1, 3):
                lesson = session.scalar(
                    select(Lesson).where(
                        Lesson.language_id == language.id,
                        Lesson.order == lesson_order,
                    )
                )
                if lesson is None:
                    lesson = Lesson(
                        language_id=language.id,
                        title=f"Lección de demostración {lesson_order}",
                        description=(
                            "Contenido y actividad de prueba. Información "
                            "pendiente de validación."
                        ),
                        order=lesson_order,
                        is_mock=True,
                    )
                    session.add(lesson)
                    session.flush()

                if not lesson.activities:
                    activity = Activity(
                        lesson_id=lesson.id,
                        title="Actividad de prueba",
                        description=(
                            "Actividad de demostración sin contenido lingüístico."
                        ),
                        type="multiple_choice",
                        order=1,
                        is_mock=True,
                    )
                    session.add(activity)
                    session.flush()
                    question = ActivityQuestion(
                        activity_id=activity.id,
                        prompt="Selecciona la respuesta de demostración.",
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
                                label="Respuesta de demostración",
                                is_correct=True,
                                is_mock=True,
                            ),
                            ActivityOption(
                                question_id=question.id,
                                label="Otra opción de demostración",
                                is_correct=False,
                                is_mock=True,
                            ),
                        ]
                    )

        territory = session.scalar(
            select(Territory).where(
                Territory.name == "Territorio de demostración"
            )
        )
        if territory is None:
            territory = Territory(
                name="Territorio de demostración",
                description=(
                    "Registro esquemático sin ubicación geográfica validada ni "
                    "asociación con comunidades."
                ),
                latitude=None,
                longitude=None,
                region="Región de demostración",
                is_mock=True,
            )
            session.add(territory)
            session.flush()

        source = session.scalar(
            select(Source).where(Source.title == "Fuente de demostración")
        )
        if source is None:
            source = Source(
                title="Fuente de demostración",
                author="Autor pendiente de validación",
                year=None,
                type="Referencia de prueba",
                reference="Referencia pendiente de validación",
                description=(
                    "Registro estructural de ejemplo; no representa una "
                    "publicación real."
                ),
                is_mock=True,
            )
            session.add(source)
            session.flush()

        if session.scalar(select(Heritage.id).limit(1)) is None:
            session.add(
                Heritage(
                    title="Registro patrimonial de demostración",
                    description="Contenido pendiente de validación.",
                    category="historical",
                    date_label="Fecha pendiente de validación",
                    source_id=source.id,
                    territory_id=territory.id,
                    is_mock=True,
                )
            )

        if session.scalar(select(Toponym.id).limit(1)) is None:
            session.add(
                Toponym(
                    name="Topónimo de demostración",
                    description="Registro de lugar pendiente de validación.",
                    meaning="Significado pendiente de validación",
                    historical_context="Contexto histórico pendiente de validación",
                    source_id=source.id,
                    territory_id=territory.id,
                    is_mock=True,
                )
            )


if __name__ == "__main__":
    seed_demo_data()
