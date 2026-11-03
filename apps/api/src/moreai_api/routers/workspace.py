from __future__ import annotations

import hashlib
import json
import re
from urllib.parse import quote

import httpx
from datetime import datetime, timedelta, timezone
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field

from moreai_api.auth import require_authenticated_user
from moreai_api.db import insert_rows, rpc, select_rows, update_rows
from moreai_api.routers.llm import GenerateRequest, _generate
from moreai_api.settings import settings

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

    scope_key = f"workspace.chat:{user_id}:{conversation_id}"
    idempotency_token = hashlib.sha256(idempotency_key.encode()).hexdigest()
    request_hash = hashlib.sha256(
        json.dumps(
            {
                "content": payload.content,
                "model": payload.model,
                "max_output_tokens": payload.max_output_tokens,
            },
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
        ).encode("utf-8")
    ).hexdigest()
    claim = await rpc(
        "moreai_workspace_claim_chat_idempotency",
        {
            "p_scope_key": scope_key,
            "p_idempotency_key": idempotency_token,
            "p_request_hash": request_hash,
            "p_expires_at": (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat(),
        },
    )
    claim_state = claim.get("state") if isinstance(claim, dict) else None
    if claim_state == "conflict":
        raise HTTPException(
            status_code=409,
            detail={
                "code": "IDEMPOTENCY_KEY_REUSED",
                "message": "Idempotency key was already used for a different request.",
            },
        )
    if claim_state == "completed":
        cached = claim.get("response_body")
        if not isinstance(cached, dict):
            raise HTTPException(status_code=503, detail={"code": "IDEMPOTENCY_RESPONSE_INVALID"})
        return {**cached, "replayed": True}
    if claim_state not in {"claimed", "processing"}:
        raise HTTPException(status_code=503, detail={"code": "CHAT_IDEMPOTENCY_UNAVAILABLE"})

    request_key = f"chat:{conversation_id}:{idempotency_token}"
    existing = await select_rows(
        "conversation_messages",
        "select=id,role,content,model_key,token_input,token_output,created_at,metadata"
        f"&conversation_id=eq.{conversation_id}&user_id=eq.{user_id}"
        f"&metadata->>request_key=eq.{request_key}&order=created_at.asc&limit=2",
    )
    existing_user = next((item for item in existing if item.get("role") == "user"), None)
    existing_assistant = next((item for item in existing if item.get("role") == "assistant"), None)
    if existing_user:
        existing_metadata = (
            existing_user.get("metadata") if isinstance(existing_user.get("metadata"), dict) else {}
        )
        if existing_metadata.get("request_hash") != request_hash:
            raise HTTPException(
                status_code=409,
                detail={"code": "IDEMPOTENCY_KEY_REUSED"},
            )
    if existing_user and existing_assistant:
        response_body = {
            "user_message": existing_user,
            "assistant_message": existing_assistant,
            "replayed": False,
        }
        await rpc(
            "moreai_workspace_finish_chat_idempotency",
            {
                "p_scope_key": scope_key,
                "p_idempotency_key": idempotency_token,
                "p_request_hash": request_hash,
                "p_response_body": response_body,
                "p_success": True,
            },
        )
        return {**response_body, "replayed": True}
    if claim_state == "processing":
        raise HTTPException(
            status_code=409,
            detail={"code": "IDEMPOTENCY_REQUEST_IN_PROGRESS"},
            headers={"Retry-After": "2"},
        )

    try:
        history_rows = await select_rows(
            "conversation_messages",
            "select=role,content,metadata"
            f"&conversation_id=eq.{conversation_id}&user_id=eq.{user_id}"
            "&role=in.(user,assistant)&order=created_at.desc&limit=12",
        )
        user_rows = (
            [existing_user]
            if existing_user
            else await insert_rows(
                "conversation_messages",
                {
                    "conversation_id": str(conversation_id),
                    "user_id": user_id,
                    "role": "user",
                    "content": payload.content,
                    "metadata": {"request_key": request_key, "request_hash": request_hash},
                },
            )
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
            "Recent conversation context:\\n"
            + "\\n".join(context_lines)
            + "\\n\\nCurrent user message:\\n"
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
                    "request_hash": request_hash,
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
        response_body = {
            "user_message": user_rows[0],
            "assistant_message": assistant_rows[0],
            "replayed": False,
        }
        finalized = await rpc(
            "moreai_workspace_finish_chat_idempotency",
            {
                "p_scope_key": scope_key,
                "p_idempotency_key": idempotency_token,
                "p_request_hash": request_hash,
                "p_response_body": response_body,
                "p_success": True,
            },
        )
        if finalized is not True:
            raise HTTPException(
                status_code=503, detail={"code": "CHAT_IDEMPOTENCY_FINALIZE_PENDING"}
            )
        return response_body
    except Exception:
        try:
            await rpc(
                "moreai_workspace_finish_chat_idempotency",
                {
                    "p_scope_key": scope_key,
                    "p_idempotency_key": idempotency_token,
                    "p_request_hash": request_hash,
                    "p_response_body": {},
                    "p_success": False,
                },
            )
        except Exception:
            pass
        raise


@router.get("/files")
async def list_workspace_files(claims: Claims, limit: int = 50):
    user_id = _user_id(claims)
    return {
        "items": [
            {
                **item,
                "file_name": str(item["storage_path"]).rsplit("/", 1)[-1],
            }
            for item in await select_rows(
                "artifacts",
                "select=id,workspace_id,run_id,storage_path,mime_type,size_bytes,checksum_sha256,metadata,created_at"
                f"&user_id=eq.{user_id}&order=created_at.desc&limit={max(1, min(limit, 100))}",
            )
        ]
    }


@router.get("/files/{artifact_id}/download")
async def create_workspace_file_download(artifact_id: UUID, claims: Claims):
    user_id = _user_id(claims)
    rows = await select_rows(
        "artifacts",
        f"select=id,storage_path&id=eq.{artifact_id}&user_id=eq.{user_id}&limit=1",
    )
    if not rows:
        raise HTTPException(status_code=404, detail={"code": "ARTIFACT_NOT_FOUND"})
    artifact = rows[0]
    service_key = settings.supabase_secret_key
    bucket_name = settings.workspace_artifacts_bucket
    if not service_key or not settings.supabase_url or not bucket_name:
        raise HTTPException(status_code=503, detail={"code": "STORAGE_SIGNING_UNAVAILABLE"})
    bucket = quote(bucket_name, safe="")
    object_key = quote(str(artifact["storage_path"]), safe="/")
    base_url = settings.supabase_url.rstrip("/")
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                f"{base_url}/storage/v1/object/sign/{bucket}/{object_key}",
                headers={"apikey": service_key, "Authorization": f"Bearer {service_key}"},
                json={"expiresIn": 300},
            )
            response.raise_for_status()
            signed = response.json()
    except (httpx.HTTPError, ValueError) as exc:
        raise HTTPException(
            status_code=503, detail={"code": "STORAGE_SIGNING_UNAVAILABLE"}
        ) from exc
    signed_url = signed.get("signedURL") if isinstance(signed, dict) else None
    if not isinstance(signed_url, str) or not signed_url:
        raise HTTPException(status_code=503, detail={"code": "STORAGE_SIGNING_UNAVAILABLE"})
    if signed_url.startswith("/"):
        signed_url = f"{base_url}/storage/v1{signed_url}"
    separator = "&" if "?" in signed_url else "?"
    signed_url = f"{signed_url}{separator}download="
    return {
        "url": signed_url,
        "expires_in": 300,
        "file_name": str(artifact["storage_path"]).rsplit("/", 1)[-1],
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
