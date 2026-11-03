from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
from typing import Annotated, Any, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, ConfigDict, Field

from moreai_api.auth import require_authenticated_user
from moreai_api.db import insert_rows, select_rows, update_rows, rpc
from moreai_api.gateway import gateway_secret_bundle, validate_mikrotik_credentials
from moreai_api.settings import settings

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
            "select=id,provider_id,key,display_name,enabled,input_cost_per_million,output_cost_per_million,max_input_tokens,max_output_tokens,capabilities,provider:llm_providers(key,display_name,enabled)&order=key",
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
            "select=id,network_id,method_key,config_public,secret_reference,enabled,policy&order=created_at.desc&limit=100",
        )
    }


class PlatformRoleAssignmentCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    target_user_id: UUID
    role_key: Literal[
        "super_admin",
        "platform_admin",
        "finance_admin",
        "partner_manager",
        "security_admin",
        "support_admin",
        "read_only_analyst",
    ]
    expires_at: datetime | None = None


class PlatformRoleRevocation(BaseModel):
    model_config = ConfigDict(extra="forbid")
    reason: str | None = Field(default=None, max_length=500)


class ProviderCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    key: Literal["google", "openai", "anthropic"]
    display_name: str = Field(min_length=2, max_length=120)
    enabled: bool = False


class ProviderUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    display_name: str = Field(min_length=2, max_length=120)
    enabled: bool


class ModelMutation(BaseModel):
    model_config = ConfigDict(extra="forbid")
    provider_id: UUID
    key: str = Field(min_length=1, max_length=160)
    display_name: str = Field(min_length=2, max_length=160)
    input_cost_per_million: Decimal = Field(ge=0)
    output_cost_per_million: Decimal = Field(ge=0)
    max_input_tokens: int | None = Field(default=None, ge=1)
    max_output_tokens: int | None = Field(default=None, ge=1)
    capabilities: list[str] = Field(default_factory=list, max_length=32)
    enabled: bool = False


class RoutingMutation(BaseModel):
    model_config = ConfigDict(extra="forbid")
    task_type: Literal["general"] = "general"
    model_id: UUID
    fallback_model_id: UUID | None = None
    priority: int = Field(default=100, ge=0, le=100000)
    enabled: bool = False


def _provider_credentials_ready(provider_key: str) -> bool:
    return bool(
        {
            "google": settings.llm_provider_api_key,
            "openai": settings.llm_openai_api_key,
            "anthropic": settings.llm_anthropic_api_key,
        }.get(provider_key)
    )


@router.get("/role-assignments")
async def list_platform_role_assignments(claims: UserClaims):
    await _require_permission(claims, "platform.roles.read")
    assignments = await select_rows(
        "user_role_assignments",
        "select=id,user_id,role_id,scope_type,scope_id,assigned_by,expires_at,created_at"
        "&scope_type=eq.platform&scope_id=is.null&order=created_at.desc&limit=200",
    )
    roles = await select_rows("roles", "select=id,key,description&scope=eq.platform")
    role_by_id = {role["id"]: role for role in roles}
    return {
        "items": [
            {**assignment, "role": role_by_id.get(assignment["role_id"])}
            for assignment in assignments
        ]
    }


@router.post("/role-assignments", status_code=201)
async def assign_platform_role(
    payload: PlatformRoleAssignmentCreate, claims: UserClaims, request: Request
):
    await _require_permission(claims, "platform.roles.assign")
    if payload.expires_at and payload.expires_at.tzinfo is None:
        raise HTTPException(status_code=422, detail={"code": "ROLE_EXPIRY_TIMEZONE_REQUIRED"})
    actor = str(UUID(str(claims.get("sub", ""))))
    result = await rpc(
        "moreai_admin_assign_platform_role",
        {
            "p_actor_user_id": actor,
            "p_target_user_id": str(payload.target_user_id),
            "p_role_key": payload.role_key,
            "p_expires_at": payload.expires_at.isoformat() if payload.expires_at else None,
            "p_correlation_id": request.headers.get("X-Correlation-ID"),
        },
    )
    return result


