"""
Tasky Backend — Background Scheduler

APScheduler-based background scheduler for development.
For production, replace with Celery + Redis (Section 18).
"""

import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.core.config import settings

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


def start_scheduler():
    """
    Start the background scheduler with LMS sync and deadline check jobs.
    
    This runs alongside the FastAPI app during development.
    For production, use Celery workers instead.
    """
    from app.workers.lms_sync_worker import run_lms_sync
    from app.workers.deadline_worker import run_deadline_check

    # LMS sync job — runs every N minutes
    scheduler.add_job(
        run_lms_sync,
        "interval",
        minutes=settings.LMS_SYNC_INTERVAL_MINUTES,
        id="lms_sync",
        name="LMS Synchronization",
        replace_existing=True,
    )

    # Deadline check job — runs every hour
    scheduler.add_job(
        run_deadline_check,
        "interval",
        hours=1,
        id="deadline_check",
        name="Deadline Reminder Check",
        replace_existing=True,
    )

    scheduler.start()
    logger.info(
        f"Background scheduler started. "
        f"LMS sync interval: {settings.LMS_SYNC_INTERVAL_MINUTES} minutes"
    )


def stop_scheduler():
    """Shut down the scheduler gracefully."""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("Background scheduler stopped")
