from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status

from pydantic import BaseModel, Field
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.device import Device

router = APIRouter(prefix="/api/devices", tags=["Devices"])


class DeviceRegisterRequest(BaseModel):
    """Register a push notification device."""
    push_token: str = Field(..., min_length=1)
    platform: Optional[str] = Field(None, max_length=20)  # "android" or "ios"
    device_name: Optional[str] = Field(None, max_length=255)


class DeviceResponse(BaseModel):
    """Device response."""
    id: int
    push_token: str
    platform: Optional[str] = None
    device_name: Optional[str] = None

    model_config = {"from_attributes": True}



@router.post(
    "",
    response_model=DeviceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a push notification device",
)
@router.post(
    "/register",
    response_model=DeviceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a push notification device",
)
async def register_device(
    data: DeviceRegisterRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Register a device for push notifications.
    
    If the push_token already exists for this user, updates it.
    Supports multiple devices per user (Section 17).
    """
    # Check if token already registered
    result = await db.execute(
        select(Device).where(Device.push_token == data.push_token)
    )
    existing = result.scalar_one_or_none()

    if existing:
        # Update existing device ownership
        existing.user_id = current_user.id
        existing.platform = data.platform
        existing.device_name = data.device_name
        await db.flush()
        await db.refresh(existing)
        return existing

    device = Device(
        user_id=current_user.id,
        push_token=data.push_token,
        platform=data.platform,
        device_name=data.device_name,
    )
    db.add(device)
    await db.flush()
    await db.refresh(device)
    return device


@router.delete(
    "/{device_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Unregister a device",
)
async def unregister_device(
    device_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove a device from push notifications."""
    result = await db.execute(
        select(Device).where(
            and_(Device.id == device_id, Device.user_id == current_user.id)
        )
    )
    device = result.scalar_one_or_none()

    if device is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found",
        )

    await db.delete(device)
    await db.flush()
