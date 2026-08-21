"""
Tasky Backend — Security Hardening Tests
"""

import pytest
from httpx import AsyncClient
from app.core.sanitizer import sanitize_text


@pytest.mark.asyncio
async def test_security_headers_present(client: AsyncClient):
    """Test that all API responses include standard HTTP security headers."""
    response = await client.get("/api/health")
    assert response.status_code == 200
    assert response.headers.get("x-frame-options") == "DENY"
    assert response.headers.get("x-content-type-options") == "nosniff"
    assert response.headers.get("x-xss-protection") == "1; mode=block"


def test_input_sanitizer_xss_protection():
    """Test sanitizer strips script tags and malicious HTML."""
    malicious_input = '<script>alert("XSS")</script>Database Assignment'
    clean = sanitize_text(malicious_input)
    assert clean is not None
    assert "<script>" not in clean
    assert "Database Assignment" in clean
    assert clean == 'alert("XSS")Database Assignment'


@pytest.mark.asyncio
async def test_short_password_rejected(client: AsyncClient):
    """Test registration rejects weak/short password (< 6 chars)."""
    payload = {
        "name": "Hacker Test",
        "email": "hacker@school.edu",
        "password": "123",
    }
    response = await client.post("/api/auth/register", json=payload)
    assert response.status_code == 422
