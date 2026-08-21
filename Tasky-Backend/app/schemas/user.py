"""
Tasky Backend — User Schemas
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserResponse(BaseModel):
    """User profile response."""
    id: int
    email: EmailStr
    name: str
    student_id: Optional[str] = None
    section: Optional[str] = None
    about: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    """User profile update request."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    student_id: Optional[str] = Field(None, max_length=50)
    section: Optional[str] = Field(None, max_length=100)
    about: Optional[str] = None
