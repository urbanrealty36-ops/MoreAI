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
        "id,partner_id,location_id,name,ssid_label,gateway_type,gateway_network_ref,active_verification_method,status,created_at",
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
    network = next(
        (item for item in networks["items"] if item["id"] == str(network_id)),
        None,
    )
    if not network:
        raise HTTPException(status_code=404, detail="Network not found")
    catalog = await select_rows(
        "network_verification_method_catalog",
        "select=method_key,enabled,adapter_ready&method_key=eq." + payload.method_key,
    )
    if not catalog or not catalog[0]["enabled"]:
        raise HTTPException(
            status_code=409,
            detail={
                "code": "VERIFICATION_METHOD_NOT_AVAILABLE",
                "message": "This method is not enabled by platform operations.",
            },
        )
    allowed_config_keys = {
        "gps": {"radius_meters", "max_accuracy_meters"},
        "mikrotik_hotspot": {"gateway_id", "router_label", "hotspot_profile"},
        "radius": {"nas_identifier", "accounting_interval_seconds"},
        "gateway": {"controller_label"},
        "isp_api": {"provider_code"},
    }
    if set(payload.config_public) - allowed_config_keys[payload.method_key]:
        raise HTTPException(
            status_code=422,
            detail={
                "code": "UNSUPPORTED_PUBLIC_CONFIG_FIELD",
                "message": "Only documented non-secret configuration fields are accepted.",
            },
        )
    if (
        payload.method_key == "mikrotik_hotspot"
        and not str(payload.config_public.get("gateway_id", "")).strip()
    ):
        raise HTTPException(
            status_code=422,
            detail={
                "code": "MIKROTIK_GATEWAY_ID_REQUIRED",
                "message": "Gateway ID is required for MikroTik Hotspot.",
            },
        )
    if any(
        not isinstance(value, (str, int, float, bool)) or len(str(value)) > 160
        for value in payload.config_public.values()
    ):
        raise HTTPException(
            status_code=422,
            detail={
                "code": "INVALID_PUBLIC_CONFIG",
                "message": "Configuration values must be short scalar values.",
            },
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
        "message": (
            "Method selected. Integration remains inactive until adapter readiness "
            "and production credentials are verified."
        ),
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


# Partner operational mutations. All writes are scoped to the authenticated membership.
class BranchCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str = Field(min_length=1, max_length=120)
    address: dict[str, Any] = Field(default_factory=dict)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    timezone: str = Field(default="Asia/Jakarta", min_length=1, max_length=64)


class BranchUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str | None = Field(default=None, min_length=1, max_length=120)
    address: dict[str, Any] | None = None
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    timezone: str | None = Field(default=None, min_length=1, max_length=64)
    status: Literal["active", "inactive", "suspended"] | None = None


class NetworkCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    location_id: UUID
    name: str = Field(min_length=1, max_length=120)
    ssid_label: str | None = Field(default=None, max_length=120)
    gateway_type: str = Field(min_length=1, max_length=64)
    provider_id: UUID | None = None
    gateway_network_ref: str | None = Field(default=None, max_length=160)


class NetworkUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str | None = Field(default=None, min_length=1, max_length=120)
    ssid_label: str | None = Field(default=None, max_length=120)
    gateway_network_ref: str | None = Field(default=None, max_length=160)
    status: Literal["pending", "active", "inactive", "suspended"] | None = None


class CampaignCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str = Field(min_length=1, max_length=160)
    location_id: UUID | None = None
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    budget: float | None = Field(default=None, ge=0)
    config: dict[str, Any] = Field(default_factory=dict)


class CampaignUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str | None = Field(default=None, min_length=1, max_length=160)
    location_id: UUID | None = None
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    budget: float | None = Field(default=None, ge=0)
    config: dict[str, Any] | None = None
    status: Literal["draft", "paused", "cancelled"] | None = None


class RewardCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    campaign_id: UUID
    reward_type: Literal["credit", "discount", "access", "voucher", "benefit"]
    name: str = Field(min_length=1, max_length=160)
    quantity_limit: int | None = Field(default=None, ge=0)
    reward_value: float | None = Field(default=None, ge=0)
    config: dict[str, Any] = Field(default_factory=dict)


class RewardUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str | None = Field(default=None, min_length=1, max_length=160)
    quantity_limit: int | None = Field(default=None, ge=0)
    reward_value: float | None = Field(default=None, ge=0)
    config: dict[str, Any] | None = None


async def _require_partner_roles(
    memberships: list[dict[str, Any]], roles: set[str]
) -> None:
    if not any(item.get("role_key") in roles for item in memberships):
        raise HTTPException(
            status_code=403,
            detail={"code": "PARTNER_OPERATION_FORBIDDEN", "message": "Your partner role cannot perform this operation."},
        )


async def _ensure_location_scope(
    memberships: list[dict[str, Any]], partner_id: str, location_id: UUID
) -> dict[str, Any]:
    allowed = any(
        item.get("location_id") is None or item.get("location_id") == str(location_id)
        for item in memberships
    )
    if not allowed:
        raise HTTPException(status_code=404, detail="Branch not found")
    rows = await select_rows(
        "partner_locations",
        f"select=id,partner_id,name,status&id=eq.{location_id}&partner_id=eq.{partner_id}",
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Branch not found")
    return rows[0]


async def _audit_partner_mutation(
    claims: dict[str, Any], partner_id: str, action: str, resource_type: str, resource_id: str
) -> None:
    actor = str(UUID(str(claims.get("sub", ""))))
    await insert_rows(
        "admin_audit_logs",
        {
            "actor_user_id": actor,
            "action": action,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "scope_type": "partner",
            "scope_id": partner_id,
            "outcome": "success",
            "metadata": {},
        },
    )


@router.post("/branches", status_code=201)
async def create_branch(claims: UserClaims, payload: BranchCreate):
    membership, memberships = await _membership(claims)
    await _require_partner_roles(memberships, {"partner_owner", "partner_admin"})
    created = await insert_rows(
        "partner_locations",
        {"partner_id": membership["partner_id"], **payload.model_dump()},
    )
    if not created:
        raise HTTPException(status_code=502, detail="Branch could not be created")
    await _audit_partner_mutation(claims, membership["partner_id"], "partner.branch.created", "partner_location", created[0]["id"])
    return {"item": created[0]}


@router.patch("/branches/{branch_id}")
async def update_branch(claims: UserClaims, branch_id: UUID, payload: BranchUpdate):
    membership, memberships = await _membership(claims)
    await _require_partner_roles(memberships, {"partner_owner", "partner_admin"})
    await _ensure_location_scope(memberships, membership["partner_id"], branch_id)
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=422, detail="At least one field is required")
    changes["updated_at"] = datetime.now(timezone.utc).isoformat()
    rows = await update_rows("partner_locations", f"id=eq.{branch_id}&partner_id=eq.{membership['partner_id']}", changes)
    if not rows:
        raise HTTPException(status_code=404, detail="Branch not found")
    await _audit_partner_mutation(claims, membership["partner_id"], "partner.branch.updated", "partner_location", str(branch_id))
    return {"item": rows[0]}


@router.post("/networks", status_code=201)
async def create_network(claims: UserClaims, payload: NetworkCreate):
    membership, memberships = await _membership(claims)
    await _require_partner_roles(memberships, {"partner_owner", "partner_admin", "location_manager"})
    await _ensure_location_scope(memberships, membership["partner_id"], payload.location_id)
    created = await insert_rows(
        "partner_networks",
        {"partner_id": membership["partner_id"], **payload.model_dump(mode="json")},
    )
    if not created:
        raise HTTPException(status_code=502, detail="Network could not be created")
    await _audit_partner_mutation(claims, membership["partner_id"], "partner.network.created", "partner_network", created[0]["id"])
    return {"item": created[0]}


@router.patch("/networks/{network_id}")
async def update_network(claims: UserClaims, network_id: UUID, payload: NetworkUpdate):
    membership, memberships = await _membership(claims)
    await _require_partner_roles(memberships, {"partner_owner", "partner_admin", "location_manager"})
    networks = await list_networks(claims)
    network = next((item for item in networks["items"] if item["id"] == str(network_id)), None)
    if not network:
        raise HTTPException(status_code=404, detail="Network not found")
    if any(item.get("role_key") == "location_manager" for item in memberships):
        await _ensure_location_scope(memberships, membership["partner_id"], UUID(network["location_id"]))
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=422, detail="At least one field is required")
    changes["updated_at"] = datetime.now(timezone.utc).isoformat()
    rows = await update_rows("partner_networks", f"id=eq.{network_id}&partner_id=eq.{membership['partner_id']}", changes)
    if not rows:
        raise HTTPException(status_code=404, detail="Network not found")
    await _audit_partner_mutation(claims, membership["partner_id"], "partner.network.updated", "partner_network", str(network_id))
    return {"item": rows[0]}


