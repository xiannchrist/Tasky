"""
Tasky Backend — Subject Schemas
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class SubjectCreate(BaseModel):
    """Create a new subject."""
    name: str = Field(..., min_length=1, max_length=255)
    code: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, max_length=20)


class SubjectUpdate(BaseModel):
    """Update an existing subject. All fields optional."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    code: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, max_length=20)


class SubjectResponse(BaseModel):
    """Subject response."""
    id: int
    user_id: int
    name: str
    code: Optional[str] = None
    color: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
