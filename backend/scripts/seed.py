from sqlalchemy import select

from app.core.database import SessionLocal
from app.models import CulturalContent, Language, Vocabulary

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


if __name__ == "__main__":
    seed_demo_data()
