from fastapi.testclient import TestClient

from moreai_api.auth import require_authenticated_user
from moreai_api.main import app

client = TestClient(app)


def test_agent_run_requires_idempotency_key():
    app.dependency_overrides[require_authenticated_user] = lambda: {
        "sub": "00000000-0000-0000-0000-000000000001"
    }
    try:
        response = client.post("/api/v1/agents/runs", json={"prompt": "test"})
        assert response.status_code == 400
        assert response.json()["detail"]["code"] == "IDEMPOTENCY_KEY_REQUIRED"
    finally:
        app.dependency_overrides.pop(require_authenticated_user, None)


def test_agent_run_requires_authentication():
    response = client.get("/api/v1/agents/runs")
    assert response.status_code == 401
