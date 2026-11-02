from fastapi.testclient import TestClient

from moreai_api.auth import require_authenticated_user
from moreai_api.main import app

client = TestClient(app)


def setup_function() -> None:
    app.dependency_overrides[require_authenticated_user] = lambda: {
        "sub": "00000000-0000-0000-0000-000000000001",
        "app_metadata": {"role": "super_admin"},
    }


def teardown_function() -> None:
    app.dependency_overrides.pop(require_authenticated_user, None)


def test_partner_endpoint_fails_closed_without_server_database(monkeypatch):
    from moreai_api import db
    monkeypatch.setattr(db.settings, "supabase_secret_key", None)
    response = client.get("/api/v1/partner/branches")
    assert response.status_code == 503
    assert response.json()["detail"]["code"] == "DATABASE_NOT_CONFIGURED"


def test_partner_location_membership_cannot_read_another_location(monkeypatch):
    from moreai_api.routers import partner

    async def scoped_rows(table, query):
        if table == "partner_members":
            return [{"id": "m1", "partner_id": "p1", "location_id": "l1", "role_key": "viewer", "status": "active"}]
        if table == "partner_locations":
            return [
                {"id": "l1", "partner_id": "p1", "name": "Branch One"},
                {"id": "l2", "partner_id": "p1", "name": "Branch Two"},
            ]
        return []

    monkeypatch.setattr(partner, "select_rows", scoped_rows)
    response = client.get("/api/v1/partner/branches")
    assert response.status_code == 200
    assert [row["id"] for row in response.json()["items"]] == ["l1"]


def test_partner_requires_active_membership(monkeypatch):
    from moreai_api.routers import partner

    async def no_membership(*args, **kwargs):
        return []

    monkeypatch.setattr(partner, "select_rows", no_membership)
    response = client.get("/api/v1/partner/branches")
    assert response.status_code == 403
    assert response.json()["detail"]["code"] == "PARTNER_MEMBERSHIP_REQUIRED"


def test_network_access_does_not_claim_gateway_success():
    response = client.post("/api/v1/network/access/verify", json={"network_id": "test-network", "verification_method": "gateway"})
    assert response.status_code == 503
    assert response.json()["detail"]["code"] == "NETWORK_GATEWAY_NOT_CONFIGURED"


def test_admin_endpoint_uses_database_role_assignments(monkeypatch):
    from moreai_api.routers import admin

    async def no_assignments(*args, **kwargs):
        return []

    monkeypatch.setattr(admin, "select_rows", no_assignments)
    response = client.get("/api/v1/admin/overview")
    assert response.status_code == 403
    assert response.json()["detail"]["code"] == "ADMIN_PERMISSION_REQUIRED"


def test_client_app_metadata_role_does_not_grant_admin(monkeypatch):
    from moreai_api.routers import admin

    app.dependency_overrides[require_authenticated_user] = lambda: {
        "sub": "00000000-0000-0000-0000-000000000001",
        "app_metadata": {"role": "super_admin"},
    }

    async def no_assignments(*args, **kwargs):
        return []

    monkeypatch.setattr(admin, "select_rows", no_assignments)
    response = client.get("/api/v1/admin/overview")
    assert response.status_code == 403


def test_credit_reservation_requires_idempotency_key():
    response = client.post("/api/v1/credits/reservations", json={"amount": 1})
    assert response.status_code == 400
    assert response.json()["detail"]["code"] == "IDEMPOTENCY_KEY_REQUIRED"


def test_agent_cancel_rpc_is_scoped_to_authenticated_owner(monkeypatch):
    from moreai_api.routers import agents

    calls = []

    async def capture_rpc(name, payload):
        calls.append((name, payload))
        return {"run_id": payload["p_run_id"], "status": "cancel_requested"}

    monkeypatch.setattr(agents, "rpc", capture_rpc)
    response = client.post("/api/v1/agents/runs/00000000-0000-0000-0000-000000000002/cancel")
    assert response.status_code == 200
    assert calls[0][1]["p_user_id"] == "00000000-0000-0000-0000-000000000001"
