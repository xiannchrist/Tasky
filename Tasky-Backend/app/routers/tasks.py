"""
Tasky Backend — Tasks Router

GET    /api/tasks
GET    /api/tasks/stats
GET    /api/tasks/{id}
POST   /api/tasks
PUT    /api/tasks/{id}
PATCH  /api/tasks/{id}/toggle
DELETE /api/tasks/{id}
POST   /api/tasks/sync
"""

from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.task import TaskStatus, TaskType, TaskSource, TaskPriority
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskSyncRequest, TaskSyncResponse
from app.services import task_service

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


class TaskStatsResponse(BaseModel):
    total: int
    pending: int
    completed: int
    due_soon: int


@router.get(
    "",
    response_model=List[TaskResponse],
    summary="List all tasks for the authenticated user",
)
async def list_tasks(
    status: Optional[TaskStatus] = Query(None, description="Filter by status"),
    priority: Optional[TaskPriority] = Query(None, description="Filter by priority"),
    task_type: Optional[TaskType] = Query(None, description="Filter by task type"),
    subject_id: Optional[int] = Query(None, description="Filter by subject"),
    source: Optional[TaskSource] = Query(None, description="Filter by source"),
    search: Optional[str] = Query(None, description="Search by title"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get all tasks belonging to the authenticated user.
    
    Supports filtering by status, priority, task_type, subject_id, source, and title search.
    """
    return await task_service.get_tasks(
        db,
        user_id=current_user.id,
        status=status,
        priority=priority,
        task_type=task_type,
        subject_id=subject_id,
        source=source,
        search=search,
    )


@router.get(
    "/stats",
    response_model=TaskStatsResponse,
    summary="Get task statistics counter",
)
async def get_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return task statistics summary for authenticated student."""
    return await task_service.get_task_statistics(db, current_user.id)


@router.get(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Get a single task",
)
async def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single task by ID, scoped to the authenticated user."""
    task = await task_service.get_task_by_id(db, current_user.id, task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    return task


@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task",
)
async def create_task(
    data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new task for the authenticated user."""
    return await task_service.create_task(db, current_user.id, data)


@router.put(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Update an existing task",
)
async def update_task(
    task_id: int,
    data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a task. Only updates provided fields."""
    task = await task_service.update_task(db, current_user.id, task_id, data)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    return task


@router.patch(
    "/{task_id}/toggle",
    response_model=TaskResponse,
    summary="Toggle task status",
)
async def toggle_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Toggle a task status between pending and completed."""
    task = await task_service.toggle_task_status(db, current_user.id, task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    return task


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a task",
)
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a task by ID."""
    deleted = await task_service.delete_task(db, current_user.id, task_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )


@router.post(
    "/sync",
    response_model=TaskSyncResponse,
    summary="Bulk sync tasks from mobile (offline changes)",
)
async def sync_tasks(
    data: TaskSyncRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Sync multiple tasks from the mobile app.
    
    Used to push offline changes when the device comes back online.
    """
    new_count = 0
    updated_count = 0

    for task_data in data.tasks:
        if task_data.lms_source_id:
            _, created = await task_service.get_or_create_lms_task(
                db, current_user.id, task_data.lms_source_id, task_data
            )
            if created:
                new_count += 1
            else:
                updated_count += 1
        else:
            await task_service.create_task(db, current_user.id, task_data)
            new_count += 1

    return TaskSyncResponse(
        success=True,
        new_tasks=new_count,
        updated_tasks=updated_count,
    )
