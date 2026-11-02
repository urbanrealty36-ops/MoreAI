from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from moreai_api.auth import require_authenticated_user

router = APIRouter(prefix="/partner", tags=["partner-portal"])
UserClaims = Annotated[dict, Depends(require_authenticated_user)]


def _unavailable(domain: str) -> None:
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail={
            "code": f"{domain.upper()}_DOMAIN_NOT_CONFIGURED",
            "message": f"{domain} business persistence and tenant authorization are not configured yet.",
        },
    )


@router.get("/me")
async def partner_profile(_: UserClaims):
    _unavailable("partner")


@router.get("/branches")
async def list_branches(_: UserClaims):
    _unavailable("partner")


@router.post("/branches", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def create_branch(_: UserClaims):
    _unavailable("partner")


@router.get("/networks")
async def list_networks(_: UserClaims):
    _unavailable("partner")


@router.post("/networks", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def create_network(_: UserClaims):
    _unavailable("partner")


@router.get("/verification-methods")
async def list_verification_methods(_: UserClaims):
    _unavailable("partner")


@router.get("/campaigns")
async def list_campaigns(_: UserClaims):
    _unavailable("partner")


@router.post("/campaigns", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def create_campaign(_: UserClaims):
    _unavailable("partner")


@router.get("/rewards")
async def list_rewards(_: UserClaims):
    _unavailable("partner")


@router.get("/analytics")
async def partner_analytics(_: UserClaims):
    _unavailable("partner")
