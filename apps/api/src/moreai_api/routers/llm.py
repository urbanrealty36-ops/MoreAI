from __future__ import annotations

import time
from decimal import Decimal
from typing import Annotated
from uuid import uuid4

import httpx
from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field

from moreai_api.auth import require_authenticated_user
from moreai_api.db import insert_rows, rpc, select_rows
from moreai_api.settings import settings

router = APIRouter(prefix="/llm", tags=["llm"])
MODEL_PATTERN = re.compile(r"^[a-zA-Z0-9._:-]{1,120}$")


class GenerateRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=12000)
    model: str | None = Field(default=None, max_length=120)
    max_output_tokens: int = Field(default=2048, ge=1, le=4096)


class GenerateResponse(BaseModel):
    text: str
    model: str
    provider: str
    request_id: str
    usage: dict[str, int]


def _cost(tokens_in: int, tokens_out: int, model: dict) -> Decimal:
    return (
        Decimal(tokens_in) * Decimal(str(model["input_cost_per_million"])) / Decimal(1_000_000)
        + Decimal(tokens_out) * Decimal(str(model["output_cost_per_million"])) / Decimal(1_000_000)
    )


async def _route_model(requested_model: str | None) -> dict:
    policies = await select_rows(
        "llm_routing_policies",
        "select=model_id,fallback_model_id,model:llm_models(key,input_cost_per_million,output_cost_per_million,enabled,provider:llm_providers(key,enabled))"
        "&scope_type=eq.platform&scope_id=is.null&task_type=eq.general&enabled=eq.true&order=priority.asc&limit=10",
    )
    candidates = []
    for policy in policies:
        model = policy.get("model") or {}
        provider = model.get("provider") or {}
        if model.get("enabled") and provider.get("enabled") and provider.get("key") == "google":
            candidates.append(model)
    if requested_model:
        candidates = [item for item in candidates if item.get("key") == requested_model]
    if not candidates:
        raise HTTPException(status_code=503, detail={"code": "LLM_ROUTE_UNAVAILABLE", "message": "No enabled provider/model route is configured."})
    return candidates[0]


@router.post("/generate", response_model=GenerateResponse)
async def generate(
    payload: GenerateRequest,
    claims: Annotated[dict, Depends(require_authenticated_user)],
    idempotency_key: Annotated[str | None, Header(alias="Idempotency-Key")] = None,
) -> GenerateResponse:
    user_id = claims.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    if not idempotency_key or not idempotency_key.strip() or len(idempotency_key) > 200:
        raise HTTPException(status_code=400, detail={"code": "IDEMPOTENCY_KEY_REQUIRED", "message": "Provide a valid Idempotency-Key header."})
    if not settings.credits_per_usd or settings.credits_per_usd <= 0:
        raise HTTPException(status_code=503, detail={"code": "CREDIT_CONVERSION_NOT_CONFIGURED", "message": "Credit conversion must be explicitly configured before model usage is enabled."})
    api_key = settings.llm_provider_api_key
    if not api_key:
        raise HTTPException(status_code=503, detail={"code": "LLM_PROVIDER_NOT_CONFIGURED", "message": "LLM provider credentials are not configured."})

    model = await _route_model(payload.model)
    request_id = str(uuid4())
    input_tokens_estimate = max(1, (len(payload.prompt) + 3) // 4)
    estimated_cost = _cost(input_tokens_estimate, payload.max_output_tokens, model)
    reserve_amount = (estimated_cost * settings.credits_per_usd).quantize(Decimal("0.000001"))
    if reserve_amount <= 0:
        raise HTTPException(status_code=503, detail={"code": "MODEL_PRICING_NOT_CONFIGURED", "message": "Model pricing must be configured before routing."})

    wallets = await select_rows("wallet_accounts", f"select=id&owner_type=eq.user&owner_id=eq.{user_id}&status=eq.active&limit=1")
    if not wallets:
        raise HTTPException(status_code=409, detail={"code": "CREDIT_WALLET_NOT_CONFIGURED", "message": "No active credit wallet is configured."})
    reservation = await rpc("moreai_credit_reserve", {
        "p_wallet_id": wallets[0]["id"], "p_user_id": user_id,
        "p_amount": float(reserve_amount), "p_idempotency_key": f"llm:{idempotency_key}",
        "p_run_id": None, "p_ttl_seconds": 300,
    })
    reservation_id = reservation.get("reservation_id") if isinstance(reservation, dict) else None
    if not reservation_id:
        raise HTTPException(status_code=502, detail={"code": "CREDIT_RESERVATION_FAILED", "message": "Credit reservation did not return a reservation identifier."})

    started = time.monotonic()
    provider_key = "google"
    model_key = model["key"]
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_key}:generateContent"
        body = {"contents": [{"role": "user", "parts": [{"text": payload.prompt}]}], "generationConfig": {"maxOutputTokens": payload.max_output_tokens}}
        async with httpx.AsyncClient(timeout=httpx.Timeout(45.0, connect=5.0)) as client:
            response = await client.post(url, headers={"x-goog-api-key": api_key}, json=body)
            response.raise_for_status()
            data = response.json()
        text = "".join(part["text"] for candidate in data.get("candidates", [])[:1] for part in candidate.get("content", {}).get("parts", []) if isinstance(part.get("text"), str))
        if not text:
            raise ValueError("empty provider response")
        usage_meta = data.get("usageMetadata", {})
        input_tokens = int(usage_meta.get("promptTokenCount", input_tokens_estimate))
        output_tokens = int(usage_meta.get("candidatesTokenCount", max(1, (len(text) + 3) // 4)))
        actual_cost = _cost(input_tokens, output_tokens, model)
        actual_credits = (actual_cost * settings.credits_per_usd).quantize(Decimal("0.000001"))
        await rpc("moreai_credit_settle", {"p_reservation_id": reservation_id, "p_actual_amount": float(actual_credits), "p_idempotency_key": f"llm-settle:{idempotency_key}"})
        await insert_rows("llm_usage", {
            "user_id": user_id, "provider_key": provider_key, "model_key": model_key,
            "request_id": request_id, "input_tokens": input_tokens, "output_tokens": output_tokens,
            "estimated_cost": str(estimated_cost), "actual_cost": str(actual_cost),
            "status": "succeeded", "idempotency_key": f"llm-usage:{idempotency_key}",
            "latency_ms": int((time.monotonic() - started) * 1000),
        })
        return GenerateResponse(text=text, model=model_key, provider=provider_key, request_id=request_id, usage={"input_tokens": input_tokens, "output_tokens": output_tokens})
    except (httpx.HTTPError, ValueError, KeyError, TypeError) as exc:
        await rpc("moreai_credit_release", {"p_reservation_id": reservation_id, "p_idempotency_key": f"llm-release:{idempotency_key}"})
        raise HTTPException(status_code=502, detail={"code": "LLM_PROVIDER_ERROR", "message": "Model provider request failed; reserved credits were released."}) from exc
