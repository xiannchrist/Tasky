from __future__ import annotations

import enum
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional, List
from sqlalchemy import String, Text, Integer, ForeignKey, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.subject import Subject
    from app.models.notification import Notification


class TaskType(str, enum.Enum):
    ASSIGNMENT = "assignment"
    QUIZ = "quiz"
    PERFORMANCE_TASK = "performance_task"
    EXAM = "exam"
    PROJECT = "project"
    ACTIVITY = "activity"
    DEADLINE = "deadline"
    OTHER = "other"


class TaskPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"


class TaskSource(str, enum.Enum):
    MANUAL = "manual"
    LMS = "lms"


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    subject_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True, index=True
    )
    lms_source_id: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True, index=True
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    task_type: Mapped[TaskType] = mapped_column(
        Enum(TaskType), default=TaskType.OTHER, nullable=False
    )
    deadline: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True, index=True
    )
    priority: Mapped[TaskPriority] = mapped_column(
        Enum(TaskPriority), default=TaskPriority.MEDIUM, nullable=False
    )
    status: Mapped[TaskStatus] = mapped_column(
        Enum(TaskStatus), default=TaskStatus.PENDING, nullable=False
    )
    source: Mapped[TaskSource] = mapped_column(
        Enum(TaskSource), default=TaskSource.MANUAL, nullable=False
    )
    source_url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user: Mapped[User] = relationship("User", back_populates="tasks")
    subject: Mapped[Optional[Subject]] = relationship("Subject", back_populates="tasks")
    notifications: Mapped[List[Notification]] = relationship("Notification", back_populates="task", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Task(id={self.id}, title='{self.title}', type={self.task_type})>"

