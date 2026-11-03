from fastapi.testclient import TestClient

from moreai_api.auth import require_authenticated_user
from moreai_api.main import app

client = TestClient(app)
USER_ID = "00000000-0000-0000-0000-000000000001"


def setup_function() -> None:
    app.dependency_overrides[require_authenticated_user] = lambda: {"sub": USER_ID}


def teardown_function() -> None:
    app.dependency_overrides.pop(require_authenticated_user, None)


def test_partner_onboarding_status_reports_not_submitted(monkeypatch):
    from moreai_api.routers import partner

    async def rows(table, query):
        assert table == "partner_members"
        return []

    monkeypatch.setattr(partner, "select_rows", rows)
    response = client.get("/api/v1/partner/onboarding")
    assert response.status_code == 200
    assert response.json()["status"] == "not_submitted"


def test_partner_application_uses_atomic_rpc(monkeypatch):
    from moreai_api.routers import partner

    async def call(name, payload):
        assert name == "moreai_submit_partner_application"
        assert payload["p_user_id"] == USER_ID
        assert payload["p_legal_name"] == "PT Contoh Legal"
        return {"partner": {"id": "partner-1", "status": "pending"}, "membership": {"role_key": "partner_owner"}, "replayed": False}

    monkeypatch.setattr(partner, "rpc", call)
    response = client.post(
        "/api/v1/partner/onboarding",
        headers={"X-Correlation-ID": "test-correlation-01"},
        json={"legal_name": "PT Contoh Legal", "display_name": "Contoh Brand"},
    )
    assert response.status_code == 201
    assert response.json()["application"]["partner"]["status"] == "pending"
