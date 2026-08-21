from __future__ import annotations

import logging
import re
from datetime import datetime
from typing import List, Optional
from urllib.parse import urljoin

import httpx
from bs4 import BeautifulSoup

from app.lms.base import BaseLMSAdapter, LMSCourse, LMSTask

logger = logging.getLogger(__name__)


class CustomLMSAdapter(BaseLMSAdapter):
    """
    Adapter for the SMCC Nasipit School LMS (https://my.smccnasipit.edu.ph).
    
    Handles:
    - CodeIgniter session authentication via POST /login/authenticate
    - Enrolled classes from /my_classes
    - Assignments from /assignment/index/
    - Projects from /project/index/
    - Quizzes from /quiz/index
    - Oral recitations from /oral_recitation/index/
    - Forums / announcements from /forum/index/
    """

    def __init__(self):
        self._client: Optional[httpx.AsyncClient] = None
        self._authenticated: bool = False
        self._base_url: str = "https://my.smccnasipit.edu.ph"
        self._user_data: dict = {}

    async def authenticate(self, url: str, username: str, password: str) -> bool:
        """
        Authenticate with the SMCC Nasipit LMS via AJAX POST to /login/authenticate.
        
        Payload: idno (username/student ID), pswd (password)
        """
        self._base_url = url.rstrip("/")
        self._client = httpx.AsyncClient(
            follow_redirects=True,
            timeout=30.0,
            verify=False,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "X-Requested-With": "XMLHttpRequest",
                "Referer": f"{self._base_url}/login",
                "Origin": self._base_url,
            },
        )

        try:
            # CodeIgniter AJAX endpoint
            login_url = f"{self._base_url}/login/authenticate"
            payload = {
                "idno": username.strip(),
                "pswd": password.strip(),
            }

            response = await self._client.post(login_url, data=payload)

            if response.status_code == 200:
                try:
                    data = response.json()
                    if data.get("success") is True or data.get("status") == "success":
                        self._authenticated = True
                        self._user_data = data.get("data", {})
                        logger.info(f"LMS authentication successful for student ID: {username}")
                        return True
                    else:
                        logger.warning(f"LMS authentication rejected: {data.get('message', 'Unknown error')}")
                        return False
                except Exception:
                    # Non-JSON response, check for redirect / session cookie
                    if "ci_session" in self._client.cookies:
                        self._authenticated = True
                        return True
                    return False
            else:
                logger.warning(f"LMS login returned HTTP {response.status_code}")
                return False

        except httpx.HTTPError as e:
            logger.error(f"LMS connection error during authentication: {str(e)}")
            return False

    async def fetch_courses(self) -> List[LMSCourse]:
        """
        Fetch enrolled classes from /my_classes.
        """
        if not self._authenticated or not self._client:
            raise RuntimeError("Not authenticated with LMS")

        courses: List[LMSCourse] = []

        try:
            courses_url = f"{self._base_url}/my_classes"
            response = await self._client.get(courses_url)

            if response.status_code != 200:
                logger.warning(f"Failed to fetch classes: HTTP {response.status_code}")
                return courses

            soup = BeautifulSoup(response.text, "lxml")

            # Look for class cards, tables, or course links
            for item in soup.select(".card, .course-item, table tbody tr, .class-card, .list-group-item"):
                name_elem = item.select_one(".card-title, .title, .course-name, h4, h5, td:nth-child(2)")
                code_elem = item.select_one(".card-subtitle, .code, .course-code, small, td:nth-child(1)")

                if name_elem:
                    course_name = name_elem.get_text(strip=True)
                    course_code = code_elem.get_text(strip=True) if code_elem else None
                    course_id = item.get("data-id") or item.get("id") or (course_code or course_name)

                    if course_name and not any(c.name == course_name for c in courses):
                        courses.append(LMSCourse(
                            id=str(course_id),
                            name=course_name,
                            code=course_code,
                        ))

            logger.info(f"Fetched {len(courses)} courses from LMS")

        except Exception as e:
            logger.error(f"Error fetching LMS courses: {str(e)}")

        return courses

    async def fetch_tasks(self) -> List[LMSTask]:
        """
        Fetch all academic tasks across all SMCC Nasipit LMS sections:
        - Assignments: /assignment/index/
        - Projects: /project/index/
        - Quizzes: /quiz/index
        - Oral Recitations: /oral_recitation/index/
        - Forums: /forum/index/
        """
        if not self._authenticated or not self._client:
            raise RuntimeError("Not authenticated with LMS")

        tasks: List[LMSTask] = []

        endpoints = [
            ("/assignment/index/", "assignment"),
            ("/project/index/", "project"),
            ("/quiz/index", "quiz"),
            ("/oral_recitation/index/", "activity"),
            ("/forum/index/", "other"),
        ]

        for path, default_type in endpoints:
            try:
                endpoint_url = f"{self._base_url}{path}"
                response = await self._client.get(endpoint_url)

                if response.status_code != 200:
                    continue

                soup = BeautifulSoup(response.text, "lxml")
                extracted = self._parse_items_page(soup, endpoint_url, default_type)
                tasks.extend(extracted)

            except Exception as e:
                logger.error(f"Error fetching from {path}: {str(e)}")

        logger.info(f"Total LMS items fetched across all categories: {len(tasks)}")
        return tasks

    def _parse_items_page(self, soup: BeautifulSoup, page_url: str, default_type: str) -> List[LMSTask]:
        """Extract task items from an LMS listing page (table rows or cards)."""
        tasks: List[LMSTask] = []

        # 1. Parse standard HTML table rows
        rows = soup.select("table tbody tr")
        for idx, row in enumerate(rows):
            cols = row.find_all("td")
            if len(cols) >= 2:
                title_col = cols[1] if len(cols) > 2 else cols[0]
                title = title_col.get_text(strip=True)
                
                course = cols[0].get_text(strip=True) if len(cols) > 2 else "General"
                deadline_text = cols[-1].get_text(strip=True) if len(cols) >= 3 else ""

                link = title_col.find("a") or row.find("a")
                raw_href = str(link.get("href") or "") if link else ""
                source_url = urljoin(page_url, raw_href) if raw_href else page_url

                # Generate deterministic source_id from URL or title + index
                clean_key = re.sub(r'[^a-zA-Z0-9]', '', raw_href or f'{title}_{idx}')
                source_id = f"{default_type}-{clean_key}"

                if title and len(title) > 1:
                    tasks.append(LMSTask(
                        source_id=source_id,
                        title=title,
                        course_name=course,
                        task_type=self._detect_task_type(title, default_type),
                        deadline=self._parse_deadline(deadline_text),
                        source_url=source_url,
                    ))

        # 2. Parse card / list layouts if no table rows found
        if not tasks:
            for idx, item in enumerate(soup.select(".card, .list-group-item, .post, .announcement")):
                title_elem = item.select_one(".card-title, h4, h5, .title, strong")
                if not title_elem:
                    continue

                title = title_elem.get_text(strip=True)
                desc_elem = item.select_one(".card-text, .description, p")
                description = desc_elem.get_text(strip=True) if desc_elem else None
                
                date_elem = item.select_one(".date, .due, .deadline, time, small")
                deadline_text = date_elem.get_text(strip=True) if date_elem else ""

                link = item.find("a")
                raw_href = str(link.get("href") or "") if link else ""
                source_url = urljoin(page_url, raw_href) if raw_href else page_url

                clean_key = re.sub(r'[^a-zA-Z0-9]', '', raw_href or f'{title}_{idx}')
                source_id = f"{default_type}-{clean_key}"

                tasks.append(LMSTask(
                    source_id=source_id,
                    title=title,
                    course_name="General",
                    description=description,
                    task_type=self._detect_task_type(title, default_type),
                    deadline=self._parse_deadline(deadline_text),
                    source_url=source_url,
                ))

        return tasks


    async def close(self) -> None:
        """Close the HTTP client."""
        if self._client:
            await self._client.aclose()
            self._client = None
            self._authenticated = False

    @staticmethod
    def _detect_task_type(title: str, fallback_type: str = "other") -> str:
        """Detect task type from title keywords or fallback."""
        title_lower = title.lower()
        if "quiz" in title_lower:
            return "quiz"
        elif any(k in title_lower for k in ["exam", "midterm", "final"]):
            return "exam"
        elif any(k in title_lower for k in ["performance task", "pt"]):
            return "performance_task"
        elif "project" in title_lower:
            return "project"
        elif any(k in title_lower for k in ["activity", "recitation", "oral"]):
            return "activity"
        elif any(k in title_lower for k in ["assignment", "homework", "hw"]):
            return "assignment"
        return fallback_type

    @staticmethod
    def _parse_deadline(text: str) -> Optional[datetime]:
        """Attempt to parse date/time strings from LMS."""
        if not text:
            return None
        formats = [
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%d %H:%M",
            "%B %d, %Y %I:%M %p",
            "%b %d, %Y %I:%M %p",
            "%m/%d/%Y %I:%M %p",
            "%m/%d/%Y %H:%M",
            "%Y-%m-%d",
            "%B %d, %Y",
            "%b %d, %Y",
        ]
        # Clean text
        clean = re.sub(r'(Due|Deadline|Date|Posted):\s*', '', text, flags=re.IGNORECASE).strip()
        for fmt in formats:
            try:
                return datetime.strptime(clean, fmt)
            except ValueError:
                continue
        return None

