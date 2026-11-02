from __future__ import annotations

import asyncio
import logging
import os
import signal
import socket
import uuid
from dataclasses import dataclass
from typing import Any, Protocol

import httpx

LOG = logging.getLogger("moreai.worker")


@dataclass(frozen=True)
class WorkerConfig:
    supabase_url: str
    service_key: str
    poll_seconds: float = 2.0
    lease_seconds: int = 90
    heartbeat_seconds: int = 20
    max_concurrency: int = 4

    @classmethod
    def from_env(cls) -> "WorkerConfig":
        url = os.getenv("SUPABASE_URL", "").rstrip("/")
        key = os.getenv("SUPABASE_SECRET_KEY", "")
        if not url.startswith("https://") or not key:
            raise RuntimeError("SUPABASE_URL (https) and SUPABASE_SECRET_KEY are required")
        return cls(
            supabase_url=url,
            service_key=key,
            poll_seconds=max(0.5, float(os.getenv("WORKER_POLL_SECONDS", "2"))),
            lease_seconds=max(15, min(900, int(os.getenv("WORKER_LEASE_SECONDS", "90")))),
            heartbeat_seconds=max(5, int(os.getenv("WORKER_HEARTBEAT_SECONDS", "20"))),
            max_concurrency=max(1, min(32, int(os.getenv("WORKER_MAX_CONCURRENCY", "4")))),
        )


class Store:
    def __init__(self, config: WorkerConfig) -> None:
        self.config = config
        self.client = httpx.AsyncClient(
            base_url=f"{config.supabase_url}/rest/v1/",
            timeout=httpx.Timeout(15.0, connect=5.0),
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

    async def claim(self, worker_id: str) -> dict[str, Any] | None:
        return await self.rpc(
            "moreai_worker_claim_run",
            {"p_worker_id": worker_id, "p_lease_seconds": self.config.lease_seconds},
        )

    async def heartbeat(self, run_id: str, worker_id: str) -> dict[str, Any]:
        return await self.rpc(
            "moreai_worker_heartbeat",
            {
                "p_run_id": run_id,
                "p_worker_id": worker_id,
                "p_lease_seconds": self.config.lease_seconds,
            },
        )

    async def checkpoint(
        self, run_id: str, worker_id: str, key: str, state: dict[str, Any]
    ) -> Any:
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


class OpenManusExecutor:
    """OpenManus adapter with upstream shell/Python/browser tools denied by default."""

    async def execute(
        self,
        run: dict[str, Any],
        checkpoint: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        run_input = run.get("input") or {}
        prompt = run_input.get("prompt") or run_input.get("message")
        if not isinstance(prompt, str) or not prompt.strip():
            raise ValueError("Agent run requires input.prompt or input.message")
        if os.getenv("OPENMANUS_RUNTIME_ENABLED", "false").lower() != "true":
            raise RuntimeError(
                "OpenManus runtime disabled until gateway/tool adapters are configured"
            )
        if os.getenv("OPENMANUS_GATEWAY_ADAPTER") != "enabled":
            raise RuntimeError("OpenManus gateway adapter is not configured")
        try:
            from app.agent.manus import Manus
            from app.tool import Terminate, ToolCollection
        except ImportError as exc:
            raise RuntimeError(
                "OpenManus source dependencies are not installed in worker image"
            ) from exc

        agent = Manus(max_steps=max(1, min(int(run_input.get("max_steps", 8)), 20)))
        agent.available_tools = ToolCollection(Terminate())
        agent.tool_choices = "none"
        if checkpoint and isinstance(checkpoint.get("state"), dict):
            messages = checkpoint["state"].get("messages")
            if isinstance(messages, list):
                from app.schema import Message

                agent.memory.messages = [
                    Message.model_validate(message) for message in messages
                ]
        result = await agent.run(prompt)
        return {
            "text": result,
            "engine": "openmanus",
            "attempt": run.get("attempt", 1),
        }


class Worker:
    def __init__(self, config: WorkerConfig, executor: Executor) -> None:
        self.config = config
        self.store = Store(config)
        self.executor = executor
        self.worker_id = f"{socket.gethostname()}:{uuid.uuid4()}"

    async def heartbeat_loop(
        self,
        run_id: str,
        lease_lost: asyncio.Event,
        cancel_requested: asyncio.Event,
        stop: asyncio.Event,
    ) -> None:
        while not stop.is_set():
            try:
                await asyncio.wait_for(
                    stop.wait(), timeout=self.config.heartbeat_seconds
                )
                return
            except TimeoutError:
                pass
            result = await self.store.heartbeat(run_id, self.worker_id)
            if result and result.get("cancel_requested"):
                cancel_requested.set()
                return
            if not result or not result.get("alive"):
                lease_lost.set()
                return

    async def process(self, run: dict[str, Any]) -> None:
        run_id = str(run["id"])
        lease_lost = asyncio.Event()
        cancel_requested = asyncio.Event()
        stop = asyncio.Event()
        heartbeat = asyncio.create_task(
            self.heartbeat_loop(run_id, lease_lost, cancel_requested, stop)
        )
        execution: asyncio.Task | None = None
        try:
            checkpoint = await self.store.latest_checkpoint(run_id)
            await self.store.checkpoint(
                run_id,
                self.worker_id,
                "worker.started",
                {"attempt": run.get("attempt", 1), "worker_id": self.worker_id},
            )
            execution = asyncio.create_task(self.executor.execute(run, checkpoint))
            cancel_wait = asyncio.create_task(cancel_requested.wait())
            done, _ = await asyncio.wait(
                {execution, cancel_wait}, return_when=asyncio.FIRST_COMPLETED
            )
            if cancel_wait in done and cancel_requested.is_set():
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
            if lease_lost.is_set():
                LOG.warning("Lease lost; output not committed for run %s", run_id)
                return
            await self.store.finish(
                run_id, self.worker_id, "succeeded", output=output
            )
        except asyncio.CancelledError:
            if not lease_lost.is_set():
                await self.store.finish(
                    run_id,
                    self.worker_id,
                    "cancelled",
                    error={"code": "WORKER_SHUTDOWN"},
                )
            raise
        except Exception as exc:
            LOG.exception("Run %s failed", run_id)
            if not lease_lost.is_set():
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

    async def serve(self) -> None:
        active: set[asyncio.Task] = set()
        try:
            while True:
                active = {task for task in active if not task.done()}
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
    worker = Worker(WorkerConfig.from_env(), OpenManusExecutor())
    stop = asyncio.Event()
    loop = asyncio.get_running_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, stop.set)
    serving = asyncio.create_task(worker.serve())
    await stop.wait()
    serving.cancel()
    await asyncio.gather(serving, return_exceptions=True)


def main() -> None:
    asyncio.run(_main())


if __name__ == "__main__":
    main()
