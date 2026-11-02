from fastapi.testclient import TestClient

from moreai_api.auth import require_authenticated_user
from moreai_api.main import app

client = TestClient(app)


def test_llm_requires_bearer_token() -> None:
    response = client.post("/api/v1/llm/generate", json={"prompt": "hello"})
    assert response.status_code == 401
    assert response.json()["detail"] == "Authentication required"


def test_llm_rejects_invalid_model_identifier(monkeypatch) -> None:
    app.dependency_overrides[require_authenticated_user] = lambda: {"sub": "test-user"}
    monkeypatch.setattr("moreai_api.settings.settings.llm_provider_api_key", "test-only-key")
    try:
        response = client.post(
            "/api/v1/llm/generate",
            json={"prompt": "hello", "model": "https://attacker.invalid"},
        )
        assert response.status_code == 422
    finally:
        app.dependency_overrides.pop(require_authenticated_user, None)
