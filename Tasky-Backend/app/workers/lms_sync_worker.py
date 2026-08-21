"""
Tasky Backend — LMS Sync Worker

Background worker that iterates all active LMS connections
and runs synchronization for each.

This runs independently of the mobile application (Section 18).
"""

import logging

from sqlalchemy import select

from app.db.database import AsyncSessionLocal

from app.models.lms_connection import LMSConnection, LMSConnectionStatus
from app.lms.sync import sync_user_tasks

logger = logging.getLogger(__name__)


async def run_lms_sync():
    """
    Main LMS sync worker function.
    
    Called by the scheduler every N minutes.
    Iterates all active LMS connections and syncs each user's tasks.
    Each user's sync is independent — one failure doesn't affect others.
    """
    logger.info("LMS sync worker started")

    async with AsyncSessionLocal() as db:
        try:
            # Get all active LMS connections
            result = await db.execute(
                select(LMSConnection).where(
                    LMSConnection.status == LMSConnectionStatus.ACTIVE
                )
            )
            connections = list(result.scalars().all())

            if not connections:
                logger.info("No active LMS connections to sync")
                return

            logger.info(f"Syncing {len(connections)} LMS connections")

            for connection in connections:
                try:
                    sync_result = await sync_user_tasks(db, connection)
                    logger.info(
                        f"User {connection.user_id}: "
                        f"{sync_result.new_tasks} new, "
                        f"{sync_result.updated_tasks} updated"
                    )
                except Exception as e:
                    # Don't let one user's failure stop others (Section 19)
                    logger.error(
                        f"Sync failed for user {connection.user_id}: {str(e)}"
                    )

            await db.commit()

        except Exception as e:
            logger.error(f"LMS sync worker error: {str(e)}")
            await db.rollback()

    logger.info("LMS sync worker completed")
