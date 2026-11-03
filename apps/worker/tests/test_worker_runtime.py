import pytest
from moreai_worker.main import WorkerConfig


def test_worker_requires_supabase_https_and_key(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "http://example.com")
    monkeypatch.setenv("SUPABASE_SECRET_KEY", "secret")
    monkeypatch.setenv("MOREAI_API_BASE_URL", "https://api.example.com")
    monkeypatch.setenv("WORKER_INTERNAL_TOKEN", "internal-token")
    with pytest.raises(RuntimeError, match="Supabase"):
        WorkerConfig.from_env()


def test_worker_requires_internal_api_token(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "https://db.example.com")
    monkeypatch.setenv("SUPABASE_SECRET_KEY", "secret")
    monkeypatch.setenv("MOREAI_API_BASE_URL", "https://api.example.com")
    monkeypatch.delenv("WORKER_INTERNAL_TOKEN", raising=False)
    with pytest.raises(RuntimeError, match="worker token"):
        WorkerConfig.from_env()


def test_worker_accepts_secure_runtime_config(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "https://db.example.com")
    monkeypatch.setenv("SUPABASE_SECRET_KEY", "secret")
    monkeypatch.setenv("MOREAI_API_BASE_URL", "https://api.example.com")
    monkeypatch.setenv("WORKER_INTERNAL_TOKEN", "internal-token")
    config = WorkerConfig.from_env()
    assert config.lease_seconds == 90
    assert config.api_base_url == "https://api.example.com"



def test_openmanus_tool_registry_rejects_unavailable_tools():
    from moreai_worker.main import OpenManusToolRegistry

    registry = OpenManusToolRegistry()
    registry.register("terminate", object)
    with pytest.raises(RuntimeError, match="not registered or sandboxed"):
        registry.build(lambda *tools: tools, ["browser"])


def test_openmanus_tool_registry_builds_only_explicit_allowlist():
    from moreai_worker.main import OpenManusToolRegistry

    class Tool:
        pass

    registry = OpenManusToolRegistry()
    registry.register("terminate", Tool)
    result = registry.build(lambda *tools: tools, ["terminate"])
    assert len(result) == 1
    assert isinstance(result[0], Tool)


def test_openmanus_tool_registry_rejects_duplicate_keys():
    from moreai_worker.main import OpenManusToolRegistry

    registry = OpenManusToolRegistry()
    registry.register("terminate", object)
    with pytest.raises(ValueError, match="unique"):
        registry.register("terminate", object)
