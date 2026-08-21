"""
Tasky Backend — LMS Service

LMS connection management and sync orchestration.
Actual LMS adapter implementation is in app/lms/.
"""

import logging
from datetime import datetime, timezone, timedelta
from cryptography.fernet import Fernet

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.lms_connection import LMSConnection, LMSConnectionStatus
from app.schemas.lms import LMSConnectRequest, LMSStatusResponse, LMSSyncResponse

logger = logging.getLogger(__name__)


def _get_cipher() -> Fernet:
    """Get a Fernet cipher for encrypting/decrypting LMS credentials."""
    # Ensure the key is valid Fernet key (32 url-safe base64-encoded bytes)
    key = settings.LMS_ENCRYPTION_KEY
    # If the key is a simple string, derive a proper Fernet key
    import base64
    import hashlib
    derived = hashlib.sha256(key.encode()).digest()
    fernet_key = base64.urlsafe_b64encode(derived)
    return Fernet(fernet_key)


def encrypt_credentials(password: str) -> str:
    """Encrypt LMS password for storage. NEVER store plaintext."""
    cipher = _get_cipher()
    return cipher.encrypt(password.encode()).decode()


def decrypt_credentials(encrypted: str) -> str:
    """Decrypt LMS password for sync operations only."""
    cipher = _get_cipher()
    return cipher.decrypt(encrypted.encode()).decode()


async def connect_lms(
    db: AsyncSession, user_id: int, data: LMSConnectRequest
) -> LMSConnection:
    """
    Create or update an LMS connection for the user.
    
    Encrypts credentials before storage.
    """
    # Check for existing connection
    result = await db.execute(
        select(LMSConnection).where(LMSConnection.user_id == user_id)
    )
    existing = result.scalar_one_or_none()

    encrypted_password = encrypt_credentials(data.lms_password)

    if existing:
        existing.lms_url = data.lms_url
        existing.lms_username = data.lms_username
        existing.encrypted_credentials_or_session = encrypted_password
        existing.status = LMSConnectionStatus.ACTIVE
        existing.last_error = None
        await db.flush()
        await db.refresh(existing)
        return existing

    connection = LMSConnection(
        user_id=user_id,
        lms_url=data.lms_url,
        lms_username=data.lms_username,
        encrypted_credentials_or_session=encrypted_password,
        status=LMSConnectionStatus.ACTIVE,
    )
    db.add(connection)
    await db.flush()
    await db.refresh(connection)
    return connection


async def disconnect_lms(db: AsyncSession, user_id: int) -> bool:
    """Disconnect and remove LMS connection."""
    result = await db.execute(
        select(LMSConnection).where(LMSConnection.user_id == user_id)
    )
    connection = result.scalar_one_or_none()

    if connection is None:
        return False

    await db.delete(connection)
    await db.flush()
    return True


async def get_lms_status(db: AsyncSession, user_id: int) -> LMSStatusResponse:
    """Get LMS connection status for the user."""
    result = await db.execute(
        select(LMSConnection).where(LMSConnection.user_id == user_id)
    )
    connection = result.scalar_one_or_none()

    if connection is None:
        return LMSStatusResponse(connected=False)

    # Calculate next sync time
    next_sync = None
    if connection.last_sync_at and connection.status == LMSConnectionStatus.ACTIVE:
        next_sync = connection.last_sync_at + timedelta(
            minutes=settings.LMS_SYNC_INTERVAL_MINUTES
        )

    return LMSStatusResponse(
        connected=connection.status == LMSConnectionStatus.ACTIVE,
        lms_url=connection.lms_url,
        lms_username=connection.lms_username,
        last_sync=connection.last_sync_at,
        next_sync=next_sync,
        status=connection.status.value,
        last_error=connection.last_error,
    )


async def trigger_manual_sync(db: AsyncSession, user_id: int) -> LMSSyncResponse:
    """
    Trigger a manual LMS sync for the authenticated user.
    
    This calls the LMS adapter to fetch and normalize tasks.
    For Phase 1, this is a placeholder that will be connected to the
    real LMS adapter in Phase 3.
    """
    result = await db.execute(
        select(LMSConnection).where(LMSConnection.user_id == user_id)
    )
    connection = result.scalar_one_or_none()

    if connection is None:
        return LMSSyncResponse(
            success=False,
            message="No LMS connection found. Please connect your LMS first.",
        )

    if connection.status != LMSConnectionStatus.ACTIVE:
        return LMSSyncResponse(
            success=False,
            message=f"LMS connection is not active. Status: {connection.status.value}",
        )

    try:
        # TODO: Phase 3 — Call actual LMS adapter here
        # from app.lms.sync import sync_user_tasks
        # result = await sync_user_tasks(db, connection)

        # For now, update last_sync timestamp
        connection.last_sync_at = datetime.now(timezone.utc)
        await db.flush()

        logger.info(f"Manual sync triggered for user {user_id}")

        return LMSSyncResponse(
            success=True,
            new_tasks=0,
            updated_tasks=0,
            removed_tasks=0,
            message="Sync completed. LMS adapter will be connected in Phase 3.",
        )

    except Exception as e:
        # Log detailed error but don't expose to user (Section 28)
        logger.error(f"LMS sync failed for user {user_id}: {str(e)}")
        connection.status = LMSConnectionStatus.ERROR
        connection.last_error = str(e)
        await db.flush()

        return LMSSyncResponse(
            success=False,
            message="LMS synchronization failed. Please check your connection.",
        )
