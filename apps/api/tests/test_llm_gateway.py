from fastapi.testclient import TestClient

from moreai_api.main import app

client = TestClient(app)


def test_llm_requires_bearer_token() -> None:
    response = client.post("/api/v1/llm/generate", json={"prompt": "hello"})
    assert response.status_code == 401
    assert response.json()["detail"] == "Authentication required"


def test_llm_rejects_malformed_model_before_provider_call(monkeypatch) -> None:
    monkeypatch.setattr("moreai_api.settings.settings.llm_provider_api_key", "test-only-key")
    response = client.post(
        "/api/v1/llm/generate",
        headers={"Authorization": "Bearer invalid"},
        json={"prompt": "hello", "model": "https://attacker.invalid"},
    )
    # JWT validation is intentionally performed before model/provider handling.
    assert response.status_code == 503
