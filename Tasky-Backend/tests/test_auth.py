"""
Tasky Backend — Authentication & User API Tests
"""

import pytest
from httpx import AsyncClient
from app.models.user import User


@pytest.mark.asyncio
async def test_register_user_success(client: AsyncClient):
    """Test successful user registration."""
    payload = {
        "name": "Jane Doe",
        "email": "jane.doe@school.edu",
        "password": "securepassword123",
    }
    response = await client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient, test_user: User):
    """Test registration failure on existing duplicate email."""
    payload = {
        "name": "Duplicate Student",
        "email": test_user.email,
        "password": "somepassword",
    }
    response = await client.post("/api/auth/register", json=payload)
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, test_user: User):
    """Test successful login with correct email and password."""
    payload = {
        "email": test_user.email,
        "password": "password123",
    }
    response = await client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_login_invalid_password(client: AsyncClient, test_user: User):
    """Test login failure with incorrect password."""
    payload = {
        "email": test_user.email,
        "password": "wrongpassword",
    }
    response = await client.post("/api/auth/login", json=payload)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_current_user_profile(client: AsyncClient, auth_headers: dict, test_user: User):
    """Test GET /api/auth/me returns current authenticated user profile."""
    response = await client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user.email
    assert data["name"] == test_user.name
    assert data["id"] == test_user.id


@pytest.mark.asyncio
async def test_get_current_user_unauthorized(client: AsyncClient):
    """Test GET /api/auth/me without token returns 401."""
    response = await client.get("/api/auth/me")
    assert response.status_code == 401
