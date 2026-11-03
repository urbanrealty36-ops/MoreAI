from fastapi.testclient import TestClient

from moreai_api.auth import require_authenticated_user
from moreai_api.main import app

client = TestClient(app)
USER_ID = "00000000-0000-0000-0000-000000000001"
TARGET_ID = "00000000-0000-0000-0000-000000000002"
ASSIGNMENT_ID = "00000000-0000-0000-0000-000000000003"


def setup_function() -> None:
    app.dependency_overrides[require_authenticated_user] = lambda: {"sub": USER_ID}


def teardown_function() -> None:
    app.dependency_overrides.pop(require_authenticated_user, None)


def test_platform_role_assignment_uses_atomic_rpc(monkeypatch):
    from moreai_api.routers import admin

    async def allow(*args, **kwargs):
        return None

    async def call(name, payload):
        assert name == "moreai_admin_assign_platform_role"
        assert payload["p_actor_user_id"] == USER_ID
        assert payload["p_target_user_id"] == TARGET_ID
        assert payload["p_role_key"] == "support_admin"
        return {"assignment": {"id": ASSIGNMENT_ID}, "role_key": "support_admin", "replayed": False}

    monkeypatch.setattr(admin, "_require_permission", allow)
    monkeypatch.setattr(admin, "rpc", call)
    response = client.post(
        "/api/v1/admin/role-assignments",
        json={"target_user_id": TARGET_ID, "role_key": "support_admin"},
    )
    assert response.status_code == 201
    assert response.json()["role_key"] == "support_admin"


def test_role_assignment_requires_timezone_aware_expiry(monkeypatch):
    from moreai_api.routers import admin

    async def allow(*args, **kwargs):
        return None

    monkeypatch.setattr(admin, "_require_permission", allow)
    response = client.post(
        "/api/v1/admin/role-assignments",
        json={
            "target_user_id": TARGET_ID,
            "role_key": "support_admin",
            "expires_at": "2026-12-01T12:00:00",
        },
    )
    assert response.status_code == 422
    assert response.json()["detail"]["code"] == "ROLE_EXPIRY_TIMEZONE_REQUIRED"
