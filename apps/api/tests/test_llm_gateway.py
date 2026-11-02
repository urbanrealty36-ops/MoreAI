from fastapi.testclient import TestClient

from moreai_api.auth import require_authenticated_user
from moreai_api.main import app

client = TestClient(app)


def test_llm_requires_bearer_token() -> None:
    response = client.post("/api/v1/llm/generate", json={"prompt": "hello"})
    assert response.status_code == 401


def test_llm_requires_idempotency_key_before_provider_call(monkeypatch) -> None:
    app.dependency_overrides[require_authenticated_user] = lambda: {"sub": "00000000-0000-0000-0000-000000000001"}
    try:
        response = client.post("/api/v1/llm/generate", json={"prompt": "hello"})
        assert response.status_code == 400
        assert response.json()["detail"]["code"] == "IDEMPOTENCY_KEY_REQUIRED"
    finally:
        app.dependency_overrides.pop(require_authenticated_user, None)


def test_llm_fails_closed_without_credit_conversion(monkeypatch) -> None:
    app.dependency_overrides[require_authenticated_user] = lambda: {"sub": "00000000-0000-0000-0000-000000000001"}
    monkeypatch.setattr("moreai_api.settings.settings.credits_per_usd", None)
    try:
        response = client.post("/api/v1/llm/generate", headers={"Idempotency-Key": "test-1"}, json={"prompt": "hello"})
        assert response.status_code == 503
        assert response.json()["detail"]["code"] == "CREDIT_CONVERSION_NOT_CONFIGURED"
    finally:
        app.dependency_overrides.pop(require_authenticated_user, None)
