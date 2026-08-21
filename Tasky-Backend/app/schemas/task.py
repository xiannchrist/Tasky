"""
Tasky Backend — Task Schemas
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

from app.models.task import TaskType, TaskPriority, TaskStatus, TaskSource


class TaskCreate(BaseModel):
    """Create a new task."""
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    subject_id: Optional[int] = None
    task_type: TaskType = TaskType.OTHER
    deadline: Optional[datetime] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    status: TaskStatus = TaskStatus.PENDING
    source: TaskSource = TaskSource.MANUAL
    source_url: Optional[str] = None
    lms_source_id: Optional[str] = None


class TaskUpdate(BaseModel):
    """Update an existing task. All fields optional."""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    subject_id: Optional[int] = None
    task_type: Optional[TaskType] = None
    deadline: Optional[datetime] = None
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    source_url: Optional[str] = None


class TaskResponse(BaseModel):
    """Task response."""
    id: int
    user_id: int
    subject_id: Optional[int] = None
    lms_source_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    task_type: TaskType
    deadline: Optional[datetime] = None
    priority: TaskPriority
    status: TaskStatus
    source: TaskSource
    source_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TaskSyncRequest(BaseModel):
    """Bulk sync request from mobile (offline changes)."""
    tasks: List[TaskCreate]


class TaskSyncResponse(BaseModel):
    """Response after a sync operation."""
    success: bool = True
    new_tasks: int = 0
    updated_tasks: int = 0
    removed_tasks: int = 0
