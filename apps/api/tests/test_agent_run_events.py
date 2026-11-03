from fastapi.testclient import TestClient

from moreai_api.auth import require_authenticated_user
from moreai_api.main import app

client = TestClient(app)
USER_ID = "00000000-0000-0000-0000-000000000001"
RUN_ID = "00000000-0000-0000-0000-000000000002"


def setup_function() -> None:
    app.dependency_overrides[require_authenticated_user] = lambda: {"sub": USER_ID}


def teardown_function() -> None:
    app.dependency_overrides.pop(require_authenticated_user, None)


def test_run_events_are_owner_scoped_and_payload_is_allowlisted(monkeypatch):
    from moreai_api.routers import agents

    async def rows(table, query):
        if table == "agent_runs":
            return [{"id": RUN_ID}]
        if table == "agent_run_events":
            return [{
                "id": "event-1",
                "event_type": "tool.completed",
                "sequence": 1,
                "created_at": "2026-11-03T00:00:00Z",
                "payload": {"tool_key": "search", "status": "succeeded", "api_key": "must-not-leak"},
            }]
        return []

    monkeypatch.setattr(agents, "select_rows", rows)
    response = client.get(f"/api/v1/agents/runs/{RUN_ID}/events")
    assert response.status_code == 200
    payload = response.json()["items"][0]["payload"]
    assert payload == {"tool_key": "search", "status": "succeeded"}


def test_run_events_hide_non_owned_run(monkeypatch):
    from moreai_api.routers import agents

    async def rows(table, query):
        if table == "agent_runs":
            return []
        raise AssertionError("events must not be queried for a non-owned run")

    monkeypatch.setattr(agents, "select_rows", rows)
    response = client.get(f"/api/v1/agents/runs/{RUN_ID}/events")
    assert response.status_code == 404
    assert response.json()["detail"]["code"] == "RUN_NOT_FOUND"
