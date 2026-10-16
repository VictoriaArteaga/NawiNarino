from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ActivityOption(Base):
    __tablename__ = "activity_options"

    id: Mapped[int] = mapped_column(primary_key=True)
    question_id: Mapped[int] = mapped_column(
        ForeignKey("activity_questions.id", ondelete="CASCADE"), index=True
    )
    label: Mapped[str] = mapped_column(String(240))
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_mock: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    question: Mapped["ActivityQuestion"] = relationship(back_populates="options")
