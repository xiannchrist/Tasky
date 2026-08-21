from __future__ import annotations

import enum
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional
from sqlalchemy import String, Text, Integer, Boolean, ForeignKey, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.task import Task


class NotificationType(str, enum.Enum):
    NEW_TASK = "new_task"
    NEW_QUIZ = "new_quiz"
    NEW_PERFORMANCE_TASK = "new_performance_task"
    NEW_EXAM = "new_exam"
    DEADLINE_CHANGED = "deadline_changed"
    DEADLINE_TOMORROW = "deadline_tomorrow"
    DEADLINE_TODAY = "deadline_today"
    TASK_OVERDUE = "task_overdue"
    SYNC_ERROR = "sync_error"


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    task_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("tasks.id", ondelete="SET NULL"), nullable=True
    )
    type: Mapped[NotificationType] = mapped_column(
        Enum(NotificationType), nullable=False
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    body: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sent_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user: Mapped[User] = relationship("User", back_populates="notifications")
    task: Mapped[Optional[Task]] = relationship("Task", back_populates="notifications")

    def __repr__(self) -> str:
        return f"<Notification(id={self.id}, type={self.type}, title='{self.title}')>"

