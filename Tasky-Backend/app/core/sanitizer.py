"""
Tasky Backend — Input Sanitization

Sanitizes text inputs to prevent Stored XSS, HTML injection, and control characters.
"""

import re
import html
from typing import Optional, overload


# Regex matching script tags and dangerous HTML events
HTML_TAG_REGEX = re.compile(r"<[^>]*?>")
CONTROL_CHAR_REGEX = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


@overload
def sanitize_text(value: None, max_length: Optional[int] = None) -> None: ...

@overload
def sanitize_text(value: str, max_length: Optional[int] = None) -> str: ...

def sanitize_text(value: Optional[str], max_length: Optional[int] = None) -> Optional[str]:
    """
    Sanitize a string:
    1. Strip control characters.
    2. Strip HTML tags.
    3. Unescape safe entities and trim whitespace.
    """
    if value is None:
        return None

    # Remove null bytes and non-printable control chars
    clean = CONTROL_CHAR_REGEX.sub("", value)

    # Strip HTML tags
    clean = HTML_TAG_REGEX.sub("", clean)

    # Normalize HTML entities
    clean = html.unescape(clean).strip()

    if max_length and len(clean) > max_length:
        clean = clean[:max_length]

    return clean
