from __future__ import annotations

from typing import Any
from urllib.parse import quote

import httpx
from fastapi import HTTPException, status

from moreai_api.settings import settings


def _config() -> tuple[str, str]:
    base = (settings.supabase_url or "").rstrip("/")
    key = settings.supabase_secret_key or ""
    if not base or not key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"code": "DATABASE_NOT_CONFIGURED", "message": "Server database access is not configured."},
        )
    return base, key


async def select_rows(table: str, query: str) -> list[dict[str, Any]]:
    base, key = _config()
    url = f"{base}/rest/v1/{quote(table, safe='')}"
    headers = {"apikey": key, "Authorization": f"Bearer {key}", "Accept": "application/json"}
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(12.0, connect=4.0)) as client:
            response = await client.get(url, params=query, headers=headers)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=502, detail={"code": "DATABASE_QUERY_FAILED", "message": "Database query failed."}) from exc
    except (httpx.HTTPError, ValueError) as exc:
        raise HTTPException(status_code=503, detail={"code": "DATABASE_UNAVAILABLE", "message": "Database service unavailable."}) from exc
    if not isinstance(data, list):
        raise HTTPException(status_code=502, detail={"code": "DATABASE_RESPONSE_INVALID", "message": "Database returned an invalid response."})
    return data