@router.delete("/role-assignments/{assignment_id}")
async def revoke_platform_role(
    assignment_id: UUID, payload: PlatformRoleRevocation, claims: UserClaims, request: Request
):
    await _require_permission(claims, "platform.roles.assign")
    actor = str(UUID(str(claims.get("sub", ""))))
    result = await rpc(
        "moreai_admin_revoke_platform_role",
        {
            "p_actor_user_id": actor,
            "p_assignment_id": str(assignment_id),
            "p_reason": payload.reason,
            "p_correlation_id": request.headers.get("X-Correlation-ID"),
        },
    )
    return result


@router.get("/providers")
async def admin_llm_providers(claims: UserClaims):
    await _require_permission(claims, "platform.models.read")
    rows = await select_rows(
        "llm_providers",
        "select=id,key,display_name,enabled,created_at,updated_at&order=key",
    )
    return {
        "items": [
            {**row, "credentials_configured": _provider_credentials_ready(row["key"])}
            for row in rows
        ]
    }


@router.post("/providers", status_code=201)
async def create_llm_provider(payload: ProviderCreate, claims: UserClaims, request: Request):
    await _require_permission(claims, "platform.models.manage")
    actor = str(UUID(str(claims.get("sub", ""))))
    result = await rpc(
        "moreai_admin_mutate_llm_provider",
        {
            "p_actor_user_id": actor,
            "p_provider_id": None,
            "p_key": payload.key,
            "p_display_name": payload.display_name,
            "p_enabled": payload.enabled,
            "p_credentials_ready": _provider_credentials_ready(payload.key),
            "p_correlation_id": request.headers.get("X-Correlation-ID"),
        },
    )
    return {"provider": result}


@router.patch("/providers/{provider_id}")
async def update_llm_provider(
    provider_id: UUID, payload: ProviderUpdate, claims: UserClaims, request: Request
):
    await _require_permission(claims, "platform.models.manage")
    rows = await select_rows("llm_providers", f"select=id,key&id=eq.{provider_id}&limit=1")
    if not rows:
        raise HTTPException(status_code=404, detail={"code": "LLM_PROVIDER_NOT_FOUND"})
    actor = str(UUID(str(claims.get("sub", ""))))
    result = await rpc(
        "moreai_admin_mutate_llm_provider",
        {
            "p_actor_user_id": actor,
            "p_provider_id": str(provider_id),
            "p_key": rows[0]["key"],
            "p_display_name": payload.display_name,
            "p_enabled": payload.enabled,
            "p_credentials_ready": _provider_credentials_ready(rows[0]["key"]),
            "p_correlation_id": request.headers.get("X-Correlation-ID"),
        },
    )
    return {"provider": result}


@router.delete("/providers/{provider_id}")
async def disable_llm_provider(provider_id: UUID, claims: UserClaims, request: Request):
    await _require_permission(claims, "platform.models.manage")
    rows = await select_rows(
        "llm_providers", f"select=id,key,display_name&id=eq.{provider_id}&limit=1"
    )
    if not rows:
        raise HTTPException(status_code=404, detail={"code": "LLM_PROVIDER_NOT_FOUND"})
    actor = str(UUID(str(claims.get("sub", ""))))
    result = await rpc(
        "moreai_admin_mutate_llm_provider",
        {
            "p_actor_user_id": actor,
            "p_provider_id": str(provider_id),
            "p_key": rows[0]["key"],
            "p_display_name": rows[0]["display_name"],
            "p_enabled": False,
            "p_credentials_ready": _provider_credentials_ready(rows[0]["key"]),
            "p_correlation_id": request.headers.get("X-Correlation-ID"),
        },
    )
    return {"provider": result, "disabled": True}


@router.post("/models", status_code=201)
async def create_llm_model(payload: ModelMutation, claims: UserClaims, request: Request):
    await _require_permission(claims, "platform.models.manage")
    actor = str(UUID(str(claims.get("sub", ""))))
    result = await rpc(
        "moreai_admin_mutate_llm_model",
        {
            "p_actor_user_id": actor,
            "p_model_id": None,
            "p_provider_id": str(payload.provider_id),
            "p_key": payload.key,
            "p_display_name": payload.display_name,
            "p_input_cost_per_million": str(payload.input_cost_per_million),
            "p_output_cost_per_million": str(payload.output_cost_per_million),
            "p_max_input_tokens": payload.max_input_tokens,
            "p_max_output_tokens": payload.max_output_tokens,
            "p_capabilities": payload.capabilities,
            "p_enabled": payload.enabled,
            "p_correlation_id": request.headers.get("X-Correlation-ID"),
        },
    )
    return {"model": result}


