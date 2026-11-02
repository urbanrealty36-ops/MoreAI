from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from moreai_api.auth import require_authenticated_user

router = APIRouter(prefix="/admin", tags=["super-admin"])
UserClaims = Annotated[dict, Depends(require_authenticated_user)]


def _deny_until_rbac(claims: dict) -> None:
    metadata = claims.get("app_metadata")
    role = metadata.get("role") if isinstance(metadata, dict) else None
    roles = metadata.get("roles", []) if isinstance(metadata, dict) else []
    if role not in {"super_admin", "platform_admin"} and not (
        isinstance(roles, list) and any(x in {"super_admin", "platform_admin"} for x in roles)
    ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Super Admin permission required")
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail={
            "code": "ADMIN_DOMAIN_NOT_CONFIGURED",
            "message": "Admin data, role catalog, and audit persistence are not configured yet.",
        },
    )


@router.get("/overview")
async def admin_overview(claims: UserClaims):
    _deny_until_rbac(claims)


@router.get("/users")
async def admin_users(claims: UserClaims):
    _deny_until_rbac(claims)


@router.get("/agents")
async def admin_agents(claims: UserClaims):
    _deny_until_rbac(claims)


@router.get("/models")
async def admin_models(claims: UserClaims):
    _deny_until_rbac(claims)


@router.get("/audit")
async def admin_audit(claims: UserClaims):
    _deny_until_rbac(claims)


@router.get("/network-policies")
async def admin_network_policies(claims: UserClaims):
    _deny_until_rbac(claims)
