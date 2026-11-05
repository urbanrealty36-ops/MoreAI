from fastapi import HTTPException
from fastapi.testclient import TestClient

from moreai_api.auth import require_authenticated_user
from moreai_api.main import app

client = TestClient(app)
USER_ID = "00000000-0000-0000-0000-000000000001"
AGENT_ID = "00000000-0000-0000-0000-000000000099"


def setup_function() -> None:
    app.dependency_overrides[require_authenticated_user] = lambda: {"sub": USER_ID}


def teardown_function() -> None:
    app.dependency_overrides.pop(require_authenticated_user, None)


def test_agent_run_requires_idempotency_key():
    response = client.post("/api/v1/agents/runs", json={"prompt": "test"})
    assert response.status_code == 400
    assert response.json()["detail"]["code"] == "IDEMPOTENCY_KEY_REQUIRED"


def test_agent_run_rejects_unsafe_idempotency_key():
    response = client.post(
        "/api/v1/agents/runs",
        headers={"Idempotency-Key": "valid-key&user_id=eq.other"},
        json={"prompt": "test"},
    )
    assert response.status_code == 400


def test_agent_run_requires_authentication():
    app.dependency_overrides.pop(require_authenticated_user, None)
    response = client.get("/api/v1/agents/runs")
    assert response.status_code == 401


def _existing_run(prompt: str) -> dict:
    return {
        "id": "00000000-0000-0000-0000-000000000002",
        "status": "queued",
        "input": {"prompt": prompt},
        "workspace_id": None,
        "conversation_id": None,
        "agent_definition_id": AGENT_ID,
        "max_attempts": 3,
        "created_at": "2026-11-02T00:00:00Z",
    }


def test_agent_run_replays_same_idempotency_payload(monkeypatch):
    from moreai_api.routers import agents

    async def rows(table, query):
        if table == "agent_definitions":
            return [{"id": AGENT_ID, "key": "manus", "enabled": True}]
        if table == "agent_runs":
            return [_existing_run("research this")]
        return []

    monkeypatch.setattr(agents, "select_rows", rows)
    response = client.post(
        "/api/v1/agents/runs",
        headers={"Idempotency-Key": "research-task-001"},
        json={"prompt": "research this"},
    )
    assert response.status_code == 202
    assert response.json()["replayed"] is True
    assert response.json()["run"]["id"] == _existing_run("research this")["id"]


def test_agent_run_rejects_reused_key_with_different_payload(monkeypatch):
    from moreai_api.routers import agents

    async def rows(table, query):
        if table == "agent_definitions":
            return [{"id": AGENT_ID, "key": "manus", "enabled": True}]
        if table == "agent_runs":
            return [_existing_run("original prompt")]
        return []

    monkeypatch.setattr(agents, "select_rows", rows)
    response = client.post(
        "/api/v1/agents/runs",
        headers={"Idempotency-Key": "research-task-002"},
        json={"prompt": "different prompt"},
    )
    assert response.status_code == 409
    assert response.json()["detail"]["code"] == "IDEMPOTENCY_KEY_REUSED"


def test_agent_run_recovers_concurrent_unique_conflict(monkeypatch):
    from moreai_api.routers import agents

    run = _existing_run("race safe prompt")
    calls = {"runs": 0}

    async def rows(table, query):
        if table == "agent_definitions":
            return [{"id": AGENT_ID, "key": "manus", "enabled": True}]
        if table == "agent_runs":
            calls["runs"] += 1
            return [] if calls["runs"] == 1 else [run]
        return []

    async def insert(table, payload):
        raise HTTPException(status_code=502, detail="unique constraint conflict")

    monkeypatch.setattr(agents, "select_rows", rows)
    monkeypatch.setattr(agents, "insert_rows", insert)
    response = client.post(
        "/api/v1/agents/runs",
        headers={"Idempotency-Key": "research-task-003"},
        json={"prompt": "race safe prompt"},
    )
    assert response.status_code == 202
    assert response.json()["replayed"] is True
    assert calls["runs"] == 2
