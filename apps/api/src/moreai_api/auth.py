from __future__ import annotations

import asyncio
from typing import Any
from urllib.parse import urlparse

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient
from jwt.exceptions import InvalidTokenError

from moreai_api.settings import settings

bearer = HTTPBearer(auto_error=False)


async def require_authenticated_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> dict[str, Any]:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    if not settings.supabase_url:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Identity provider is not configured")

    issuer = f"{settings.supabase_url.rstrip('/')}/auth/v1"
    jwks_url = f"{issuer}/.well-known/jwks.json"
    try:
        parsed = urlparse(settings.supabase_url)
        if parsed.scheme != "https" and parsed.hostname not in {"localhost", "127.0.0.1"}:
            raise ValueError("Supabase URL must use HTTPS")
        signing_key = await asyncio.to_thread(
            PyJWKClient(jwks_url, cache_keys=True, timeout=5).get_signing_key_from_jwt,
            credentials.credentials,
        )
        claims = jwt.decode(
            credentials.credentials,
            signing_key.key,
            algorithms=["ES256", "RS256"],
            audience="authenticated",
            issuer=issuer,
            options={"require": ["exp", "iat", "sub", "iss", "aud"]},
            leeway=30,
        )
        if not isinstance(claims.get("sub"), str) or not claims["sub"]:
            raise InvalidTokenError("Missing subject")
        return claims
    except (InvalidTokenError, ValueError, OSError) as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid access token") from exc
