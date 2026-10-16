from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[int] = mapped_column(primary_key=True)
    lesson_id: Mapped[int] = mapped_column(
        ForeignKey("lessons.id", ondelete="CASCADE"), index=True
    )
    title: Mapped[str] = mapped_column(String(180))
    description: Mapped[str] = mapped_column(Text)
    type: Mapped[str] = mapped_column(String(40))
    order: Mapped[int] = mapped_column(Integer)
    is_mock: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    lesson: Mapped["Lesson"] = relationship(back_populates="activities")
    questions: Mapped[list["ActivityQuestion"]] = relationship(
        back_populates="activity",
        cascade="all, delete-orphan",
        order_by="ActivityQuestion.order",
    )
    progress_records: Mapped[list["Progress"]] = relationship(
        back_populates="activity", cascade="all, delete-orphan"
    )
