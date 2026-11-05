import hashlib
import time
from datetime import datetime, timezone
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field

from moreai_api.auth import require_authenticated_user
from moreai_api.db import rpc, select_rows
from moreai_api.gateway import (
    gateway_secret_bundle,
    valid_gateway_timestamp,
    valid_ip_address,
    valid_mac_address,
    valid_nonce,
    verify_gateway_signature,
    verify_mikrotik_active_session,
)
from moreai_api.settings import settings

router = APIRouter(prefix="/network", tags=["network-access"])
UserClaims = Annotated[dict, Depends(require_authenticated_user)]


class MikroTikGatewayContext(BaseModel):
    model_config = ConfigDict(extra="forbid")

    network_id: UUID
    gateway_id: str = Field(min_length=1, max_length=128)
    session_id: str = Field(min_length=1, max_length=256)
    client_mac: str
    client_ip: str
    username: str = Field(min_length=1, max_length=128)
    hotspot_server: str = Field(min_length=1, max_length=128)
    timestamp: int
    nonce: str = Field(min_length=22, max_length=128)
    signature: str = Field(pattern=r"^(?:sha256=)?[a-fA-F0-9]{64}$")


class AccessVerificationRequest(BaseModel):
    network_id: str = Field(min_length=1, max_length=128)
    access_code: str | None = Field(default=None, max_length=128)
    gateway_session_id: str | None = Field(default=None, max_length=256)


def _unavailable() -> None:
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail={
            "code": "NETWORK_GATEWAY_NOT_CONFIGURED",
            "message": (
                "No verified captive-gateway integration is configured. "
                "Access and rewards were not activated."
            ),
        },
    )


@router.post("/gateway/mikrotik/context/verify")
async def verify_mikrotik_gateway_context(payload: MikroTikGatewayContext):
    now = int(time.time())
    if not valid_gateway_timestamp(
        payload.timestamp,
        now,
        settings.network_gateway_max_clock_skew_seconds,
    ):
        raise HTTPException(
            status_code=401,
            detail={
                "code": "GATEWAY_CONTEXT_EXPIRED",
                "message": "Gateway context is expired.",
            },
        )
    if (
        not valid_nonce(payload.nonce)
        or not valid_mac_address(payload.client_mac)
        or not valid_ip_address(payload.client_ip)
    ):
        raise HTTPException(
            status_code=422,
            detail={
                "code": "GATEWAY_CONTEXT_INVALID",
                "message": "Gateway context fields are invalid.",
            },
        )

    networks = await select_rows(
        "partner_networks",
        "select=id,partner_id,location_id,active_verification_method&id=eq."
        + str(payload.network_id),
    )
    if not networks or networks[0].get("active_verification_method") != "mikrotik_hotspot":
        raise HTTPException(
            status_code=409,
            detail={
                "code": "GATEWAY_METHOD_NOT_SELECTED",
                "message": ("MikroTik is not the selected verification method for this network."),
            },
        )

    configs = await select_rows(
        "network_verification_configs",
        "select=id,method_key,config_public,secret_reference,enabled&network_id=eq."
        + str(payload.network_id)
        + "&method_key=eq.mikrotik_hotspot&enabled=eq.true",
    )
    catalog = await select_rows(
        "network_verification_method_catalog",
        "select=enabled,adapter_ready&method_key=eq.mikrotik_hotspot",
    )
    if (
        not configs
        or not catalog
        or not catalog[0].get("enabled")
        or not catalog[0].get("adapter_ready")
    ):
        raise HTTPException(
            status_code=503,
            detail={
                "code": "GATEWAY_ADAPTER_NOT_READY",
                "message": ("MikroTik integration is not production-ready for this network."),
            },
        )

    config = configs[0]
    if (config.get("config_public") or {}).get("gateway_id") != payload.gateway_id:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "GATEWAY_NETWORK_MISMATCH",
                "message": "Gateway is not bound to this network.",
            },
        )
    bundle = gateway_secret_bundle(config.get("secret_reference"))
    signed_payload = payload.model_dump(mode="json", exclude={"signature"})
    if not verify_gateway_signature(
        signed_payload,
        payload.signature,
        str(bundle.get("hmac_secret", "")),
    ):
        raise HTTPException(
            status_code=401,
            detail={
                "code": "GATEWAY_SIGNATURE_INVALID",
                "message": "Gateway signature is invalid.",
            },
        )
    if not await verify_mikrotik_active_session(
        bundle,
        payload.model_dump(mode="json"),
    ):
        raise HTTPException(
            status_code=403,
            detail={
                "code": "MIKROTIK_SESSION_NOT_ACTIVE",
                "message": "RouterOS does not confirm the active hotspot session.",
            },
        )

    nonce_hash = hashlib.sha256(payload.nonce.encode("utf-8")).hexdigest()
    consumed = await rpc(
        "consume_network_gateway_nonce",
        {
            "p_network_id": str(payload.network_id),
            "p_nonce_hash": nonce_hash,
            "p_expires_at": datetime.fromtimestamp(
                payload.timestamp + settings.network_gateway_max_clock_skew_seconds,
                tz=timezone.utc,
            ).isoformat(),
        },
    )
    if consumed is not True:
        raise HTTPException(
            status_code=409,
            detail={
                "code": "GATEWAY_CONTEXT_REPLAYED",
                "message": "Gateway context nonce was already used or expired.",
            },
        )

    return {
        "verified": True,
        "method": "mikrotik_hotspot",
        "network_id": str(payload.network_id),
        "partner_id": networks[0]["partner_id"],
        "location_id": networks[0]["location_id"],
        "gateway_session_id": payload.session_id,
        "client_mac": payload.client_mac.lower(),
        "verified_at": now,
        "partner_entitlement_activated": False,
        "message": (
            "Gateway session proof verified. Partner benefit requires a separate "
            "entitlement policy decision."
        ),
    }


@router.get("/portal-context")
async def portal_context(_: UserClaims):
    _unavailable()


@router.post("/access/verify")
async def verify_network_access(_: UserClaims, payload: AccessVerificationRequest):
    del payload
    _unavailable()


@router.get("/access/session")
async def access_session(_: UserClaims):
    _unavailable()


@router.post("/access/session/refresh")
async def refresh_access_session(_: UserClaims):
    _unavailable()


@router.post("/access/session/end")
async def end_access_session(_: UserClaims):
    _unavailable()