@router.put("/models/{model_id}")
async def update_llm_model(
    model_id: UUID, payload: ModelMutation, claims: UserClaims, request: Request
):
    await _require_permission(claims, "platform.models.manage")
    actor = str(UUID(str(claims.get("sub", ""))))
    result = await rpc(
        "moreai_admin_mutate_llm_model",
        {
            "p_actor_user_id": actor,
            "p_model_id": str(model_id),
            "p_provider_id": str(payload.provider_id),
            "p_key": payload.key,
            "p_display_name": payload.display_name,
            "p_input_cost_per_million": payload.input_cost_per_million,
            "p_output_cost_per_million": payload.output_cost_per_million,
            "p_max_input_tokens": payload.max_input_tokens,
            "p_max_output_tokens": payload.max_output_tokens,
            "p_capabilities": payload.capabilities,
            "p_enabled": payload.enabled,
            "p_correlation_id": request.headers.get("X-Correlation-ID"),
        },
    )
    return {"model": result}


@router.post("/llm-routing", status_code=201)
async def create_llm_route(payload: RoutingMutation, claims: UserClaims, request: Request):
    await _require_permission(claims, "platform.models.manage")
    actor = str(UUID(str(claims.get("sub", ""))))
    result = await rpc(
        "moreai_admin_mutate_llm_route",
        {
            "p_actor_user_id": actor,
            "p_policy_id": None,
            "p_task_type": payload.task_type,
            "p_model_id": str(payload.model_id),
            "p_fallback_model_id": str(payload.fallback_model_id)
            if payload.fallback_model_id
            else None,
            "p_priority": payload.priority,
            "p_enabled": payload.enabled,
            "p_correlation_id": request.headers.get("X-Correlation-ID"),
        },
    )
    return {"policy": result}


@router.put("/llm-routing/{policy_id}")
async def update_llm_route(
    policy_id: UUID, payload: RoutingMutation, claims: UserClaims, request: Request
):
    await _require_permission(claims, "platform.models.manage")
    actor = str(UUID(str(claims.get("sub", ""))))
    result = await rpc(
        "moreai_admin_mutate_llm_route",
        {
            "p_actor_user_id": actor,
            "p_policy_id": str(policy_id),
            "p_task_type": payload.task_type,
            "p_model_id": str(payload.model_id),
            "p_fallback_model_id": str(payload.fallback_model_id)
            if payload.fallback_model_id
            else None,
            "p_priority": payload.priority,
            "p_enabled": payload.enabled,
            "p_correlation_id": request.headers.get("X-Correlation-ID"),
        },
    )
    return {"policy": result}


@router.delete("/models/{model_id}")
async def disable_llm_model(model_id: UUID, claims: UserClaims, request: Request):
    await _require_permission(claims, "platform.models.manage")
    rows = await select_rows(
        "llm_models",
        f"select=id,provider_id,key,display_name,input_cost_per_million,output_cost_per_million,max_input_tokens,max_output_tokens,capabilities&id=eq.{model_id}&limit=1",
    )
    if not rows:
        raise HTTPException(status_code=404, detail={"code": "LLM_MODEL_NOT_FOUND"})
    row = rows[0]
    actor = str(UUID(str(claims.get("sub", ""))))
    result = await rpc(
        "moreai_admin_mutate_llm_model",
        {
            "p_actor_user_id": actor,
            "p_model_id": str(model_id),
            "p_provider_id": row["provider_id"],
            "p_key": row["key"],
            "p_display_name": row["display_name"],
            "p_input_cost_per_million": row["input_cost_per_million"],
            "p_output_cost_per_million": row["output_cost_per_million"],
            "p_max_input_tokens": row.get("max_input_tokens"),
            "p_max_output_tokens": row.get("max_output_tokens"),
            "p_capabilities": row.get("capabilities") or [],
            "p_enabled": False,
            "p_correlation_id": request.headers.get("X-Correlation-ID"),
        },
    )
    return {"model": result, "disabled": True}


