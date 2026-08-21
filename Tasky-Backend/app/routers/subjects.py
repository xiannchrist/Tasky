"""
Tasky Backend — Subjects Router

GET    /api/subjects
POST   /api/subjects
PUT    /api/subjects/{id}
DELETE /api/subjects/{id}
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.subject import Subject
from app.schemas.subject import SubjectCreate, SubjectUpdate, SubjectResponse

router = APIRouter(prefix="/api/subjects", tags=["Subjects"])


@router.get(
    "",
    response_model=List[SubjectResponse],
    summary="List all subjects for the authenticated user",
)
async def list_subjects(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all subjects belonging to the authenticated user."""
    result = await db.execute(
        select(Subject)
        .where(Subject.user_id == current_user.id)
        .order_by(Subject.name.asc())
    )
    return list(result.scalars().all())


@router.post(
    "",
    response_model=SubjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new subject",
)
async def create_subject(
    data: SubjectCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new subject for the authenticated user."""
    subject = Subject(
        user_id=current_user.id,
        name=data.name,
        code=data.code,
        color=data.color,
    )
    db.add(subject)
    await db.flush()
    await db.refresh(subject)
    return subject


@router.put(
    "/{subject_id}",
    response_model=SubjectResponse,
    summary="Update an existing subject",
)
async def update_subject(
    subject_id: int,
    data: SubjectUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a subject. Only updates provided fields."""
    result = await db.execute(
        select(Subject).where(
            and_(Subject.id == subject_id, Subject.user_id == current_user.id)
        )
    )
    subject = result.scalar_one_or_none()

    if subject is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found",
        )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(subject, field, value)

    await db.flush()
    await db.refresh(subject)
    return subject


@router.delete(
    "/{subject_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a subject",
)
async def delete_subject(
    subject_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a subject by ID."""
    result = await db.execute(
        select(Subject).where(
            and_(Subject.id == subject_id, Subject.user_id == current_user.id)
        )
    )
    subject = result.scalar_one_or_none()

    if subject is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found",
        )

    await db.delete(subject)
    await db.flush()
