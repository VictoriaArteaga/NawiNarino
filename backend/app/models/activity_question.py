from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ActivityQuestion(Base):
    __tablename__ = "activity_questions"

    id: Mapped[int] = mapped_column(primary_key=True)
    activity_id: Mapped[int] = mapped_column(
        ForeignKey("activities.id", ondelete="CASCADE"), index=True
    )
    prompt: Mapped[str] = mapped_column(Text)
    type: Mapped[str] = mapped_column(String(40), default="multiple_choice")
    order: Mapped[int] = mapped_column(Integer)
    is_mock: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    activity: Mapped["Activity"] = relationship(back_populates="questions")
    options: Mapped[list["ActivityOption"]] = relationship(
        back_populates="question",
        cascade="all, delete-orphan",
        order_by="ActivityOption.id",
    )
