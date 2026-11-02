from __future__ import annotations

from typing import Annotated
from uuid import UUID, uuid4

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
    agent_key: str = Field(default="manus", min_length=1, max_length=80)
    max_attempts: int = Field(default=3, ge=1, le=10)


@router.post("/runs", status_code=202)
async def create_run(
    payload: RunCreate,
    claims: Claims,
    idempotency_key: Annotated[str | None, Header(alias="Idempotency-Key")] = None,
):
    user_id = str(UUID(str(claims.get("sub", ""))))
    if not idempotency_key or not idempotency_key.strip() or len(idempotency_key) > 200:
        raise HTTPException(status_code=400, detail={"code": "IDEMPOTENCY_KEY_REQUIRED", "message": "Provide a valid Idempotency-Key header."})
    if payload.workspace_id:
        membership = await select_rows("workspace_members", f"select=id&workspace_id=eq.{payload.workspace_id}&user_id=eq.{user_id}&status=eq.active&limit=1")
        if not membership:
            raise HTTPException(status_code=403, detail={"code": "WORKSPACE_ACCESS_DENIED", "message": "Active workspace membership required."})
    if payload.conversation_id:
        conversation = await select_rows("conversations", f"select=id&user_id=eq.{user_id}&id=eq.{payload.conversation_id}&limit=1")
        if not conversation:
            raise HTTPException(status_code=404, detail={"code": "CONVERSATION_NOT_FOUND", "message": "Conversation not found."})
    definitions = await select_rows("agent_definitions", f"select=id,key,enabled&key=eq.{payload.agent_key}&enabled=eq.true&limit=1")
    if not definitions:
        raise HTTPException(status_code=409, detail={"code": "AGENT_NOT_ENABLED", "message": "Requested agent is not enabled."})
    existing = await select_rows("agent_runs", f"select=id,status,input,created_at&user_id=eq.{user_id}&idempotency_key=eq.{idempotency_key}&limit=1")
    if existing:
        return {"run": existing[0], "replayed": True}
    created = await insert_rows("agent_runs", {
        "user_id": user_id, "workspace_id": str(payload.workspace_id) if payload.workspace_id else None,
        "conversation_id": str(payload.conversation_id) if payload.conversation_id else None,
        "agent_definition_id": definitions[0]["id"], "status": "queued",
        "idempotency_key": idempotency_key, "input": {"prompt": payload.prompt},
        "max_attempts": payload.max_attempts,
    })
    if not created:
        raise HTTPException(status_code=503, detail={"code": "RUN_CREATE_FAILED", "message": "Agent run could not be queued."})
    return {"run": created[0], "replayed": False}


@router.get("/runs")
async def list_runs(claims: Claims, limit: int = 25):
    user_id = str(UUID(str(claims.get("sub", ""))))
    items = await select_rows("agent_runs", f"select=id,status,attempt,max_attempts,created_at,started_at,finished_at,error&user_id=eq.{user_id}&order=created_at.desc&limit={max(1,min(limit,100))}")
    return {"items": items}


@router.get("/runs/{run_id}")
async def get_run(run_id: UUID, claims: Claims):
    user_id = str(UUID(str(claims.get("sub", ""))))
    rows = await select_rows("agent_runs", f"select=id,status,attempt,max_attempts,input,output,error,created_at,started_at,finished_at&user_id=eq.{user_id}&id=eq.{run_id}&limit=1")
    if not rows:
        raise HTTPException(status_code=404, detail={"code": "RUN_NOT_FOUND", "message": "Agent run not found."})
    return {"run": rows[0]}


@router.post("/runs/{run_id}/cancel")
async def cancel_run(run_id: UUID, claims: Claims):
    user_id = str(UUID(str(claims.get("sub", ""))))
    try:
        return await rpc("moreai_worker_request_cancel", {"p_run_id": str(run_id), "p_user_id": user_id})
    except HTTPException as exc:
        if exc.status_code == 502:
            raise HTTPException(status_code=404, detail={"code": "RUN_NOT_FOUND", "message": "Agent run not found."}) from exc
        raise


@router.post("/runs/{run_id}/resume")
async def resume_run(run_id: UUID, claims: Claims):
    user_id = str(UUID(str(claims.get("sub", ""))))
    try:
        return await rpc("moreai_worker_resume_run", {"p_run_id": str(run_id), "p_user_id": user_id})
    except HTTPException as exc:
        if exc.status_code == 502:
            raise HTTPException(status_code=409, detail={"code": "RUN_NOT_RESUMABLE", "message": "Agent run cannot be resumed."}) from exc
        raise
