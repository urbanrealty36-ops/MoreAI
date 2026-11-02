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
            detail={
                "code": "DATABASE_NOT_CONFIGURED",
                "message": "Server database access is not configured.",
            },
        )
    return base, key


async def _request(
    method: str,
    path: str,
    *,
    params: str | None = None,
    payload: dict[str, Any] | None = None,
    prefer: str | None = None,
) -> Any:
    base, key = _config()
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(12.0, connect=4.0)) as client:
            response = await client.request(
                method,
                f"{base}/rest/v1/{quote(path, safe='/')}",
                params=params,
                json=payload,
                headers=headers,
            )
            response.raise_for_status()
            if response.status_code == 204 or not response.content:
                return None
            return response.json()
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail={"code": "DATABASE_QUERY_FAILED", "message": "Database query failed."},
        ) from exc
    except (httpx.HTTPError, ValueError) as exc:
        raise HTTPException(
            status_code=503,
            detail={"code": "DATABASE_UNAVAILABLE", "message": "Database service unavailable."},
        ) from exc


async def select_rows(table: str, query: str) -> list[dict[str, Any]]:
    data = await _request("GET", table, params=query)
    if not isinstance(data, list):
        raise HTTPException(
            status_code=502,
            detail={
                "code": "DATABASE_RESPONSE_INVALID",
                "message": "Database returned an invalid response.",
            },
        )
    return data


async def insert_rows(table: str, payload: dict[str, Any]) -> list[dict[str, Any]]:
    data = await _request("POST", table, payload=payload, prefer="return=representation")
    return data if isinstance(data, list) else []


async def rpc(function: str, payload: dict[str, Any]) -> Any:
    return await _request("POST", f"rpc/{function}", payload=payload)


async def update_rows(
    table: str,
    query: str,
    payload: dict[str, Any],
) -> list[dict[str, Any]]:
    data = await _request(
        "PATCH", table, params=query, payload=payload, prefer="return=representation"
    )
    return data if isinstance(data, list) else []
