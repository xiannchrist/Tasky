"""
Tasky Backend — LMS Router

POST   /api/lms/connect
DELETE /api/lms/disconnect
GET    /api/lms/status
POST   /api/lms/sync
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.lms import LMSConnectRequest, LMSStatusResponse, LMSSyncResponse
from app.services import lms_service

router = APIRouter(prefix="/api/lms", tags=["LMS Integration"])


@router.post(
    "/connect",
    response_model=LMSStatusResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Connect LMS account",
)
async def connect_lms(
    data: LMSConnectRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Connect the student's LMS account.
    
    LMS credentials are encrypted before storage and NEVER returned in responses.
    """
    await lms_service.connect_lms(db, current_user.id, data)
    return await lms_service.get_lms_status(db, current_user.id)



@router.delete(
    "/disconnect",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Disconnect LMS account",
)
async def disconnect_lms(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Disconnect and remove the student's LMS connection."""
    disconnected = await lms_service.disconnect_lms(db, current_user.id)
    if not disconnected:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No LMS connection found",
        )


@router.get(
    "/status",
    response_model=LMSStatusResponse,
    summary="Get LMS connection status",
)
async def get_lms_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get the current LMS connection status.
    
    Shows: connected, last_sync, next_sync, status, and error info.
    NEVER returns LMS password.
    """
    return await lms_service.get_lms_status(db, current_user.id)


@router.post(
    "/sync",
    response_model=LMSSyncResponse,
    summary="Trigger manual LMS sync",
)
async def manual_sync(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Manually trigger LMS synchronization for the authenticated user.
    
    Returns the number of new, updated, and removed tasks.
    """
    return await lms_service.trigger_manual_sync(db, current_user.id)
