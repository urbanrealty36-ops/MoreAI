from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from moreai_api.auth import require_authenticated_user

router = APIRouter(prefix="/network", tags=["network-access"])
UserClaims = Annotated[dict, Depends(require_authenticated_user)]


class AccessVerificationRequest(BaseModel):
    network_id: str = Field(min_length=1, max_length=128)
    access_code: str | None = Field(default=None, max_length=128)
    gateway_session_id: str | None = Field(default=None, max_length=256)


def _unavailable() -> None:
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail={
            "code": "NETWORK_GATEWAY_NOT_CONFIGURED",
            "message": "No verified captive-gateway integration is configured. Access and rewards were not activated.",
        },
    )


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
