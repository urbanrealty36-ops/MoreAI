from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field

from moreai_api.auth import require_authenticated_user
from moreai_api.db import rpc, select_rows

router = APIRouter(prefix="/credits", tags=["credits"])
Claims = Annotated[dict, Depends(require_authenticated_user)]


class ReservationRequest(BaseModel):
    amount: float = Field(gt=0, le=1_000_000)
    run_id: UUID | None = None
    ttl_seconds: int = Field(default=900, ge=1, le=86400)


@router.post("/reservations")
async def reserve_credits(
    payload: ReservationRequest,
    claims: Claims,
    idempotency_key: Annotated[str | None, Header(alias="Idempotency-Key")] = None,
):
    user_id = claims.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    if not idempotency_key or not idempotency_key.strip() or len(idempotency_key) > 200:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "IDEMPOTENCY_KEY_REQUIRED",
                "message": "Provide a valid Idempotency-Key header.",
            },
        )
    wallets = await select_rows(
        "wallet_accounts",
        f"select=id,owner_type,owner_id,status&owner_type=eq.user&owner_id=eq.{user_id}&status=eq.active&limit=1",
    )
    if not wallets:
        raise HTTPException(
            status_code=409,
            detail={
                "code": "CREDIT_WALLET_NOT_CONFIGURED",
                "message": "No active credit wallet is configured for this account.",
            },
        )
    result = await rpc(
        "moreai_credit_reserve",
        {
            "p_wallet_id": wallets[0]["id"],
            "p_user_id": user_id,
            "p_amount": payload.amount,
            "p_idempotency_key": idempotency_key,
            "p_run_id": str(payload.run_id) if payload.run_id else None,
            "p_ttl_seconds": payload.ttl_seconds,
        },
    )
    return result


@router.post("/reservations/{reservation_id}/release")
async def release_credits(
    reservation_id: UUID,
    claims: Claims,
    idempotency_key: Annotated[str | None, Header(alias="Idempotency-Key")] = None,
):
    user_id = claims.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    if not idempotency_key or not idempotency_key.strip() or len(idempotency_key) > 200:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "IDEMPOTENCY_KEY_REQUIRED",
                "message": "Provide a valid Idempotency-Key header.",
            },
        )
    rows = await select_rows(
        "credit_reservations",
        f"select=id,user_id,status&id=eq.{reservation_id}&user_id=eq.{user_id}&limit=1",
    )
    if not rows:
        raise HTTPException(
            status_code=404,
            detail={"code": "RESERVATION_NOT_FOUND", "message": "Credit reservation not found."},
        )
    return await rpc(
        "moreai_credit_release",
        {"p_reservation_id": str(reservation_id), "p_idempotency_key": idempotency_key},
    )
