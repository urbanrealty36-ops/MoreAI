from __future__ import annotations

import re
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field

from moreai_api.auth import require_authenticated_user
from moreai_api.db import insert_rows, rpc, select_rows

router = APIRouter(prefix="/agents", tags=["agent-runs"])
Claims = Annotated[dict, Depends(require_authenticated_user)]


class RunCreate(BaseModel):
    prompt: str = Field(min_length=1, max_length=12000)
    workspace_id: UUID | None = None
    conversation_id: UUID | None = None
    agent_key: str = Field(default="manus", pattern=r"^[A-Za-z0-9][A-Za-z0-9._:-]{0,79}$")
    max_attempts: int = Field(default=3, ge=1, le=10)


def _replay_or_conflict(
    existing: list[dict],
    *,
    prompt: str,
    workspace_id: UUID | None,
    conversation_id: UUID | None,
    agent_definition_id: str,
    max_attempts: int,
) -> dict:
    run = existing[0]
    expected = {
        "prompt": prompt,
        "workspace_id": str(workspace_id) if workspace_id else None,
        "conversation_id": str(conversation_id) if conversation_id else None,
        "agent_definition_id": agent_definition_id,
        "max_attempts": max_attempts,
    }
    actual = {
        "prompt": (run.get("input") or {}).get("prompt"),
        "workspace_id": run.get("workspace_id"),
        "conversation_id": run.get("conversation_id"),
        "agent_definition_id": run.get("agent_definition_id"),
        "max_attempts": run.get("max_attempts"),
    }
    if actual != expected:
        raise HTTPException(
            status_code=409,
            detail={
                "code": "IDEMPOTENCY_KEY_REUSED",
                "message": "Idempotency-Key was already used with a different request.",
            },
        )
    return {"run": run, "replayed": True}


@router.post("/runs", status_code=202)
async def create_run(
    payload: RunCreate,
    claims: Claims,
    idempotency_key: Annotated[str | None, Header(alias="Idempotency-Key")] = None,
):
    user_id = str(UUID(str(claims.get("sub", ""))))
    if not idempotency_key or not re.fullmatch(
        r"[A-Za-z0-9][A-Za-z0-9._:-]{7,199}", idempotency_key
    ):
        raise HTTPException(
            status_code=400,
            detail={
                "code": "IDEMPOTENCY_KEY_REQUIRED",
                "message": "Provide a valid Idempotency-Key header.",
            },
        )
    if payload.workspace_id:
        membership = await select_rows(
            "workspace_members",
            f"select=id&workspace_id=eq.{payload.workspace_id}&user_id=eq.{user_id}&status=eq.active&limit=1",
        )
        if not membership:
            raise HTTPException(
                status_code=403,
                detail={
                    "code": "WORKSPACE_ACCESS_DENIED",
                    "message": "Active workspace membership required.",
                },
            )
    if payload.conversation_id:
        conversation = await select_rows(
            "conversations",
            f"select=id&user_id=eq.{user_id}&id=eq.{payload.conversation_id}&limit=1",
        )
        if not conversation:
            raise HTTPException(
                status_code=404,
                detail={"code": "CONVERSATION_NOT_FOUND", "message": "Conversation not found."},
            )
    definitions = await select_rows(
        "agent_definitions",
        f"select=id,key,enabled&key=eq.{payload.agent_key}&enabled=eq.true&limit=1",
    )
    if not definitions:
        raise HTTPException(
            status_code=409,
            detail={"code": "AGENT_NOT_ENABLED", "message": "Requested agent is not enabled."},
        )
    existing = await select_rows(
        "agent_runs",
        "select=id,status,input,workspace_id,conversation_id,agent_definition_id,max_attempts,created_at"
        f"&user_id=eq.{user_id}&idempotency_key=eq.{idempotency_key}&limit=1",
    )
    if existing:
        return _replay_or_conflict(
            existing,
            prompt=payload.prompt,
            workspace_id=payload.workspace_id,
            conversation_id=payload.conversation_id,
            agent_definition_id=str(definitions[0]["id"]),
            max_attempts=payload.max_attempts,
        )
    try:
        created = await insert_rows(
            "agent_runs",
            {
                "user_id": user_id,
                "workspace_id": str(payload.workspace_id) if payload.workspace_id else None,
                "conversation_id": str(payload.conversation_id)
                if payload.conversation_id
                else None,
                "agent_definition_id": definitions[0]["id"],
                "status": "queued",
                "idempotency_key": idempotency_key,
                "input": {"prompt": payload.prompt},
                "max_attempts": payload.max_attempts,
            },
        )
    except HTTPException as exc:
        if exc.status_code != 502:
            raise
        raced = await select_rows(
            "agent_runs",
            "select=id,status,input,workspace_id,conversation_id,agent_definition_id,max_attempts,created_at"
            f"&user_id=eq.{user_id}&idempotency_key=eq.{idempotency_key}&limit=1",
        )
        if raced:
            return _replay_or_conflict(
                raced,
                prompt=payload.prompt,
                workspace_id=payload.workspace_id,
                conversation_id=payload.conversation_id,
                agent_definition_id=str(definitions[0]["id"]),
                max_attempts=payload.max_attempts,
            )
        raise
    if not created:
        raise HTTPException(
            status_code=503,
            detail={"code": "RUN_CREATE_FAILED", "message": "Agent run could not be queued."},
        )
    return {"run": created[0], "replayed": False}


