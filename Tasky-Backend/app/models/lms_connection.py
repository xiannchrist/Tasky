from __future__ import annotations

import enum
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional
from sqlalchemy import String, Text, Integer, ForeignKey, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.user import User


class LMSConnectionStatus(str, enum.Enum):
    ACTIVE = "active"
    DISCONNECTED = "disconnected"
    ERROR = "error"
    EXPIRED = "expired"


class LMSConnection(Base):
    __tablename__ = "lms_connections"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    lms_url: Mapped[str] = mapped_column(String(500), nullable=False)
    lms_username: Mapped[str] = mapped_column(String(255), nullable=False)
    encrypted_credentials_or_session: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True
    )
    status: Mapped[LMSConnectionStatus] = mapped_column(
        Enum(LMSConnectionStatus), default=LMSConnectionStatus.ACTIVE, nullable=False
    )
    last_sync_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    expires_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    last_error: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
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
    user: Mapped[User] = relationship("User", back_populates="lms_connections")

    def __repr__(self) -> str:
        return f"<LMSConnection(id={self.id}, user_id={self.user_id}, status={self.status})>"

