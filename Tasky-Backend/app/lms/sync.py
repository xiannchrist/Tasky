from __future__ import annotations

import logging
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.lms.base import BaseLMSAdapter
from app.lms.custom_lms import CustomLMSAdapter
from app.lms.normalizer import normalize_lms_task
from app.models.lms_connection import LMSConnection, LMSConnectionStatus
from app.models.subject import Subject
from app.services.lms_service import decrypt_credentials
from app.services.task_service import get_or_create_lms_task
from app.services.notification_service import notify_new_lms_task
from app.schemas.lms import LMSSyncResponse

logger = logging.getLogger(__name__)



def get_adapter() -> BaseLMSAdapter:
    """
    Factory: get the appropriate LMS adapter.
    
    Currently returns CustomLMSAdapter.
    When an official API becomes available, swap this to return
    the new adapter without changing any sync logic.
    """
    return CustomLMSAdapter()


async def sync_user_tasks(
    db: AsyncSession,
    connection: LMSConnection,
) -> LMSSyncResponse:
    """
    Full sync for a single user's LMS connection.
    
    This is the core sync engine (Section 10-15 of Backend.md):
    - Authenticates with LMS using the user's encrypted credentials
    - Fetches courses and tasks
    - Normalizes and deduplicates
    - Creates/updates tasks
    - Sends notifications for new and changed tasks
    """
    adapter = get_adapter()
    new_count = 0
    updated_count = 0
    user_id = connection.user_id

    try:
        # Decrypt credentials (never logged)
        if not connection.encrypted_credentials_or_session:
            connection.status = LMSConnectionStatus.ERROR
            connection.last_error = "No credentials stored for this LMS connection"
            await db.flush()
            return LMSSyncResponse(
                success=False,
                message="No credentials found for this LMS connection. Please reconnect.",
            )

        password = decrypt_credentials(connection.encrypted_credentials_or_session)



        # Authenticate
        authenticated = await adapter.authenticate(
            connection.lms_url,
            connection.lms_username,
            password,
        )

        if not authenticated:
            connection.status = LMSConnectionStatus.ERROR
            connection.last_error = "Authentication failed"
            await db.flush()
            return LMSSyncResponse(
                success=False,
                message="LMS authentication failed. Please check your credentials.",
            )

        # Fetch all data
        sync_result = await adapter.fetch_all()

        if not sync_result.success:
            connection.status = LMSConnectionStatus.ERROR
            connection.last_error = "; ".join(sync_result.errors)
            await db.flush()
            return LMSSyncResponse(
                success=False,
                message="Failed to fetch data from LMS.",
            )

        # Match LMS courses to Tasky subjects
        subject_map = await _build_subject_map(db, user_id, sync_result.courses)

        # Process each LMS task
        for lms_task in sync_result.tasks:
            subject_id = subject_map.get(lms_task.course_name)
            task_data = normalize_lms_task(lms_task, subject_id=subject_id)

            task, created = await get_or_create_lms_task(
                db, user_id, lms_task.source_id, task_data
            )

            if created:
                new_count += 1
                # Notify for new LMS task (Section 16)
                await notify_new_lms_task(db, user_id, task)
            else:
                updated_count += 1
                # TODO: Check if deadline changed and notify (Section 15)

        # Update sync timestamp
        connection.last_sync_at = datetime.now(timezone.utc)
        connection.status = LMSConnectionStatus.ACTIVE
        connection.last_error = None
        await db.flush()

        logger.info(
            f"Sync completed for user {user_id}: "
            f"{new_count} new, {updated_count} updated"
        )

        return LMSSyncResponse(
            success=True,
            new_tasks=new_count,
            updated_tasks=updated_count,
        )

    except Exception as e:
        logger.error(f"Sync failed for user {user_id}: {str(e)}")
        connection.status = LMSConnectionStatus.ERROR
        connection.last_error = str(e)
        await db.flush()

        return LMSSyncResponse(
            success=False,
            message="LMS synchronization failed.",
        )

    finally:
        await adapter.close()


async def _build_subject_map(
    db: AsyncSession,
    user_id: int,
    lms_courses: list,
) -> dict[str, int]:
    """
    Build a mapping of LMS course names to Tasky subject IDs.
    
    If an LMS course doesn't match an existing subject, create one.
    (Section 8 of Backend.md)
    """
    subject_map = {}

    # Get existing subjects
    result = await db.execute(
        select(Subject).where(Subject.user_id == user_id)
    )
    existing_subjects = {s.name.lower(): s for s in result.scalars().all()}

    for course in lms_courses:
        course_name_lower = course.name.lower()

        if course_name_lower in existing_subjects:
            subject_map[course.name] = existing_subjects[course_name_lower].id
        else:
            # Auto-create subject from LMS course
            new_subject = Subject(
                user_id=user_id,
                name=course.name,
                code=course.code,
            )
            db.add(new_subject)
            await db.flush()
            await db.refresh(new_subject)
            subject_map[course.name] = new_subject.id
            existing_subjects[course_name_lower] = new_subject

    return subject_map
