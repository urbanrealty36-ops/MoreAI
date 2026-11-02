import asyncio

import pytest

from moreai_worker.main import OpenManusExecutor, WorkerConfig


def test_worker_config_requires_https_and_service_key(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "http://example.com")
    monkeypatch.setenv("SUPABASE_SECRET_KEY", "secret")
    with pytest.raises(RuntimeError):
        WorkerConfig.from_env()


@pytest.mark.asyncio
async def test_openmanus_executor_fails_closed_without_gateway(monkeypatch):
    monkeypatch.setenv("OPENMANUS_RUNTIME_ENABLED", "false")
    with pytest.raises(RuntimeError, match="disabled"):
        await OpenManusExecutor().execute({"input": {"prompt": "hello"}})
