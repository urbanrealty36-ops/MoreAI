from fastapi.testclient import TestClient

from moreai_api.auth import require_authenticated_user
from moreai_api.main import app

client = TestClient(app)
USER_ID = "00000000-0000-0000-0000-000000000001"
PARTNER_ID = "00000000-0000-0000-0000-000000000002"


def setup_function() -> None:
    app.dependency_overrides[require_authenticated_user] = lambda: {"sub": USER_ID}


def teardown_function() -> None:
    app.dependency_overrides.pop(require_authenticated_user, None)


def test_partner_review_calls_atomic_rpc(monkeypatch):
    from moreai_api.routers import admin

    async def allow(*args, **kwargs):
        return None

    async def call(name, payload):
        assert name == "moreai_admin_review_partner"
        assert payload["p_actor_user_id"] == USER_ID
        assert payload["p_partner_id"] == PARTNER_ID
        assert payload["p_decision"] == "approve"
        return {"partner": {"id": PARTNER_ID, "status": "active"}, "replayed": False}

    monkeypatch.setattr(admin, "_require_permission", allow)
    monkeypatch.setattr(admin, "rpc", call)
    response = client.post(
        f"/api/v1/admin/partners/{PARTNER_ID}/review",
        headers={"X-Correlation-ID": "test-review-01"},
        json={"decision": "approve"},
    )
    assert response.status_code == 200
    assert response.json()["partner"]["status"] == "active"
