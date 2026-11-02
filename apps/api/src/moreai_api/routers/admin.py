from __future__ import annotations

from datetime import datetime, timezone
from typing import Annotated, Any, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict

from moreai_api.auth import require_authenticated_user
from moreai_api.db import insert_rows, select_rows, update_rows

router = APIRouter(prefix="/admin", tags=["super-admin"])
UserClaims = Annotated[dict, Depends(require_authenticated_user)]


async def _require_permission(claims: dict[str, Any], permission_key: str) -> None:
    try:
        user_id = str(UUID(str(claims.get("sub", ""))))
    except (ValueError, TypeError, AttributeError) as exc:
        raise HTTPException(status_code=401, detail="Invalid authenticated subject") from exc
    assignments = await select_rows(
        "user_role_assignments",
        f"select=id,role_id,scope_type,scope_id,expires_at,roles!inner(key)&user_id=eq.{user_id}&scope_type=eq.platform",
    )
    role_ids = []
    for item in assignments:
        expires = item.get("expires_at")
        if expires and datetime.fromisoformat(expires.replace("Z", "+00:00")) <= datetime.now(
            timezone.utc
        ):
            continue
        role = item.get("roles") or {}
        if role.get("key") in {
            "super_admin",
            "platform_admin",
            "finance_admin",
            "support_admin",
            "security_admin",
            "partner_manager",
            "read_only_analyst",
        }:
            role_ids.append(item["role_id"])
    if not role_ids:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "ADMIN_PERMISSION_REQUIRED",
                "message": "Platform role assignment required.",
            },
        )
    grants = await select_rows(
        "role_permissions",
        "select=role_id,permissions!inner(key)&role_id=in.(" + ",".join(role_ids) + ")",
    )
    if not any((x.get("permissions") or {}).get("key") == permission_key for x in grants):
        raise HTTPException(
            status_code=403,
            detail={
                "code": "ADMIN_PERMISSION_DENIED",
                "message": "Required permission is not assigned.",
            },
        )


@router.get("/overview")
async def admin_overview(claims: UserClaims):
    await _require_permission(claims, "platform.overview.read")
    users = await select_rows("profiles", "select=id")
    partners = await select_rows("partner_organizations", "select=id,status")
    runs = await select_rows("agent_runs", "select=id,status")
    return {"users": len(users), "partners": len(partners), "agent_runs": len(runs)}


@router.get("/users")
async def admin_users(claims: UserClaims, limit: int = 50):
    await _require_permission(claims, "platform.users.read")
    return {
        "items": await select_rows(
            "profiles",
            f"select=id,display_name,avatar_path,locale,timezone,created_at&order=created_at.desc&limit={max(1, min(limit, 100))}",
        )
    }


@router.get("/agents")
async def admin_agents(claims: UserClaims):
    await _require_permission(claims, "platform.overview.read")
    return {
        "items": await select_rows(
            "agent_runs",
            "select=id,user_id,workspace_id,status,attempt,created_at,started_at,finished_at&order=created_at.desc&limit=100",
        )
    }


@router.get("/models")
async def admin_models(claims: UserClaims):
    await _require_permission(claims, "platform.models.read")
    return {
        "items": await select_rows(
            "llm_models",
            "select=id,key,display_name,enabled,input_cost_per_million,output_cost_per_million,capabilities&order=key",
        )
    }


@router.get("/audit")
async def admin_audit(claims: UserClaims):
    await _require_permission(claims, "platform.audit.read")
    return {
        "items": await select_rows(
            "admin_audit_logs",
            "select=id,actor_user_id,action,resource_type,resource_id,scope_type,scope_id,outcome,created_at&order=created_at.desc&limit=100",
        )
    }


@router.get("/network-policies")
async def admin_network_policies(claims: UserClaims):
    await _require_permission(claims, "network.verification.read")
    return {
        "items": await select_rows(
            "network_verification_configs",
            "select=id,network_id,method_key,config_public,enabled,policy&order=created_at.desc&limit=100",
        )
    }



class VerificationMethodAvailability(BaseModel):
    model_config = ConfigDict(extra="forbid")
    enabled: bool


@router.get("/network-verification-methods")
async def admin_network_verification_methods(claims: UserClaims):
    await _require_permission(claims, "network.verification.read")
    return {
        "items": await select_rows(
            "network_verification_method_catalog",
            "select=method_key,display_name,adapter_key,enabled,adapter_ready,requires_secret,setup_requirements&order=display_name",
        )
    }


@router.patch("/network-verification-methods/{method_key}")
async def set_network_verification_method_availability(
    claims: UserClaims,
    method_key: Literal["gps", "mikrotik_hotspot", "radius", "gateway", "isp_api"],
    payload: VerificationMethodAvailability,
):
    await _require_permission(claims, "network.verification.manage")
    current = await select_rows(
        "network_verification_method_catalog",
        "select=method_key,enabled,adapter_ready&method_key=eq." + method_key,
    )
    if not current:
        raise HTTPException(status_code=404, detail="Verification method not found")
    changed = await update_rows(
        "network_verification_method_catalog",
        "method_key=eq." + method_key,
        {"enabled": payload.enabled, "updated_at": datetime.now(timezone.utc).isoformat()},
    )
    actor = str(UUID(str(claims.get("sub", ""))))
    await insert_rows(
        "admin_audit_logs",
        {
            "actor_user_id": actor,
            "action": "network.verification_method.availability_changed",
            "resource_type": "network_verification_method",
            "resource_id": method_key,
            "scope_type": "platform",
            "outcome": "success",
            "metadata": {
                "enabled": payload.enabled,
                "adapter_ready": bool(current[0].get("adapter_ready")),
            },
        },
    )
    return {
        "item": changed[0] if changed else {**current[0], "enabled": payload.enabled},
        "activated": False,
        "message": "Catalog availability changed. This does not mark an adapter ready or activate any partner network.",
    }