@router.get("/runs")
async def list_runs(claims: Claims, limit: int = 25):
    user_id = str(UUID(str(claims.get("sub", ""))))
    items = await select_rows(
        "agent_runs",
        f"select=id,status,attempt,max_attempts,created_at,started_at,finished_at,error&user_id=eq.{user_id}&order=created_at.desc&limit={max(1, min(limit, 100))}",
    )
    return {"items": items}


@router.get("/runs/{run_id}")
async def get_run(run_id: UUID, claims: Claims):
    user_id = str(UUID(str(claims.get("sub", ""))))
    rows = await select_rows(
        "agent_runs",
        f"select=id,status,attempt,max_attempts,input,output,error,created_at,started_at,finished_at&user_id=eq.{user_id}&id=eq.{run_id}&limit=1",
    )
    if not rows:
        raise HTTPException(
            status_code=404, detail={"code": "RUN_NOT_FOUND", "message": "Agent run not found."}
        )
    return {"run": rows[0]}


@router.get("/runs/{run_id}/events")
async def list_run_events(run_id: UUID, claims: Claims, limit: int = 100):
    user_id = str(UUID(str(claims.get("sub", ""))))
    owned = await select_rows(
        "agent_runs",
        f"select=id&user_id=eq.{user_id}&id=eq.{run_id}&limit=1",
    )
    if not owned:
        raise HTTPException(status_code=404, detail={"code": "RUN_NOT_FOUND"})
    rows = await select_rows(
        "agent_run_events",
        "select=id,event_type,sequence,created_at,payload"
        f"&run_id=eq.{run_id}&order=sequence.asc&limit={max(1, min(limit, 200))}",
    )
    safe_payload_keys = {"step", "step_key", "checkpoint_key", "status", "message", "code", "attempt", "tool_key", "duration_ms"}
    items = []
    for row in rows:
        payload = row.get("payload") if isinstance(row.get("payload"), dict) else {}
        items.append({
            "id": row["id"],
            "event_type": row["event_type"],
            "sequence": row["sequence"],
            "created_at": row["created_at"],
            "payload": {key: payload[key] for key in safe_payload_keys if key in payload},
        })
    return {"items": items}


@router.get("/runs/{run_id}/steps")
async def list_run_steps(run_id: UUID, claims: Claims, limit: int = 100):
    user_id = str(UUID(str(claims.get("sub", ""))))
    owned = await select_rows(
        "agent_runs",
        f"select=id&user_id=eq.{user_id}&id=eq.{run_id}&limit=1",
    )
    if not owned:
        raise HTTPException(status_code=404, detail={"code": "RUN_NOT_FOUND"})
    return {
        "items": await select_rows(
            "agent_run_steps",
            "select=id,sequence,step_key,status,started_at,finished_at,created_at"
            f"&run_id=eq.{run_id}&order=sequence.asc&limit={max(1, min(limit, 200))}",
        )
    }


@router.post("/runs/{run_id}/cancel")
async def cancel_run(run_id: UUID, claims: Claims):
    user_id = str(UUID(str(claims.get("sub", ""))))
    try:
        return await rpc(
            "moreai_worker_request_cancel", {"p_run_id": str(run_id), "p_user_id": user_id}
        )
    except HTTPException as exc:
        if exc.status_code == 502:
            raise HTTPException(
                status_code=404, detail={"code": "RUN_NOT_FOUND", "message": "Agent run not found."}
            ) from exc
        raise


@router.post("/runs/{run_id}/resume")
async def resume_run(run_id: UUID, claims: Claims):
    user_id = str(UUID(str(claims.get("sub", ""))))
    try:
        return await rpc(
            "moreai_worker_resume_run", {"p_run_id": str(run_id), "p_user_id": user_id}
        )
    except HTTPException as exc:
        if exc.status_code == 502:
            raise HTTPException(
                status_code=409,
                detail={"code": "RUN_NOT_RESUMABLE", "message": "Agent run cannot be resumed."},
            ) from exc
        raise


internal_router = APIRouter(prefix="/internal/agents", tags=["internal-agent-runs"])


class CheckpointWrite(BaseModel):
    checkpoint_key: str = Field(min_length=1, max_length=160)
    state: dict


@internal_router.post("/runs/{run_id}/checkpoint")
async def write_checkpoint(
    run_id: UUID,
    payload: CheckpointWrite,
    worker_id: Annotated[str, Header(alias="X-Worker-ID")],
    worker_token: Annotated[str | None, Header(alias="X-Worker-Token")] = None,
):
    import secrets
    from moreai_api.settings import settings

    expected = settings.worker_internal_token or ""
    if not expected or not worker_token or not secrets.compare_digest(worker_token, expected):
        raise HTTPException(status_code=401, detail={"code": "WORKER_AUTH_REQUIRED"})
    if len(worker_id) < 8 or len(worker_id) > 128:
        raise HTTPException(status_code=400, detail={"code": "INVALID_WORKER_ID"})
    try:
        return await rpc(
            "moreai_worker_checkpoint",
            {
                "p_run_id": str(run_id),
                "p_worker_id": worker_id,
                "p_checkpoint_key": payload.checkpoint_key,
                "p_state": payload.state,
            },
        )
    except HTTPException as exc:
        raise HTTPException(status_code=409, detail={"code": "WORKER_LEASE_NOT_HELD"}) from exc
