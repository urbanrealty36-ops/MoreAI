from __future__ import annotations

from datetime import datetime, timezone
from typing import Annotated, Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from moreai_api.auth import require_authenticated_user
from moreai_api.db import select_rows

router = APIRouter(prefix="/partner", tags=["partner-portal"])
UserClaims = Annotated[dict, Depends(require_authenticated_user)]


async def _membership(claims: dict[str, Any]) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    user_id = claims.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    memberships = await select_rows(
        "partner_members",
        f"select=id,partner_id,location_id,role_key,status&user_id=eq.{user_id}&status=eq.active",
    )
    if not memberships:
        raise HTTPException(status_code=403, detail={"code": "PARTNER_MEMBERSHIP_REQUIRED", "message": "Active partner membership required."})
    partner_ids = {m["partner_id"] for m in memberships}
    if len(partner_ids) != 1:
        raise HTTPException(status_code=409, detail={"code": "PARTNER_CONTEXT_AMBIGUOUS", "message": "Select a partner context before continuing."})
    return memberships[0], memberships


async def _partner_rows(table: str, fields: str, partner_id: str, extra: str = "") -> list[dict[str, Any]]:
    return await select_rows(table, f"select={fields}&partner_id=eq.{partner_id}{extra}&order=created_at.desc")


@router.get("/me")
async def partner_profile(claims: UserClaims):
    membership, _ = await _membership(claims)
    rows = await select_rows("partner_organizations", f"select=id,legal_name,display_name,status,created_at&id=eq.{membership['partner_id']}")
    if not rows:
        raise HTTPException(status_code=404, detail={"code": "PARTNER_NOT_FOUND", "message": "Partner organization not found."})
    return {"partner": rows[0], "membership": membership}


@router.get("/branches")
async def list_branches(claims: UserClaims):
    membership, memberships = await _membership(claims)
    locations = await _partner_rows("partner_locations", "id,partner_id,name,address,latitude,longitude,timezone,status,created_at", membership["partner_id"])
    allowed = {m.get("location_id") for m in memberships if m.get("location_id")}
    if any(m.get("location_id") is None for m in memberships):
        return {"items": locations}
    return {"items": [x for x in locations if x["id"] in allowed]}


@router.get("/networks")
async def list_networks(claims: UserClaims):
    membership, memberships = await _membership(claims)
    networks = await _partner_rows("partner_networks", "id,partner_id,location_id,name,ssid_label,gateway_type,status,created_at", membership["partner_id"])
    allowed = {m.get("location_id") for m in memberships if m.get("location_id")}
    if not any(m.get("location_id") is None for m in memberships):
        networks = [x for x in networks if x["location_id"] in allowed]
    return {"items": networks}


@router.get("/verification-methods")
async def list_verification_methods(claims: UserClaims, network_id: UUID | None = None):
    membership, memberships = await _membership(claims)
    networks = await list_networks(claims)
    allowed = {x["id"] for x in networks["items"]}
    if network_id and str(network_id) not in allowed:
        raise HTTPException(status_code=404, detail="Network not found")
    ids = [str(network_id)] if network_id else list(allowed)
    if not ids:
        return {"items": []}
    configs = await select_rows("network_verification_configs", "select=id,network_id,method_key,config_public,enabled,policy&network_id=in.(" + ",".join(ids) + ")")
    return {"items": configs}


@router.get("/campaigns")
async def list_campaigns(claims: UserClaims):
    membership, _ = await _membership(claims)
    items = await _partner_rows("partner_campaigns", "id,partner_id,location_id,name,status,starts_at,ends_at,budget,config,created_at", membership["partner_id"])
    return {"items": items}


@router.get("/rewards")
async def list_rewards(claims: UserClaims):
    membership, _ = await _membership(claims)
    campaigns = await _partner_rows("partner_campaigns", "id", membership["partner_id"])
    ids = [x["id"] for x in campaigns]
    if not ids:
        return {"items": []}
    rewards = await select_rows("campaign_rewards", "select=id,campaign_id,reward_type,name,quantity_limit,quantity_claimed,reward_value,config,created_at&campaign_id=in.(" + ",".join(ids) + ")")
    return {"items": rewards}


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
