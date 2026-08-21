"""
Tasky Backend — Notifications Router

GET /api/notifications
PUT /api/notifications/{id}/read
PUT /api/notifications/read-all
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.notification import NotificationResponse
from app.services import notification_service

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get(
    "",
    response_model=List[NotificationResponse],
    summary="List notifications",
)
async def list_notifications(
    unread_only: bool = Query(False, description="Show only unread notifications"),
    limit: int = Query(50, ge=1, le=100, description="Maximum notifications to return"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all notifications for the authenticated user."""
    return await notification_service.get_user_notifications(
        db, current_user.id, unread_only=unread_only, limit=limit
    )


@router.put(
    "/{notification_id}/read",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Mark notification as read",
)
async def mark_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark a single notification as read."""
    success = await notification_service.mark_notification_read(
        db, current_user.id, notification_id
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )


@router.put(
    "/read-all",
    summary="Mark all notifications as read",
)
async def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark all notifications as read for the authenticated user."""
    count = await notification_service.mark_all_notifications_read(
        db, current_user.id
    )
    return {"marked_read": count}
