"""
Tasky Backend — Models Package

Re-exports all models so Alembic can discover them via a single import.
"""

from app.models.user import User
from app.models.subject import Subject
from app.models.task import Task, TaskType, TaskPriority, TaskStatus, TaskSource
from app.models.lms_connection import LMSConnection, LMSConnectionStatus
from app.models.device import Device
from app.models.notification import Notification, NotificationType

__all__ = [
    "User",
    "Subject",
    "Task",
    "TaskType",
    "TaskPriority",
    "TaskStatus",
    "TaskSource",
    "LMSConnection",
    "LMSConnectionStatus",
    "Device",
    "Notification",
    "NotificationType",
]
