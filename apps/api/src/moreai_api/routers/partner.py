from __future__ import annotations

from datetime import datetime, timezone
from typing import Annotated, Any, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field

from moreai_api.auth import require_authenticated_user
from moreai_api.db import select_rows, rpc

router = APIRouter(prefix="/partner", tags=["partner-portal"])
UserClaims = Annotated[dict, Depends(require_authenticated_user)]


class VerificationMethodSelection(BaseModel):
    model_config = ConfigDict(extra="forbid")
    method_key: Literal["gps", "mikrotik_hotspot", "radius", "gateway", "isp_api"]
    config_public: dict[str, Any] = Field(default_factory=dict)


async def _membership(claims: dict[str, Any]) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    try:
        user_id = str(UUID(str(claims.get("sub", ""))))
    except (ValueError, TypeError, AttributeError) as exc:
        raise HTTPException(status_code=401, detail="Invalid authenticated subject") from exc
    memberships = await select_rows(
        "partner_members",
        f"select=id,partner_id,location_id,role_key,status&user_id=eq.{user_id}&status=eq.active",
    )
    if not memberships:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "PARTNER_MEMBERSHIP_REQUIRED",
                "message": "Active partner membership required.",
            },
        )
    if len({m["partner_id"] for m in memberships}) != 1:
        raise HTTPException(
            status_code=409,
            detail={
                "code": "PARTNER_CONTEXT_AMBIGUOUS",
                "message": "Select a partner context before continuing.",
            },
        )
    return memberships[0], memberships


async def _partner_rows(table: str, fields: str, partner_id: str) -> list[dict[str, Any]]:
    return await select_rows(
        table, f"select={fields}&partner_id=eq.{partner_id}&order=created_at.desc"
    )


@router.get("/me")
async def partner_profile(claims: UserClaims):
    membership, _ = await _membership(claims)
    rows = await select_rows(
        "partner_organizations",
        f"select=id,legal_name,display_name,status,created_at&id=eq.{membership['partner_id']}",
    )
    if not rows:
        raise HTTPException(
            status_code=404,
            detail={"code": "PARTNER_NOT_FOUND", "message": "Partner organization not found."},
        )
    return {"partner": rows[0], "membership": membership}


@router.get("/branches")
async def list_branches(claims: UserClaims):
    membership, memberships = await _membership(claims)
    locations = await _partner_rows(
        "partner_locations",
        "id,partner_id,name,address,latitude,longitude,timezone,status,created_at",
        membership["partner_id"],
    )
    allowed = {m.get("location_id") for m in memberships if m.get("location_id")}
    return {
        "items": locations
        if any(m.get("location_id") is None for m in memberships)
        else [x for x in locations if x["id"] in allowed]
    }


@router.get("/networks")
async def list_networks(claims: UserClaims):
    membership, memberships = await _membership(claims)
    networks = await _partner_rows(
        "partner_networks",
        "id,partner_id,location_id,name,ssid_label,gateway_type,active_verification_method,status,created_at",
        membership["partner_id"],
    )
    allowed = {m.get("location_id") for m in memberships if m.get("location_id")}
    if not any(m.get("location_id") is None for m in memberships):
        networks = [x for x in networks if x["location_id"] in allowed]
    return {"items": networks}


@router.get("/verification-methods")
async def list_verification_methods(claims: UserClaims, network_id: UUID | None = None):
    await _membership(claims)
    networks = await list_networks(claims)
    allowed = {x["id"] for x in networks["items"]}
    if network_id and str(network_id) not in allowed:
        raise HTTPException(status_code=404, detail="Network not found")
    ids = [str(network_id)] if network_id else list(allowed)
    if not ids:
        return {"items": []}
    configs = await select_rows(
        "network_verification_configs",
        "select=id,network_id,method_key,config_public,enabled,policy&network_id=in.("
        + ",".join(ids)
        + ")",
    )
    catalog = await select_rows(
        "network_verification_method_catalog",
        "select=method_key,display_name,enabled,adapter_ready,requires_secret,setup_requirements&order=display_name",
    )
    return {
        "items": configs,
        "methods": catalog,
        "selected_by_network": {
            item["id"]: item.get("active_verification_method")
            for item in networks["items"]
        },
    }


@router.post("/networks/{network_id}/verification-method")
async def select_network_verification_method(
    claims: UserClaims, network_id: UUID, payload: VerificationMethodSelection
):
    networks = await list_networks(claims)
    network = next((item for item in networks["items"] if item["id"] == str(network_id)), None)
    if not network:
        raise HTTPException(status_code=404, detail="Network not found")
    catalog = await select_rows(
        "network_verification_method_catalog",
        "select=method_key,enabled,adapter_ready&method_key=eq." + payload.method_key,
    )
    if not catalog or not catalog[0]["enabled"]:
        raise HTTPException(
            status_code=409,
            detail={"code": "VERIFICATION_METHOD_NOT_AVAILABLE", "message": "This method is not enabled by platform operations."},
        )
    forbidden = {"password", "secret", "token", "api_key", "shared_secret", "credential"}

    def contains_secret_key(value: Any) -> bool:
        if isinstance(value, dict):
            return any(
                any(term in str(key).lower() for term in forbidden)
                or contains_secret_key(nested)
                for key, nested in value.items()
            )
        if isinstance(value, list):
            return any(contains_secret_key(item) for item in value)
        return False

    if contains_secret_key(payload.config_public):
        raise HTTPException(
            status_code=422,
            detail={"code": "SECRET_MUST_NOT_BE_SUBMITTED", "message": "Do not submit credentials in public configuration."},
        )
    result = await rpc(
        "set_network_verification_method",
        {
            "p_network_id": str(network_id),
            "p_method_key": payload.method_key,
            "p_config_public": payload.config_public,
        },
    )
    return {
        **(result if isinstance(result, dict) else {}),
        "activated": False,
        "message": "Method selected. Integration remains inactive until adapter readiness and production credentials are verified.",
    }


@router.get("/campaigns")
async def list_campaigns(claims: UserClaims):
    membership, _ = await _membership(claims)
    return {
        "items": await _partner_rows(
            "partner_campaigns",
            "id,partner_id,location_id,name,status,starts_at,ends_at,budget,config,created_at",
            membership["partner_id"],
        )
    }


@router.get("/rewards")
async def list_rewards(claims: UserClaims):
    membership, _ = await _membership(claims)
    campaigns = await _partner_rows("partner_campaigns", "id", membership["partner_id"])
    ids = [x["id"] for x in campaigns]
    if not ids:
        return {"items": []}
    return {
        "items": await select_rows(
            "campaign_rewards",
            "select=id,campaign_id,reward_type,name,quantity_limit,quantity_claimed,reward_value,config,created_at&campaign_id=in.("
            + ",".join(ids)
            + ")",
        )
    }


@router.get("/analytics")
async def partner_analytics(claims: UserClaims):
    membership, _ = await _membership(claims)
    branches = await _partner_rows("partner_locations", "id", membership["partner_id"])
    networks = await _partner_rows("partner_networks", "id,status", membership["partner_id"])
    campaigns = await _partner_rows("partner_campaigns", "id,status", membership["partner_id"])
    return {
        "branches": len(branches),
        "networks": len(networks),
        "active_networks": sum(x["status"] == "active" for x in networks),
        "campaigns": len(campaigns),
        "active_campaigns": sum(x["status"] == "active" for x in campaigns),
        "as_of": datetime.now(timezone.utc).isoformat(),
    }
