from fastapi.testclient import TestClient

from moreai_api.auth import require_authenticated_user
from moreai_api.main import app

client = TestClient(app)


def setup_function() -> None:
    app.dependency_overrides[require_authenticated_user] = lambda: {"sub": "test-user", "app_metadata": {}}


def teardown_function() -> None:
    app.dependency_overrides.pop(require_authenticated_user, None)


def test_partner_endpoints_fail_closed_without_domain_persistence() -> None:
    response = client.get("/api/v1/partner/branches")
    assert response.status_code == 503
    assert response.json()["detail"]["code"] == "PARTNER_DOMAIN_NOT_CONFIGURED"


def test_network_access_does_not_claim_gateway_success() -> None:
    response = client.post(
        "/api/v1/network/access/verify",
        json={"network_id": "test-network", "verification_method": "gateway"},
    )
    assert response.status_code == 503
    assert response.json()["detail"]["code"] == "NETWORK_GATEWAY_NOT_CONFIGURED"


def test_admin_endpoint_requires_server_controlled_admin_role() -> None:
    response = client.get("/api/v1/admin/overview")
    assert response.status_code == 403
