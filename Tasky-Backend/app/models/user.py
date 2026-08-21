from __future__ import annotations

from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional, List
from sqlalchemy import String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.subject import Subject
    from app.models.task import Task
    from app.models.lms_connection import LMSConnection
    from app.models.device import Device
    from app.models.notification import Notification


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    student_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    section: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    about: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
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
    subjects: Mapped[List[Subject]] = relationship("Subject", back_populates="user", cascade="all, delete-orphan")
    tasks: Mapped[List[Task]] = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    lms_connections: Mapped[List[LMSConnection]] = relationship("LMSConnection", back_populates="user", cascade="all, delete-orphan")
    devices: Mapped[List[Device]] = relationship("Device", back_populates="user", cascade="all, delete-orphan")
    notifications: Mapped[List[Notification]] = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}', name='{self.name}')>"