@router.post("/campaigns", status_code=201)
async def create_campaign(claims: UserClaims, payload: CampaignCreate):
    membership, memberships = await _membership(claims)
    await _require_partner_roles(memberships, {"partner_owner", "partner_admin"})
    data = payload.model_dump(mode="json")
    if payload.location_id:
        await _ensure_location_scope(memberships, membership["partner_id"], payload.location_id)
    if payload.starts_at and payload.ends_at and payload.ends_at <= payload.starts_at:
        raise HTTPException(status_code=422, detail="Campaign end must be after start")
    created = await insert_rows(
        "partner_campaigns",
        {"partner_id": membership["partner_id"], "created_by": str(UUID(str(claims["sub"]))), **data},
    )
    if not created:
        raise HTTPException(status_code=502, detail="Campaign could not be created")
    await _audit_partner_mutation(claims, membership["partner_id"], "partner.campaign.created", "partner_campaign", created[0]["id"])
    return {"item": created[0]}


@router.patch("/campaigns/{campaign_id}")
async def update_campaign(claims: UserClaims, campaign_id: UUID, payload: CampaignUpdate):
    membership, memberships = await _membership(claims)
    await _require_partner_roles(memberships, {"partner_owner", "partner_admin"})
    current = await select_rows("partner_campaigns", f"select=id,status,location_id,starts_at,ends_at&partner_id=eq.{membership['partner_id']}&id=eq.{campaign_id}")
    if not current:
        raise HTTPException(status_code=404, detail="Campaign not found")
    changes = payload.model_dump(exclude_unset=True, mode="json")
    if "location_id" in changes and changes["location_id"]:
        await _ensure_location_scope(memberships, membership["partner_id"], UUID(changes["location_id"]))
    starts = changes.get("starts_at", current[0].get("starts_at"))
    ends = changes.get("ends_at", current[0].get("ends_at"))
    if starts and ends and datetime.fromisoformat(ends.replace("Z", "+00:00")) <= datetime.fromisoformat(starts.replace("Z", "+00:00")):
        raise HTTPException(status_code=422, detail="Campaign end must be after start")
    if current[0]["status"] != "draft" and any(key in changes for key in {"name", "location_id", "starts_at", "ends_at", "budget", "config"}):
        raise HTTPException(status_code=409, detail="Only draft campaigns can change configuration")
    if not changes:
        raise HTTPException(status_code=422, detail="At least one field is required")
    changes["updated_at"] = datetime.now(timezone.utc).isoformat()
    rows = await update_rows("partner_campaigns", f"id=eq.{campaign_id}&partner_id=eq.{membership['partner_id']}", changes)
    if not rows:
        raise HTTPException(status_code=404, detail="Campaign not found")
    await _audit_partner_mutation(claims, membership["partner_id"], "partner.campaign.updated", "partner_campaign", str(campaign_id))
    return {"item": rows[0]}


