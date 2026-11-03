from fastapi.testclient import TestClient

from moreai_api.auth import require_authenticated_user
from moreai_api.main import app

client = TestClient(app)
USER_ID = "00000000-0000-0000-0000-000000000001"


def setup_function() -> None:
    app.dependency_overrides[require_authenticated_user] = lambda: {"sub": USER_ID}


def teardown_function() -> None:
    app.dependency_overrides.pop(require_authenticated_user, None)


def test_permission_matrix_uses_persisted_role_permission_links(monkeypatch):
    from moreai_api.routers import admin

    async def allow(*args, **kwargs):
        return None

    async def rows(table, query):
        if table == "roles":
            return [{"id": "role-1", "key": "super_admin", "scope": "platform", "system_role": True}]
        if table == "permissions":
            return [{"id": "perm-1", "key": "platform.roles.read"}]
        if table == "role_permissions":
            return [{"role_id": "role-1", "permission_id": "perm-1"}]
        return []

    monkeypatch.setattr(admin, "_require_permission", allow)
    monkeypatch.setattr(admin, "select_rows", rows)
    response = client.get("/api/v1/admin/permission-matrix")
    assert response.status_code == 200
    assert response.json()["roles"][0]["permissions"] == ["platform.roles.read"]


def test_llm_routing_includes_resolved_model_metadata(monkeypatch):
    from moreai_api.routers import admin

    async def allow(*args, **kwargs):
        return None

    async def rows(table, query):
        if table == "llm_routing_policies":
            return [{"id": "route-1", "model_id": "model-1", "fallback_model_id": None, "task_type": "general"}]
        if table == "llm_models":
            return [{"id": "model-1", "key": "model-key", "display_name": "Model Display"}]
        return []

    monkeypatch.setattr(admin, "_require_permission", allow)
    monkeypatch.setattr(admin, "select_rows", rows)
    response = client.get("/api/v1/admin/llm-routing")
    assert response.status_code == 200
    assert response.json()["items"][0]["model"]["key"] == "model-key"


def test_partner_approval_queue_filters_pending_records(monkeypatch):
    from moreai_api.routers import admin

    async def allow(*args, **kwargs):
        return None

    async def rows(table, query):
        assert table == "partner_organizations"
        assert "status=eq.pending" in query
        return [{"id": "partner-1", "status": "pending"}]

    monkeypatch.setattr(admin, "_require_permission", allow)
    monkeypatch.setattr(admin, "select_rows", rows)
    response = client.get("/api/v1/admin/partners?status_filter=pending")
    assert response.status_code == 200
    assert response.json()["items"][0]["status"] == "pending"
