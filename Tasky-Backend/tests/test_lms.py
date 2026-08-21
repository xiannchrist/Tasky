"""
Tasky Backend — LMS & Devices API Tests
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_lms_status_unconnected(client: AsyncClient, auth_headers: dict):
    """Test LMS status when no connection has been set up."""
    response = await client.get("/api/lms/status", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["connected"] is False


@pytest.mark.asyncio
async def test_lms_connect_and_disconnect(client: AsyncClient, auth_headers: dict):
    """Test connecting school LMS credentials and subsequent disconnection."""
    payload = {
        "lms_url": "https://lms.school.edu",
        "lms_username": "2026-10492",
        "lms_password": "studentpassword",
    }
    connect_res = await client.post("/api/lms/connect", json=payload, headers=auth_headers)
    assert connect_res.status_code in (200, 201)
    data = connect_res.json()
    assert data["connected"] is True
    assert data["lms_username"] == "2026-10492"

    # Check status
    status_res = await client.get("/api/lms/status", headers=auth_headers)
    assert status_res.status_code == 200
    assert status_res.json()["connected"] is True

    # Disconnect
    disconnect_res = await client.delete("/api/lms/disconnect", headers=auth_headers)
    assert disconnect_res.status_code in (200, 204)


@pytest.mark.asyncio
async def test_register_device_token(client: AsyncClient, auth_headers: dict):
    """Test registering a mobile push notification token."""
    payload = {
        "push_token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
        "platform": "android",
        "device_name": "Pixel 7",
    }
    res = await client.post("/api/devices/register", json=payload, headers=auth_headers)
    assert res.status_code in (200, 201)
    data = res.json()
    assert data["push_token"] == payload["push_token"]
    assert data["platform"] == "android"
