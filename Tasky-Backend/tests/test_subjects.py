"""
Tasky Backend — Subjects API Tests
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_and_list_subjects(client: AsyncClient, auth_headers: dict):
    """Test creating a new academic subject and fetching subjects list."""
    payload = {
        "name": "Mobile Application Development",
        "code": "MAD-301",
        "color": "#3B82F6",
    }
    create_res = await client.post("/api/subjects", json=payload, headers=auth_headers)
    assert create_res.status_code == 201
    data = create_res.json()
    assert data["name"] == payload["name"]
    assert data["code"] == payload["code"]
    assert "id" in data

    # List subjects
    list_res = await client.get("/api/subjects", headers=auth_headers)
    assert list_res.status_code == 200
    subjects = list_res.json()
    assert len(subjects) >= 1
    assert any(s["code"] == "MAD-301" for s in subjects)


@pytest.mark.asyncio
async def test_update_and_delete_subject(client: AsyncClient, auth_headers: dict):
    """Test updating and deleting an existing subject."""
    create_res = await client.post(
        "/api/subjects",
        json={"name": "Old Subject", "code": "OLD-101", "color": "#10B981"},
        headers=auth_headers,
    )
    subject_id = create_res.json()["id"]

    # Update subject
    update_res = await client.put(
        f"/api/subjects/{subject_id}",
        json={"name": "Updated Subject Name"},
        headers=auth_headers,
    )
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Updated Subject Name"

    # Delete subject
    del_res = await client.delete(f"/api/subjects/{subject_id}", headers=auth_headers)
    assert del_res.status_code == 204
