from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import os
import signal
import socket
import sys
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Protocol

import httpx

LOG = logging.getLogger("moreai.worker")


@dataclass(frozen=True)
class WorkerConfig:
    supabase_url: str
    service_key: str
    api_base_url: str
    worker_token: str
    poll_seconds: float = 2
    lease_seconds: int = 90
    heartbeat_seconds: int = 20
    max_concurrency: int = 4

    @classmethod
    def from_env(cls) -> "WorkerConfig":
        supabase_url = os.getenv("SUPABASE_URL", "").rstrip("/")
        service_key = os.getenv("SUPABASE_SECRET_KEY", "")
        api_base_url = os.getenv("MOREAI_API_BASE_URL", "").rstrip("/")
        worker_token = os.getenv("WORKER_INTERNAL_TOKEN", "")

        if not supabase_url.startswith("https://") or not service_key:
            raise RuntimeError("Supabase URL/secret key required")
        if not api_base_url.startswith("https://") or not worker_token:
            raise RuntimeError("MoreAI API URL/worker token required")

        return cls(
            supabase_url=supabase_url,
            service_key=service_key,
            api_base_url=api_base_url,
            worker_token=worker_token,
            poll_seconds=max(0.5, float(os.getenv("WORKER_POLL_SECONDS", "2"))),
            lease_seconds=max(15, min(900, int(os.getenv("WORKER_LEASE_SECONDS", "90")))),
            heartbeat_seconds=max(5, int(os.getenv("WORKER_HEARTBEAT_SECONDS", "20"))),
            max_concurrency=max(1, min(32, int(os.getenv("WORKER_MAX_CONCURRENCY", "4")))),
        )


class Store:
    def __init__(self, config: WorkerConfig):
        self.config = config
        self.client = httpx.AsyncClient(
            base_url=f"{config.supabase_url}/rest/v1/",
            timeout=httpx.Timeout(15, connect=5),
            headers={
                "apikey": config.service_key,
                "Authorization": f"Bearer {config.service_key}",
                "Content-Type": "application/json",
            },
        )

    async def rpc(self, name: str, payload: dict[str, Any]) -> Any:
        response = await self.client.post(f"rpc/{name}", json=payload)
        response.raise_for_status()
        return response.json() if response.content else None

    async def claim(self, worker_id: str) -> Any:
        return await self.rpc(
            "moreai_worker_claim_run",
            {
                "p_worker_id": worker_id,
                "p_lease_seconds": self.config.lease_seconds,
            },
        )

    async def heartbeat(self, run_id: str, worker_id: str) -> Any:
        return await self.rpc(
            "moreai_worker_heartbeat",
            {
                "p_run_id": run_id,
                "p_worker_id": worker_id,
                "p_lease_seconds": self.config.lease_seconds,
            },
        )

    async def checkpoint(self, run_id: str, worker_id: str, key: str, state: dict[str, Any]) -> Any:
        return await self.rpc(
            "moreai_worker_checkpoint",
            {
                "p_run_id": run_id,
                "p_worker_id": worker_id,
                "p_checkpoint_key": key,
                "p_state": state,
            },
        )

    async def latest_checkpoint(self, run_id: str) -> dict[str, Any] | None:
        response = await self.client.get(
            "agent_run_checkpoints",
            params={
                "select": "checkpoint_key,state,created_at",
                "run_id": f"eq.{run_id}",
                "order": "created_at.desc",
                "limit": "1",
            },
        )
        response.raise_for_status()
        rows = response.json()
        return rows[0] if rows else None

    async def finish(
        self,
        run_id: str,
        worker_id: str,
        status: str,
        output: dict[str, Any] | None = None,
        error: dict[str, Any] | None = None,
    ) -> Any:
        return await self.rpc(
            "moreai_worker_finish_run",
            {
                "p_run_id": run_id,
                "p_worker_id": worker_id,
                "p_status": status,
                "p_output": output,
                "p_error": error,
                "p_retry_delay_seconds": 30,
            },
        )

    async def close(self) -> None:
        await self.client.aclose()


