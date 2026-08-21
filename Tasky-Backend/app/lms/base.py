"""
Tasky Backend — Base LMS Adapter

Abstract interface for LMS integration.
All LMS-specific implementations must extend this class.

The adapter pattern allows replacing the custom LMS scraper with an
official API integration later without rewriting the rest of Tasky.
(Section 10 & 43 of Backend.md)
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional


@dataclass
class LMSCourse:
    """Normalized LMS course/subject."""
    id: str
    name: str
    code: Optional[str] = None


@dataclass
class LMSTask:
    """Normalized LMS task/assignment/quiz."""
    source_id: str  # Unique identifier from the LMS
    title: str
    course_name: str
    course_id: Optional[str] = None
    description: Optional[str] = None
    task_type: str = "other"  # assignment, quiz, exam, etc.
    deadline: Optional[datetime] = None
    source_url: Optional[str] = None


@dataclass
class LMSSyncResult:
    """Result of a sync operation."""
    courses: List[LMSCourse] = field(default_factory=list)
    tasks: List[LMSTask] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)
    success: bool = True


class BaseLMSAdapter(ABC):
    """
    Abstract base class for LMS adapters.
    
    Every LMS integration (custom scraper, official API, etc.)
    must implement these methods.
    """

    @abstractmethod
    async def authenticate(self, url: str, username: str, password: str) -> bool:
        """
        Authenticate with the LMS.
        
        Returns True if authentication succeeded.
        Must NOT bypass CAPTCHA, MFA, or security controls.
        """
        ...

    @abstractmethod
    async def fetch_courses(self) -> List[LMSCourse]:
        """
        Fetch the student's enrolled courses/subjects.
        
        Must only return courses the authenticated student has access to.
        """
        ...

    @abstractmethod
    async def fetch_tasks(self) -> List[LMSTask]:
        """
        Fetch all tasks (assignments, quizzes, exams, etc.) from the LMS.
        
        Must only return tasks the authenticated student can access.
        Each task must have a unique source_id for duplicate detection.
        """
        ...

    @abstractmethod
    async def close(self) -> None:
        """Clean up resources (HTTP sessions, etc.)."""
        ...

    async def fetch_all(self) -> LMSSyncResult:
        """
        Convenience method: fetch courses and tasks in one call.
        
        Returns a normalized LMSSyncResult.
        """
        result = LMSSyncResult()
        try:
            result.courses = await self.fetch_courses()
            result.tasks = await self.fetch_tasks()
        except Exception as e:
            result.success = False
            result.errors.append(str(e))
        return result
