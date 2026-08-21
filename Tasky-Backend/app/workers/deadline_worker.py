"""
Tasky Backend — Deadline Worker

Background worker that checks upcoming deadlines
and sends reminder notifications.
"""

import logging
from datetime import datetime, timezone, timedelta

from sqlalchemy import select, and_

from app.db.database import AsyncSessionLocal

from app.models.task import Task, TaskStatus
from app.models.notification import Notification, NotificationType
from app.services.notification_service import create_notification

logger = logging.getLogger(__name__)


async def run_deadline_check():
    """
    Check for upcoming deadlines and send reminders.
    
    Called by the scheduler every hour.
    Sends notifications for:
    - DEADLINE_TOMORROW: 24 hours before
    - DEADLINE_TODAY: Same day
    - TASK_OVERDUE: Past deadline
    """
    logger.info("Deadline check worker started")

    async with AsyncSessionLocal() as db:
        try:
            now = datetime.now(timezone.utc)
            tomorrow = now + timedelta(hours=24)
            today_end = now.replace(hour=23, minute=59, second=59)

            # Find tasks with deadlines in the next 24 hours
            result = await db.execute(
                select(Task).where(
                    and_(
                        Task.deadline.isnot(None),
                        Task.status.in_([TaskStatus.PENDING, TaskStatus.IN_PROGRESS]),
                        Task.deadline > now,
                        Task.deadline <= tomorrow,
                    )
                )
            )
            upcoming_tasks = list(result.scalars().all())

            for task in upcoming_tasks:
                # Check if we already sent a reminder for this task
                existing_notif = await db.execute(
                    select(Notification).where(
                        and_(
                            Notification.task_id == task.id,
                            Notification.type.in_([
                                NotificationType.DEADLINE_TOMORROW,
                                NotificationType.DEADLINE_TODAY,
                            ]),
                        )
                    )
                )
                if existing_notif.scalar_one_or_none():
                    continue  # Already notified

                # Determine notification type
                if task.deadline <= today_end:
                    notif_type = NotificationType.DEADLINE_TODAY
                    title = "⏰ Due Today"
                else:
                    notif_type = NotificationType.DEADLINE_TOMORROW
                    title = "📅 Due Tomorrow"

                body = (
                    f"{task.title}\n\n"
                    f"Due: {task.deadline.strftime('%B %d, %Y at %I:%M %p')}"
                )

                await create_notification(
                    db=db,
                    user_id=task.user_id,
                    notification_type=notif_type,
                    title=title,
                    body=body,
                    task_id=task.id,
                )

            # Check for overdue tasks
            result = await db.execute(
                select(Task).where(
                    and_(
                        Task.deadline.isnot(None),
                        Task.status.in_([TaskStatus.PENDING, TaskStatus.IN_PROGRESS]),
                        Task.deadline < now,
                    )
                )
            )
            overdue_tasks = list(result.scalars().all())

            for task in overdue_tasks:
                # Check if we already sent an overdue notification
                existing_notif = await db.execute(
                    select(Notification).where(
                        and_(
                            Notification.task_id == task.id,
                            Notification.type == NotificationType.TASK_OVERDUE,
                        )
                    )
                )
                if existing_notif.scalar_one_or_none():
                    continue

                await create_notification(
                    db=db,
                    user_id=task.user_id,
                    notification_type=NotificationType.TASK_OVERDUE,
                    title="🚨 Task Overdue",
                    body=f"{task.title}\n\nWas due: {task.deadline.strftime('%B %d, %Y at %I:%M %p')}",
                    task_id=task.id,
                )

                # Update task status to overdue
                task.status = TaskStatus.OVERDUE

            await db.commit()

        except Exception as e:
            logger.error(f"Deadline check worker error: {str(e)}")
            await db.rollback()

    logger.info("Deadline check worker completed")