@router.delete("/llm-routing/{policy_id}")
async def disable_llm_route(policy_id: UUID, claims: UserClaims, request: Request):
    await _require_permission(claims, "platform.models.manage")
    rows = await select_rows(
        "llm_routing_policies",
        f"select=id,task_type,model_id,fallback_model_id,priority&id=eq.{policy_id}&scope_type=eq.platform&scope_id=is.null&limit=1",
    )
    if not rows:
        raise HTTPException(status_code=404, detail={"code": "LLM_ROUTE_NOT_FOUND"})
    row = rows[0]
    actor = str(UUID(str(claims.get("sub", ""))))
    result = await rpc(
        "moreai_admin_mutate_llm_route",
        {
            "p_actor_user_id": actor,
            "p_policy_id": str(policy_id),
            "p_task_type": row["task_type"],
            "p_model_id": row["model_id"],
            "p_fallback_model_id": row.get("fallback_model_id"),
            "p_priority": row["priority"],
            "p_enabled": False,
            "p_correlation_id": request.headers.get("X-Correlation-ID"),
        },
    )
    return {"policy": result, "disabled": True}


class PartnerReviewRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    decision: Literal["approve", "reject", "suspend"]
    reason: str | None = None


@router.post("/partners/{partner_id}/review")
async def review_partner_application(
    partner_id: UUID,
    payload: PartnerReviewRequest,
    claims: UserClaims,
    request: Request,
):
    await _require_permission(claims, "partner.organization.manage")
    actor_user_id = str(UUID(str(claims.get("sub", ""))))
    result = await rpc(
        "moreai_admin_review_partner",
        {
            "p_actor_user_id": actor_user_id,
            "p_partner_id": str(partner_id),
            "p_decision": payload.decision,
            "p_reason": payload.reason,
            "p_correlation_id": request.headers.get("X-Correlation-ID"),
        },
    )
    return result


@router.get("/permission-matrix")
async def admin_permission_matrix(claims: UserClaims):
    await _require_permission(claims, "platform.roles.read")
    roles = await select_rows(
        "roles",
        "select=id,key,scope,description,system_role&order=scope,key",
    )
    permissions = await select_rows(
        "permissions",
        "select=id,key,description&order=key",
    )
    assignments = await select_rows(
        "role_permissions",
        "select=role_id,permission_id",
    )
    permission_keys = {item["id"]: item["key"] for item in permissions}
    by_role: dict[str, list[str]] = {}
    for item in assignments:
        key = permission_keys.get(item["permission_id"])
        if key:
            by_role.setdefault(item["role_id"], []).append(key)
    return {
        "roles": [{**role, "permissions": sorted(by_role.get(role["id"], []))} for role in roles],
        "permissions": permissions,
    }


@router.get("/llm-routing")
async def admin_llm_routing(claims: UserClaims):
    await _require_permission(claims, "platform.models.read")
    policies = await select_rows(
        "llm_routing_policies",
        "select=id,scope_type,scope_id,task_type,model_id,priority,fallback_model_id,enabled&order=scope_type,task_type,priority,id",
    )
    models = await select_rows(
        "llm_models",
        "select=id,provider_id,key,display_name,enabled,input_cost_per_million,output_cost_per_million,provider:llm_providers(key,display_name,enabled)&order=key",
    )
    by_id = {item["id"]: item for item in models}
    return {
        "items": [
            {
                **policy,
                "model": by_id.get(policy["model_id"]),
                "fallback_model": by_id.get(policy.get("fallback_model_id")),
            }
            for policy in policies
        ]
    }


@router.get("/partners")
async def admin_partners(
    claims: UserClaims,
    status_filter: Literal["pending", "active", "suspended", "rejected", "closed"] | None = None,
):
    await _require_permission(claims, "partner.organization.read")
    query = "select=id,legal_name,display_name,status,created_by,created_at,updated_at&order=created_at.desc&limit=100"
    if status_filter:
        query += f"&status=eq.{status_filter}"
    return {"items": await select_rows("partner_organizations", query)}


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


class MikroTikSecretReference(BaseModel):
    model_config = ConfigDict(extra="forbid")
    secret_reference: str