class Executor(Protocol):
    async def execute(
        self,
        run: dict[str, Any],
        checkpoint: dict[str, Any] | None = None,
    ) -> dict[str, Any]: ...


class GatewayLLM:
    def __init__(
        self,
        config: WorkerConfig,
        user_id: str,
        run_id: str,
        worker_id: str,
    ):
        from openai import AsyncOpenAI

        self.config = config
        self.user_id = user_id
        self.run_id = run_id
        self.worker_id = worker_id
        self.client = AsyncOpenAI(
            base_url=f"{config.api_base_url}/api/v1/internal/llm",
            api_key=config.worker_token,
            default_headers={"X-Worker-Token": config.worker_token},
            timeout=55,
            max_retries=0,
        )

    async def ask(
        self,
        messages: list[dict[str, Any]],
        system_msgs: list[dict[str, Any]] | None = None,
        stream: bool = False,
        temperature: float | None = None,
    ) -> str:
        from app.llm import LLM

        formatted = LLM.format_messages((system_msgs or []) + messages)
        digest = hashlib.sha256(
            json.dumps(formatted, sort_keys=True, default=str).encode()
        ).hexdigest()
        response = await self.client.chat.completions.create(
            model="moreai-router",
            messages=formatted,
            max_tokens=2048,
            extra_body={"user_id": self.user_id, "run_id": self.run_id},
            extra_headers={"Idempotency-Key": f"agent:{self.run_id}:{digest}"},
        )
        content = response.choices[0].message.content or ""

        async with httpx.AsyncClient(timeout=15) as client:
            saved = await client.post(
                f"{self.config.api_base_url}/api/v1/internal/agents/runs/{self.run_id}/checkpoint",
                headers={
                    "X-Worker-Token": self.config.worker_token,
                    "X-Worker-ID": self.worker_id,
                },
                json={
                    "checkpoint_key": f"llm:{digest}",
                    "state": {"messages": formatted + [{"role": "assistant", "content": content}]},
                },
            )
            saved.raise_for_status()

        return content


