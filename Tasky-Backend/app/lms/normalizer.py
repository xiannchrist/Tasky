"""
Tasky Backend — LMS Data Normalizer

Converts raw LMS data into Tasky task format.
"""

from typing import Optional

from app.lms.base import LMSTask
from app.models.task import TaskType, TaskSource
from app.schemas.task import TaskCreate


# Map LMS task type strings to Tasky TaskType enum
TASK_TYPE_MAP = {
    "assignment": TaskType.ASSIGNMENT,
    "quiz": TaskType.QUIZ,
    "performance_task": TaskType.PERFORMANCE_TASK,
    "exam": TaskType.EXAM,
    "project": TaskType.PROJECT,
    "activity": TaskType.ACTIVITY,
    "deadline": TaskType.DEADLINE,
    "other": TaskType.OTHER,
}


def normalize_lms_task(
    lms_task: LMSTask,
    subject_id: Optional[int] = None,
) -> TaskCreate:
    """
    Convert an LMSTask (from any adapter) into a Tasky TaskCreate schema.
    
    This normalization layer ensures that regardless of which LMS adapter
    is used, the output is always a consistent Tasky task format.
    """
    task_type = TASK_TYPE_MAP.get(lms_task.task_type, TaskType.OTHER)

    return TaskCreate(
        title=lms_task.title,
        description=lms_task.description,
        subject_id=subject_id,
        task_type=task_type,
        deadline=lms_task.deadline,
        source=TaskSource.LMS,
        source_url=lms_task.source_url,
        lms_source_id=lms_task.source_id,
    )
