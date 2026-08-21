"""
Tasky Backend — Notification Schemas
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from app.models.notification import NotificationType


class NotificationResponse(BaseModel):
    """Notification response."""
    id: int
    user_id: int
    task_id: Optional[int] = None
    type: NotificationType
    title: str
    body: Optional[str] = None
    read: bool
    sent_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class NotificationPreferences(BaseModel):
    """Student notification preferences."""
    new_lms_tasks: bool = True
    new_quizzes: bool = True
    deadline_tomorrow: bool = True
    deadline_today: bool = True
    deadline_changed: bool = True
    reminder_hours_before: int = 24