@router.post("/rewards", status_code=201)
async def create_reward(claims: UserClaims, payload: RewardCreate):
    membership, memberships = await _membership(claims)
    await _require_partner_roles(memberships, {"partner_owner", "partner_admin"})
    campaign = await select_rows("partner_campaigns", f"select=id,status&partner_id=eq.{membership['partner_id']}&id=eq.{payload.campaign_id}")
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    if campaign[0]["status"] != "draft":
        raise HTTPException(status_code=409, detail="Rewards can only be added to draft campaigns")
    created = await insert_rows("campaign_rewards", payload.model_dump(mode="json"))
    if not created:
        raise HTTPException(status_code=502, detail="Reward could not be created")
    await _audit_partner_mutation(claims, membership["partner_id"], "partner.reward.created", "campaign_reward", created[0]["id"])
    return {"item": created[0]}


@router.patch("/rewards/{reward_id}")
async def update_reward(claims: UserClaims, reward_id: UUID, payload: RewardUpdate):
    membership, memberships = await _membership(claims)
    await _require_partner_roles(memberships, {"partner_owner", "partner_admin"})
    rewards = await select_rows(
        "campaign_rewards",
        f"select=id,campaign_id,quantity_claimed,quantity_limit&campaign_id=in.({','.join(x['id'] for x in await _partner_rows('partner_campaigns', 'id', membership['partner_id']))})&id=eq.{reward_id}",
    )
    if not rewards:
        raise HTTPException(status_code=404, detail="Reward not found")
    changes = payload.model_dump(exclude_unset=True, mode="json")
    if not changes:
        raise HTTPException(status_code=422, detail="At least one field is required")
    if "quantity_limit" in changes and changes["quantity_limit"] is not None and changes["quantity_limit"] < rewards[0]["quantity_claimed"]:
        raise HTTPException(status_code=409, detail="Quantity limit cannot be lower than claims already issued")
    changes["updated_at"] = datetime.now(timezone.utc).isoformat()
    rows = await update_rows("campaign_rewards", f"id=eq.{reward_id}", changes)
    if not rows:
        raise HTTPException(status_code=404, detail="Reward not found")
    await _audit_partner_mutation(claims, membership["partner_id"], "partner.reward.updated", "campaign_reward", str(reward_id))
    return {"item": rows[0]}
