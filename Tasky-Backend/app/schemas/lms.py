"""
Tasky Backend — LMS Schemas
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class LMSConnectRequest(BaseModel):
    """Request to connect an LMS account."""
    lms_url: str = Field(..., min_length=1, max_length=500)
    lms_username: str = Field(..., min_length=1, max_length=255)
    lms_password: str = Field(..., min_length=1)


class LMSStatusResponse(BaseModel):
    """LMS connection status response."""
    connected: bool
    lms_url: Optional[str] = None
    lms_username: Optional[str] = None
    last_sync: Optional[datetime] = None
    next_sync: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    status: str = "disconnected"
    last_error: Optional[str] = None

    model_config = {"from_attributes": True}


class LMSSyncResponse(BaseModel):
    """Response after an LMS sync operation."""
    success: bool = True
    new_tasks: int = 0
    updated_tasks: int = 0
    removed_tasks: int = 0
    message: Optional[str] = None
