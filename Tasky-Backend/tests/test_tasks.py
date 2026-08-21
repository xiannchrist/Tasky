"""
Tasky Backend — Tasks API Tests
"""

import pytest
from httpx import AsyncClient
from datetime import datetime, timezone, timedelta


@pytest.mark.asyncio
async def test_create_task_success(client: AsyncClient, auth_headers: dict):
    """Test creating a new academic task."""
    deadline = (datetime.now(timezone.utc) + timedelta(days=3)).isoformat()
    payload = {
        "title": "Database Project Milestone 1",
        "description": "Submit database normalization and schema diagrams.",
        "priority": "high",
        "deadline": deadline,
        "task_type": "project",
    }
    response = await client.post("/api/tasks", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == payload["title"]
    assert data["priority"] == "high"
    assert data["status"] == "pending"
    assert "id" in data


@pytest.mark.asyncio
async def test_get_tasks_list(client: AsyncClient, auth_headers: dict):
    """Test fetching task list and verify filtering."""
    # Create two tasks
    await client.post(
        "/api/tasks",
        json={"title": "Quiz 1", "priority": "high", "task_type": "quiz"},
        headers=auth_headers,
    )
    await client.post(
        "/api/tasks",
        json={"title": "Homework 1", "priority": "low", "task_type": "assignment"},
        headers=auth_headers,
    )

    response = await client.get("/api/tasks", headers=auth_headers)
    assert response.status_code == 200
    tasks = response.json()
    assert len(tasks) >= 2

    # Test priority filter
    filter_response = await client.get("/api/tasks?priority=high", headers=auth_headers)
    assert filter_response.status_code == 200
    filtered = filter_response.json()
    assert all(t["priority"] == "high" for t in filtered)


@pytest.mark.asyncio
async def test_toggle_task_completion(client: AsyncClient, auth_headers: dict):
    """Test toggling task between pending and completed."""
    create_res = await client.post(
        "/api/tasks",
        json={"title": "Toggle Test Task", "priority": "medium"},
        headers=auth_headers,
    )
    task_id = create_res.json()["id"]

    # Toggle to completed
    toggle_res1 = await client.patch(f"/api/tasks/{task_id}/toggle", headers=auth_headers)
    assert toggle_res1.status_code == 200
    assert toggle_res1.json()["status"] == "completed"

    # Toggle back to pending
    toggle_res2 = await client.patch(f"/api/tasks/{task_id}/toggle", headers=auth_headers)
    assert toggle_res2.status_code == 200
    assert toggle_res2.json()["status"] == "pending"


@pytest.mark.asyncio
async def test_delete_task(client: AsyncClient, auth_headers: dict):
    """Test task deletion."""
    create_res = await client.post(
        "/api/tasks",
        json={"title": "Task to Delete", "priority": "low"},
        headers=auth_headers,
    )
    task_id = create_res.json()["id"]

    delete_res = await client.delete(f"/api/tasks/{task_id}", headers=auth_headers)
    assert delete_res.status_code == 204

    # Verify task is no longer found
    get_res = await client.get(f"/api/tasks/{task_id}", headers=auth_headers)
    assert get_res.status_code == 404


@pytest.mark.asyncio
async def test_task_statistics(client: AsyncClient, auth_headers: dict):
    """Test task stats counter endpoint."""
    await client.post(
        "/api/tasks",
        json={"title": "Pending Task", "priority": "medium"},
        headers=auth_headers,
    )
    t2 = await client.post(
        "/api/tasks",
        json={"title": "Completed Task", "priority": "low"},
        headers=auth_headers,
    )
    await client.patch(f"/api/tasks/{t2.json()['id']}/toggle", headers=auth_headers)

    response = await client.get("/api/tasks/stats", headers=auth_headers)
    assert response.status_code == 200
    stats = response.json()
    assert stats["total"] >= 2
    assert stats["completed"] >= 1
    assert stats["pending"] >= 1
