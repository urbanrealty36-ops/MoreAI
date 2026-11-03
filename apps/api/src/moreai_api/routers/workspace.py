from __future__ import annotations

import hashlib
import re
from datetime import datetime, timezone
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field

from moreai_api.auth import require_authenticated_user
from moreai_api.db import insert_rows, select_rows, update_rows
from moreai_api.routers.llm import GenerateRequest, _generate

router = APIRouter(prefix="/workspace", tags=["customer-workspace"])
Claims = Annotated[dict, Depends(require_authenticated_user)]


class ConversationCreate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=160)
    workspace_id: UUID | None = None


class ConversationUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=160)
    status: str | None = Field(default=None, pattern=r"^(active|archived)$")


class MessageCreate(BaseModel):
    content: str = Field(min_length=1, max_length=12000)
    model: str | None = Field(default=None, max_length=120)
    max_output_tokens: int = Field(default=2048, ge=1, le=4096)


def _user_id(claims: dict) -> str:
    try:
        return str(UUID(str(claims.get("sub", ""))))
    except (ValueError, TypeError, AttributeError) as exc:
        raise HTTPException(status_code=401, detail={"code": "INVALID_AUTH_SUBJECT"}) from exc


async def _owned_conversation(conversation_id: UUID, user_id: str) -> dict:
    rows = await select_rows(
        "conversations",
        "select=id,user_id,workspace_id,title,status,metadata,created_at,updated_at"
        f"&id=eq.{conversation_id}&user_id=eq.{user_id}&status=neq.deleted&limit=1",
    )
    if not rows:
        raise HTTPException(status_code=404, detail={"code": "CONVERSATION_NOT_FOUND"})
    return rows[0]


@router.get("/conversations")
async def list_conversations(claims: Claims, limit: int = 30):
    user_id = _user_id(claims)
    return {
        "items": await select_rows(
            "conversations",
            "select=id,workspace_id,title,status,created_at,updated_at"
            f"&user_id=eq.{user_id}&status=neq.deleted&order=updated_at.desc&limit={max(1, min(limit, 100))}",
        )
    }


@router.post("/conversations", status_code=201)
async def create_conversation(payload: ConversationCreate, claims: Claims):
    user_id = _user_id(claims)
    if payload.workspace_id:
        membership = await select_rows(
            "workspace_members",
            f"select=id&workspace_id=eq.{payload.workspace_id}&user_id=eq.{user_id}&status=eq.active&limit=1",
        )
        if not membership:
            raise HTTPException(status_code=403, detail={"code": "WORKSPACE_ACCESS_DENIED"})
    rows = await insert_rows(
        "conversations",
        {
            "user_id": user_id,
            "workspace_id": str(payload.workspace_id) if payload.workspace_id else None,
            "title": payload.title or "Percakapan baru",
            "status": "active",
            "metadata": {},
        },
    )
    if not rows:
        raise HTTPException(status_code=503, detail={"code": "CONVERSATION_CREATE_FAILED"})
    return {"conversation": rows[0]}


@router.patch("/conversations/{conversation_id}")
async def update_conversation(conversation_id: UUID, payload: ConversationUpdate, claims: Claims):
    user_id = _user_id(claims)
    await _owned_conversation(conversation_id, user_id)
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=422, detail={"code": "EMPTY_UPDATE"})
    changes["updated_at"] = datetime.now(timezone.utc).isoformat()
    rows = await update_rows(
        "conversations",
        f"id=eq.{conversation_id}&user_id=eq.{user_id}",
        changes,
    )
    if not rows:
        raise HTTPException(status_code=404, detail={"code": "CONVERSATION_NOT_FOUND"})
    return {"conversation": rows[0]}


@router.get("/conversations/{conversation_id}/messages")
async def list_messages(conversation_id: UUID, claims: Claims, limit: int = 100):
    user_id = _user_id(claims)
    await _owned_conversation(conversation_id, user_id)
    return {
        "items": await select_rows(
            "conversation_messages",
            "select=id,role,content,model_key,run_id,token_input,token_output,metadata,created_at"
            f"&conversation_id=eq.{conversation_id}&user_id=eq.{user_id}&order=created_at.asc&limit={max(1, min(limit, 200))}",
        )
    }


