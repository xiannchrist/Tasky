"""
Tasky Backend — Notification Service

Create and manage notifications.
FCM push sending will be connected in Phase 5.
"""

import logging
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification, NotificationType
from app.models.task import Task

logger = logging.getLogger(__name__)


async def create_notification(
    db: AsyncSession,
    user_id: int,
    notification_type: NotificationType,
    title: str,
    body: Optional[str] = None,
    task_id: Optional[int] = None,
) -> Notification:
    """Create a notification record and (in Phase 5) send via FCM."""
    notification = Notification(
        user_id=user_id,
        task_id=task_id,
        type=notification_type,
        title=title,
        body=body,
        sent_at=datetime.now(timezone.utc),
    )
    db.add(notification)
    await db.flush()
    await db.refresh(notification)

    # TODO: Phase 5 — Send via FCM
    # from app.services.fcm_service import send_push_notification
    # await send_push_notification(user_id, title, body)

    logger.info(f"Notification created for user {user_id}: {title}")
    return notification


async def get_user_notifications(
    db: AsyncSession,
    user_id: int,
    unread_only: bool = False,
    limit: int = 50,
) -> List[Notification]:
    """Get notifications for a user, optionally filtered to unread only."""
    query = select(Notification).where(Notification.user_id == user_id)

    if unread_only:
        query = query.where(Notification.read == False)

    query = query.order_by(Notification.created_at.desc()).limit(limit)

    result = await db.execute(query)
    return list(result.scalars().all())


async def mark_notification_read(
    db: AsyncSession, user_id: int, notification_id: int
) -> bool:
    """Mark a single notification as read."""
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == user_id,
        )
    )
    notification = result.scalar_one_or_none()

    if notification is None:
        return False

    notification.read = True
    await db.flush()
    return True


async def mark_all_notifications_read(db: AsyncSession, user_id: int) -> int:
    """Mark all notifications as read for a user. Returns count updated."""
    result = await db.execute(
        update(Notification)
        .where(Notification.user_id == user_id, Notification.read == False)
        .values(read=True)
    )
    await db.flush()
    return result.rowcount


async def notify_new_lms_task(db: AsyncSession, user_id: int, task: Task) -> None:
    """Send notification for a newly imported LMS task."""
    type_map = {
        "quiz": NotificationType.NEW_QUIZ,
        "exam": NotificationType.NEW_EXAM,
        "performance_task": NotificationType.NEW_PERFORMANCE_TASK,
    }
    notif_type = type_map.get(task.task_type.value, NotificationType.NEW_TASK)

    type_label = task.task_type.value.replace("_", " ").title()
    title = f"🔔 New {type_label}"

    deadline_str = ""
    if task.deadline:
        deadline_str = f"\n\nDue {task.deadline.strftime('%B %d, %Y at %I:%M %p')}"

    body = f"{task.title}{deadline_str}"

    await create_notification(
        db=db,
        user_id=user_id,
        notification_type=notif_type,
        title=title,
        body=body,
        task_id=task.id,
    )


async def notify_deadline_changed(
    db: AsyncSession, user_id: int, task: Task, old_deadline: datetime
) -> None:
    """Send notification when an LMS task's deadline changes."""
    title = "📅 Deadline Changed"
    body = (
        f"{task.title}\n\n"
        f"Old: {old_deadline.strftime('%B %d, %Y at %I:%M %p')}\n"
        f"New: {task.deadline.strftime('%B %d, %Y at %I:%M %p')}"
    )

    await create_notification(
        db=db,
        user_id=user_id,
        notification_type=NotificationType.DEADLINE_CHANGED,
        title=title,
        body=body,
        task_id=task.id,
    )