class OpenManusExecutor:
    def __init__(self, config: WorkerConfig):
        self.config = config

    async def execute(
        self,
        run: dict[str, Any],
        checkpoint: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        source = Path(os.getenv("OPENMANUS_SOURCE_PATH", "/app/vendor/openmanusweb"))
        if not source.exists():
            raise RuntimeError("OPENMANUS_SOURCE_PATH is not mounted in worker image")
        sys.path.insert(0, str(source))

        data = run.get("input") or {}
        prompt = data.get("prompt") or data.get("message")
        if not isinstance(prompt, str) or not prompt.strip():
            raise ValueError("Agent prompt required")

        try:
            from app.agent.manus import Manus
            from app.schema import Message
            from app.tool import Terminate, ToolCollection
        except ImportError as exc:
            raise RuntimeError("OpenManus runtime dependencies are missing") from exc

        agent = Manus(max_steps=max(1, min(int(data.get("max_steps", 8)), 20)))
        agent.available_tools = ToolCollection(Terminate())
        agent.tool_choices = "none"
        agent.llm = GatewayLLM(
            self.config,
            str(run["user_id"]),
            str(run["id"]),
            str(run["lease_owner"]),
        )

        if (
            checkpoint
            and isinstance(checkpoint.get("state"), dict)
            and isinstance(checkpoint["state"].get("messages"), list)
        ):
            agent.memory.messages = [
                Message.model_validate(message) for message in checkpoint["state"]["messages"]
            ]

        return {
            "text": await agent.run(prompt),
            "engine": "openmanus",
            "attempt": run.get("attempt", 1),
        }


class Worker:
    def __init__(self, config: WorkerConfig, executor: Executor):
        self.config = config
        self.store = Store(config)
        self.executor = executor
        self.worker_id = f"{socket.gethostname()}:{uuid.uuid4()}"

    async def heartbeat_loop(
        self,
        run_id: str,
        lost: asyncio.Event,
        cancel: asyncio.Event,
        stop: asyncio.Event,
    ) -> None:
        while not stop.is_set():
            try:
                await asyncio.wait_for(stop.wait(), timeout=self.config.heartbeat_seconds)
                return
            except TimeoutError:
                pass

            result = await self.store.heartbeat(run_id, self.worker_id)
            if result and result.get("cancel_requested"):
                cancel.set()
                return
            if not result or not result.get("alive"):
                lost.set()
                return

    async def process(self, run: dict[str, Any]) -> None:
        run_id = str(run["id"])
        lost = asyncio.Event()
        cancel = asyncio.Event()
        stop = asyncio.Event()
        heartbeat = asyncio.create_task(self.heartbeat_loop(run_id, lost, cancel, stop))
        execution: asyncio.Task[dict[str, Any]] | None = None

        try:
            checkpoint = await self.store.latest_checkpoint(run_id)
            await self.store.checkpoint(
                run_id,
                self.worker_id,
                "worker.started",
                {
                    "attempt": run.get("attempt", 1),
                    "worker_id": self.worker_id,
                },
            )
            execution = asyncio.create_task(
                self.executor.execute(
                    {**run, "lease_owner": self.worker_id},
                    checkpoint,
                )
            )
            cancel_wait = asyncio.create_task(cancel.wait())
            done, _ = await asyncio.wait(
                {execution, cancel_wait},
                return_when=asyncio.FIRST_COMPLETED,
            )

            if cancel_wait in done and cancel.is_set():
                execution.cancel()
                await asyncio.gather(execution, return_exceptions=True)
                await self.store.finish(
                    run_id,
                    self.worker_id,
                    "cancelled",
                    error={"code": "CANCEL_REQUESTED"},
                )
                return

            cancel_wait.cancel()
            await asyncio.gather(cancel_wait, return_exceptions=True)
            output = await execution
            if not lost.is_set():
                await self.store.finish(
                    run_id,
                    self.worker_id,
                    "succeeded",
                    output=output,
                )
        except asyncio.CancelledError:
            if not lost.is_set():
                await self.store.finish(
                    run_id,
                    self.worker_id,
                    "cancelled",
                    error={"code": "WORKER_SHUTDOWN"},
                )
            raise
        except Exception as exc:
            LOG.exception("Run %s failed", run_id)
            if not lost.is_set():
                await self.store.finish(
                    run_id,
                    self.worker_id,
                    "failed",
                    error={
                        "code": "EXECUTION_FAILED",
                        "message": str(exc)[:500],
                    },
                )
        finally:
            stop.set()
            heartbeat.cancel()
            await asyncio.gather(heartbeat, return_exceptions=True)

    async def reconcile(self) -> None:
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                response = await client.post(
                    f"{self.config.api_base_url}/api/v1/internal/llm/reconcile",
                    headers={"X-Worker-Token": self.config.worker_token},
                )
                response.raise_for_status()
        except httpx.HTTPError:
            LOG.exception("LLM settlement reconciliation failed")

    async def serve(self) -> None:
        active: set[asyncio.Task[None]] = set()
        last_reconcile = 0.0

        try:
            while True:
                active = {task for task in active if not task.done()}
                now = asyncio.get_running_loop().time()
                if now - last_reconcile > 30:
                    await self.reconcile()
                    last_reconcile = now

                if len(active) >= self.config.max_concurrency:
                    await asyncio.sleep(self.config.poll_seconds)
                    continue

                run = await self.store.claim(self.worker_id)
                if run:
                    active.add(asyncio.create_task(self.process(run)))
                else:
                    await asyncio.sleep(self.config.poll_seconds)
        finally:
            for task in active:
                task.cancel()
            await asyncio.gather(*active, return_exceptions=True)
            await self.store.close()


async def _main() -> None:
    logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
    config = WorkerConfig.from_env()
    worker = Worker(config, OpenManusExecutor(config))
    stop = asyncio.Event()
    loop = asyncio.get_running_loop()

    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, stop.set)

    task = asyncio.create_task(worker.serve())
    await stop.wait()
    task.cancel()
    await asyncio.gather(task, return_exceptions=True)


def main() -> None:
    asyncio.run(_main())


if __name__ == "__main__":
    main()