@router.post("/conversations/{conversation_id}/messages")
async def send_message(
    conversation_id: UUID,
    payload: MessageCreate,
    claims: Claims,
    idempotency_key: Annotated[str | None, Header(alias="Idempotency-Key")] = None,
):
    user_id = _user_id(claims)
    if not idempotency_key or not re.fullmatch(
        r"[A-Za-z0-9][A-Za-z0-9._:-]{7,199}", idempotency_key
    ):
        raise HTTPException(status_code=400, detail={"code": "IDEMPOTENCY_KEY_REQUIRED"})
    conversation = await _owned_conversation(conversation_id, user_id)

    request_key = f"chat:{conversation_id}:{hashlib.sha256(idempotency_key.encode()).hexdigest()}"
    history_rows = await select_rows(
        "conversation_messages",
        "select=role,content,metadata"
        f"&conversation_id=eq.{conversation_id}&user_id=eq.{user_id}"
        "&role=in.(user,assistant)&order=created_at.desc&limit=12",
    )
    existing = await select_rows(
        "conversation_messages",
        "select=id,role,content,model_key,token_input,token_output,created_at"
        f"&conversation_id=eq.{conversation_id}&user_id=eq.{user_id}"
        f"&metadata->>request_key=eq.{request_key}&order=created_at.asc&limit=2",
    )
    if len(existing) >= 2 and existing[-1].get("role") == "assistant":
        return {"user_message": existing[0], "assistant_message": existing[-1], "replayed": True}

    user_rows = [item for item in existing if item.get("role") == "user"][:1]
    if not user_rows:
        user_rows = await insert_rows(
            "conversation_messages",
            {
                "conversation_id": str(conversation_id),
                "user_id": user_id,
                "role": "user",
                "content": payload.content,
                "metadata": {"request_key": request_key},
            },
        )
    if not user_rows:
        raise HTTPException(status_code=503, detail={"code": "MESSAGE_PERSIST_FAILED"})

    context_budget = max(0, 11500 - len(payload.content))
    context_lines: list[str] = []
    for item in history_rows:
        metadata = item.get("metadata") if isinstance(item.get("metadata"), dict) else {}
        if metadata.get("request_key") == request_key:
            continue
        content = item.get("content") if isinstance(item.get("content"), str) else ""
        if not content or context_budget <= 0:
            continue
        prefix = "User: " if item.get("role") == "user" else "Assistant: "
        snippet = content[-max(1, min(len(content), context_budget - len(prefix) - 1)) :]
        line = f"{prefix}{snippet}"
        context_lines.append(line)
        context_budget -= len(line) + 1
    context_lines.reverse()
    prompt = (
        "Recent conversation context:\n"
        + "\n".join(context_lines)
        + "\n\nCurrent user message:\n"
        + payload.content
        if context_lines
        else payload.content
    )
    generated = await _generate(
        GenerateRequest(
            prompt=prompt,
            model=payload.model,
            max_output_tokens=payload.max_output_tokens,
        ),
        user_id,
        request_key,
    )
    assistant_rows = await insert_rows(
        "conversation_messages",
        {
            "conversation_id": str(conversation_id),
            "user_id": user_id,
            "role": "assistant",
            "content": generated.text,
            "model_key": generated.model,
            "token_input": generated.usage["input_tokens"],
            "token_output": generated.usage["output_tokens"],
            "metadata": {
                "request_key": request_key,
                "provider": generated.provider,
                "request_id": generated.request_id,
            },
        },
    )
    if not assistant_rows:
        raise HTTPException(
            status_code=503,
            detail={
                "code": "ASSISTANT_MESSAGE_PERSIST_PENDING",
                "request_id": generated.request_id,
            },
        )
    await update_rows(
        "conversations",
        f"id=eq.{conversation_id}&user_id=eq.{user_id}",
        {
            "title": payload.content[:80]
            if conversation.get("title") in (None, "Percakapan baru")
            else conversation.get("title"),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
    )
    return {
        "user_message": user_rows[0],
        "assistant_message": assistant_rows[0],
        "replayed": False,
    }


@router.get("/files")
async def list_workspace_files(claims: Claims, limit: int = 50):
    user_id = _user_id(claims)
    return {
        "items": await select_rows(
            "artifacts",
            "select=id,workspace_id,run_id,storage_path,mime_type,size_bytes,checksum_sha256,metadata,created_at"
            f"&user_id=eq.{user_id}&order=created_at.desc&limit={max(1, min(limit, 100))}",
        )
    }


@router.get("/wallet")
async def get_wallet(claims: Claims, limit: int = 50):
    user_id = _user_id(claims)
    wallets = await select_rows(
        "wallet_accounts",
        f"select=id,currency,balance,status,updated_at&owner_type=eq.user&owner_id=eq.{user_id}&limit=1",
    )
    if not wallets:
        return {"available": False, "wallet": None, "transactions": []}
    wallet = wallets[0]
    transactions = await select_rows(
        "credit_ledger",
        "select=id,entry_type,amount,balance_after,reference_type,reference_id,description,created_at"
        f"&wallet_id=eq.{wallet['id']}&order=created_at.desc&limit={max(1, min(limit, 100))}",
    )
    return {"available": True, "wallet": wallet, "transactions": transactions}


@router.get("/entitlements")
async def list_entitlements(claims: Claims):
    user_id = _user_id(claims)
    return {
        "items": await select_rows(
            "user_entitlements",
            "select=id,entitlement_key,source_type,source_id,status,starts_at,expires_at,metadata,created_at"
            f"&user_id=eq.{user_id}&order=created_at.desc&limit=100",
        )
    }


@router.get("/memory")
async def memory_status(_: Claims):
    raise HTTPException(
        status_code=503,
        detail={
            "code": "MEMORY_SCHEMA_NOT_PROVISIONED",
            "message": "Memory persistence is not available in the current Supabase schema.",
        },
    )


@router.get("/subscription")
async def subscription_status(_: Claims):
    raise HTTPException(
        status_code=503,
        detail={
            "code": "SUBSCRIPTION_SCHEMA_NOT_PROVISIONED",
            "message": "Subscription lifecycle tables and payment policy are not provisioned.",
        },
    )
