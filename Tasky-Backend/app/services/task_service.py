"""
Tasky Backend — Task Service

CRUD operations for tasks, always scoped to the authenticated user.
"""

from datetime import datetime, timezone, timedelta
from typing import List, Optional
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.sanitizer import sanitize_text
from app.models.task import Task, TaskStatus, TaskType, TaskSource, TaskPriority
from app.schemas.task import TaskCreate, TaskUpdate


async def get_tasks(
    db: AsyncSession,
    user_id: int,
    status: Optional[TaskStatus] = None,
    priority: Optional[TaskPriority] = None,
    task_type: Optional[TaskType] = None,
    subject_id: Optional[int] = None,
    source: Optional[TaskSource] = None,
    search: Optional[str] = None,
) -> List[Task]:
    """
    Get all tasks for a user with optional filters.
    
    Every query is scoped to user_id — a student can never see another student's tasks.
    """
    query = select(Task).where(Task.user_id == user_id)

    if status is not None:
        query = query.where(Task.status == status)
    if priority is not None:
        query = query.where(Task.priority == priority)
    if task_type is not None:
        query = query.where(Task.task_type == task_type)
    if subject_id is not None:
        query = query.where(Task.subject_id == subject_id)
    if source is not None:
        query = query.where(Task.source == source)
    if search:
        query = query.where(Task.title.ilike(f"%{search}%"))

    query = query.order_by(Task.deadline.asc().nullslast(), Task.created_at.desc())

    result = await db.execute(query)
    return list(result.scalars().all())


async def get_task_by_id(db: AsyncSession, user_id: int, task_id: int) -> Optional[Task]:
    """Get a single task, scoped to the user."""
    result = await db.execute(
        select(Task).where(and_(Task.id == task_id, Task.user_id == user_id))
    )
    return result.scalar_one_or_none()


async def create_task(db: AsyncSession, user_id: int, data: TaskCreate) -> Task:
    """Create a new task for the user with sanitized input."""
    clean_title = sanitize_text(data.title) or data.title
    clean_description = sanitize_text(data.description) if data.description else None

    task = Task(
        user_id=user_id,
        title=clean_title,
        description=clean_description,
        subject_id=data.subject_id,
        task_type=data.task_type,
        deadline=data.deadline,
        priority=data.priority,
        status=data.status,
        source=data.source,
        source_url=data.source_url,
        lms_source_id=data.lms_source_id,
    )
    db.add(task)
    await db.flush()
    await db.refresh(task)
    return task


async def update_task(
    db: AsyncSession, user_id: int, task_id: int, data: TaskUpdate
) -> Optional[Task]:
    """
    Update an existing task with sanitized input. Only updates provided fields.
    
    Returns None if the task doesn't exist or doesn't belong to the user.
    """
    task = await get_task_by_id(db, user_id, task_id)
    if task is None:
        return None

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field in ("title", "description") and isinstance(value, str):
            value = sanitize_text(value)
        setattr(task, field, value)

    await db.flush()
    await db.refresh(task)
    return task


async def toggle_task_status(db: AsyncSession, user_id: int, task_id: int) -> Optional[Task]:
    """Toggle a task status between pending and completed."""
    task = await get_task_by_id(db, user_id, task_id)
    if task is None:
        return None

    task.status = (
        TaskStatus.PENDING if task.status == TaskStatus.COMPLETED else TaskStatus.COMPLETED
    )
    await db.flush()
    await db.refresh(task)
    return task


async def delete_task(db: AsyncSession, user_id: int, task_id: int) -> bool:
    """
    Delete a task. Returns True if deleted, False if not found.
    
    Scoped to user_id for security.
    """
    task = await get_task_by_id(db, user_id, task_id)
    if task is None:
        return False

    await db.delete(task)
    await db.flush()
    return True


async def get_task_statistics(db: AsyncSession, user_id: int) -> dict:
    """Compute task statistics for the user."""
    tasks = await get_tasks(db, user_id)
    total = len(tasks)
    pending = sum(1 for t in tasks if t.status == TaskStatus.PENDING)
    completed = sum(1 for t in tasks if t.status == TaskStatus.COMPLETED)
    
    now = datetime.now(timezone.utc)
    soon = now + timedelta(days=2)
    due_soon = sum(
        1 for t in tasks
        if t.status == TaskStatus.PENDING and t.deadline and now <= t.deadline <= soon
    )

    return {
        "total": total,
        "pending": pending,
        "completed": completed,
        "due_soon": due_soon,
    }


async def get_or_create_lms_task(
    db: AsyncSession,
    user_id: int,
    lms_source_id: str,
    task_data: TaskCreate,
) -> tuple[Task, bool]:
    """
    Find an existing LMS task by lms_source_id + user_id, or create a new one.
    
    Returns (task, created) tuple for duplicate detection.
    This is the core of Section 14 — Duplicate Detection.
    """
    result = await db.execute(
        select(Task).where(
            and_(Task.user_id == user_id, Task.lms_source_id == lms_source_id)
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        existing.title = task_data.title
        existing.description = task_data.description
        existing.deadline = task_data.deadline
        existing.task_type = task_data.task_type
        existing.source_url = task_data.source_url
        existing.subject_id = task_data.subject_id

        await db.flush()
        await db.refresh(existing)
        return existing, False

    task = await create_task(db, user_id, task_data)
    return task, True
