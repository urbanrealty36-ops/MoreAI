from fastapi.testclient import TestClient

from moreai_api.auth import require_authenticated_user
from moreai_api.main import app

client = TestClient(app)
USER_ID = "00000000-0000-0000-0000-000000000001"
PROVIDER_ID = "00000000-0000-0000-0000-000000000002"
MODEL_ID = "00000000-0000-0000-0000-000000000003"


def setup_function() -> None:
    app.dependency_overrides[require_authenticated_user] = lambda: {"sub": USER_ID}


def teardown_function() -> None:
    app.dependency_overrides.pop(require_authenticated_user, None)


def test_provider_creation_uses_atomic_audit_rpc_and_never_returns_secret(monkeypatch):
    from moreai_api.routers import admin

    async def allow(*args, **kwargs):
        return None

    async def call(name, payload):
        assert name == "moreai_admin_mutate_llm_provider"
        assert payload["p_enabled"] is False
        assert payload["p_credentials_ready"] is False
        return {"id": PROVIDER_ID, "key": "google", "display_name": "Google", "enabled": False}

    monkeypatch.setattr(admin, "_require_permission", allow)
    monkeypatch.setattr(admin, "rpc", call)
    monkeypatch.setattr(admin.settings, "llm_provider_api_key", None)
    response = client.post(
        "/api/v1/admin/providers", json={"key": "google", "display_name": "Google"}
    )
    assert response.status_code == 201
    assert "api_key" not in response.json()["provider"]


def test_model_create_sends_decimal_cost_as_json_safe_string(monkeypatch):
    from moreai_api.routers import admin

    async def allow(*args, **kwargs):
        return None

    async def call(name, payload):
        assert name == "moreai_admin_mutate_llm_model"
        assert payload["p_input_cost_per_million"] == "0.25"
        assert payload["p_output_cost_per_million"] == "1.5"
        return {"id": MODEL_ID, "enabled": False}

    monkeypatch.setattr(admin, "_require_permission", allow)
    monkeypatch.setattr(admin, "rpc", call)
    response = client.post(
        "/api/v1/admin/models",
        json={
            "provider_id": PROVIDER_ID,
            "key": "gemini-test",
            "display_name": "Gemini Test",
            "input_cost_per_million": "0.25",
            "output_cost_per_million": "1.5",
            "capabilities": ["general"],
        },
    )
    assert response.status_code == 201
    assert response.json()["model"]["enabled"] is False


def test_routing_create_defaults_to_disabled(monkeypatch):
    from moreai_api.routers import admin

    async def allow(*args, **kwargs):
        return None

    async def call(name, payload):
        assert name == "moreai_admin_mutate_llm_route"
        assert payload["p_enabled"] is False
        assert payload["p_task_type"] == "general"
        return {"id": "route-1", "enabled": False}

    monkeypatch.setattr(admin, "_require_permission", allow)
    monkeypatch.setattr(admin, "rpc", call)
    response = client.post("/api/v1/admin/llm-routing", json={"model_id": MODEL_ID})
    assert response.status_code == 201
    assert response.json()["policy"]["enabled"] is False
