import pytest

from moreai_api.main import resolve_cors_origins


def test_development_cors_defaults_are_local_only():
    assert resolve_cors_origins("development", "") == [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
    ]


def test_production_requires_explicit_cors_origins():
    with pytest.raises(RuntimeError, match="CORS_ALLOWED_ORIGINS"):
        resolve_cors_origins("production", "")


def test_production_cors_requires_https_and_rejects_wildcard():
    assert resolve_cors_origins("production", "https://web.moreai.id,https://admin.moreai.id") == [
        "https://web.moreai.id",
        "https://admin.moreai.id",
    ]
    with pytest.raises(RuntimeError, match="invalid or insecure"):
        resolve_cors_origins("production", "http://web.moreai.id")
    with pytest.raises(RuntimeError, match="invalid or insecure"):
        resolve_cors_origins("production", "*")
