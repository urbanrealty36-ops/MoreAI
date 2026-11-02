from fastapi.testclient import TestClient

from moreai_api.auth import require_authenticated_user
from moreai_api.main import app

client = TestClient(app)


def setup_function() -> None:
    app.dependency_overrides[require_authenticated_user] = lambda: {"sub": "test-user", "app_metadata": {}}


def teardown_function() -> None:
    app.dependency_overrides.pop(require_authenticated_user, None)


def test_partner_endpoint_fails_closed_without_server_database(monkeypatch) -> None:
    from moreai_api import db
    monkeypatch.setattr(db.settings, "supabase_secret_key", None)
    response = client.get("/api/v1/partner/branches")
    assert response.status_code == 503
    assert response.json()["detail"]["code"] == "DATABASE_NOT_CONFIGURED"


def test_network_access_does_not_claim_gateway_success() -> None:
    response = client.post("/api/v1/network/access/verify", json={"network_id": "test-network", "verification_method": "gateway"})
    assert response.status_code == 503
    assert response.json()["detail"]["code"] == "NETWORK_GATEWAY_NOT_CONFIGURED"


def test_admin_endpoint_uses_database_role_assignments(monkeypatch) -> None:
    from moreai_api.routers import admin

    async def no_assignments(*args, **kwargs):
        return []

    monkeypatch.setattr(admin, "select_rows", no_assignments)
    response = client.get("/api/v1/admin/overview")
    assert response.status_code == 403
    assert response.json()["detail"]["code"] == "ADMIN_PERMISSION_REQUIRED"


def test_credit_reservation_requires_idempotency_key() -> None:
    response = client.post("/api/v1/credits/reservations", json={"amount": 1})
    assert response.status_code == 400
    assert response.json()["detail"]["code"] == "IDEMPOTENCY_KEY_REQUIRED"