@router.put("/networks/{network_id}/mikrotik-secret-reference")
async def set_mikrotik_secret_reference(
    claims: UserClaims, network_id: UUID, payload: MikroTikSecretReference
):
    await _require_permission(claims, "network.verification.manage")
    if not payload.secret_reference or len(payload.secret_reference) > 128:
        raise HTTPException(
            status_code=422,
            detail="Invalid secret reference",
        )
    bundle = gateway_secret_bundle(payload.secret_reference)
    if not bundle:
        raise HTTPException(
            status_code=503,
            detail="Gateway secret reference is unavailable",
        )
    configs = await select_rows(
        "network_verification_configs",
        "select=id,method_key&network_id=eq." + str(network_id) + "&method_key=eq.mikrotik_hotspot",
    )
    if not configs:
        raise HTTPException(
            status_code=404,
            detail="Select MikroTik Hotspot for this network first",
        )
    changed = await update_rows(
        "network_verification_configs",
        "network_id=eq." + str(network_id) + "&method_key=eq.mikrotik_hotspot",
        {"secret_reference": payload.secret_reference, "enabled": False},
    )
    await insert_rows(
        "admin_audit_logs",
        {
            "actor_user_id": str(UUID(str(claims.get("sub", "")))),
            "action": "network.mikrotik.secret_reference_configured",
            "resource_type": "partner_network",
            "resource_id": str(network_id),
            "scope_type": "network",
            "scope_id": str(network_id),
            "outcome": "success",
            "metadata": {"secret_reference_configured": True},
        },
    )
    return {"configured": bool(changed), "credentials_exposed": False, "activated": False}


@router.post("/networks/{network_id}/mikrotik-credentials/validate")
async def validate_network_mikrotik_credentials(
    claims: UserClaims,
    network_id: UUID,
):
    await _require_permission(claims, "network.verification.manage")
    networks = await select_rows(
        "partner_networks",
        "select=id,active_verification_method&id=eq." + str(network_id),
    )
    if not networks or networks[0].get("active_verification_method") != "mikrotik_hotspot":
        raise HTTPException(
            status_code=409,
            detail="MikroTik must be the selected method for this network",
        )
    configs = await select_rows(
        "network_verification_configs",
        "select=id,secret_reference,config_public&network_id=eq."
        + str(network_id)
        + "&method_key=eq.mikrotik_hotspot",
    )
    if (
        not configs
        or not configs[0].get("secret_reference")
        or not (configs[0].get("config_public") or {}).get("gateway_id")
    ):
        raise HTTPException(
            status_code=409,
            detail="MikroTik secret reference or gateway ID is not configured",
        )
    bundle = gateway_secret_bundle(configs[0]["secret_reference"])
    if not await validate_mikrotik_credentials(bundle):
        await insert_rows(
            "admin_audit_logs",
            {
                "actor_user_id": str(UUID(str(claims.get("sub", "")))),
                "action": "network.mikrotik.credentials_validation",
                "resource_type": "partner_network",
                "resource_id": str(network_id),
                "scope_type": "network",
                "scope_id": str(network_id),
                "outcome": "failure",
                "metadata": {"credentials_valid": False},
            },
        )
        raise HTTPException(
            status_code=503,
            detail={
                "code": "MIKROTIK_CREDENTIAL_VALIDATION_FAILED",
                "message": (
                    "RouterOS HTTPS credential validation failed; adapter remains disabled."
                ),
            },
        )

    await update_rows(
        "network_verification_method_catalog",
        "method_key=eq.mikrotik_hotspot",
        {"adapter_ready": True, "updated_at": datetime.now(timezone.utc).isoformat()},
    )
    activated = await update_rows(
        "network_verification_configs",
        "network_id=eq." + str(network_id) + "&method_key=eq.mikrotik_hotspot",
        {"enabled": True, "updated_at": datetime.now(timezone.utc).isoformat()},
    )
    await insert_rows(
        "admin_audit_logs",
        {
            "actor_user_id": str(UUID(str(claims.get("sub", "")))),
            "action": "network.mikrotik.credentials_validation",
            "resource_type": "partner_network",
            "resource_id": str(network_id),
            "scope_type": "network",
            "scope_id": str(network_id),
            "outcome": "success",
            "metadata": {
                "credentials_valid": True,
                "adapter_ready": True,
                "network_config_enabled": bool(activated),
            },
        },
    )
    return {
        "credentials_valid": True,
        "adapter_ready": True,
        "network_config_enabled": bool(activated),
        "credentials_exposed": False,
    }
