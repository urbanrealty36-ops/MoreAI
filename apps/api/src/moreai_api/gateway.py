from __future__ import annotations

import hashlib
import ipaddress
import hmac
import json
import re
from typing import Any
from urllib.parse import urlsplit

import httpx
from fastapi import HTTPException, status

from moreai_api.settings import settings


def gateway_secret_bundle(secret_reference: str | None) -> dict[str, Any]:
    if not secret_reference or not settings.network_gateway_secrets_json:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"code": "GATEWAY_CREDENTIALS_UNAVAILABLE", "message": "Gateway credentials are not configured."},
        )
    try:
        bundles = json.loads(settings.network_gateway_secrets_json)
    except (TypeError, ValueError) as exc:
        raise HTTPException(status_code=503, detail={"code": "GATEWAY_SECRET_STORE_INVALID", "message": "Gateway secret store is unavailable."}) from exc
    bundle = bundles.get(secret_reference) if isinstance(bundles, dict) else None
    if not isinstance(bundle, dict):
        raise HTTPException(status_code=503, detail={"code": "GATEWAY_CREDENTIALS_UNAVAILABLE", "message": "Gateway credentials are not configured."})
    return bundle


def canonical_gateway_payload(payload: dict[str, Any]) -> bytes:
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("utf-8")


def verify_gateway_signature(payload: dict[str, Any], signature: str, secret: str) -> bool:
    if len(secret.encode("utf-8")) < 32:
        return False
    expected = hmac.new(secret.encode("utf-8"), canonical_gateway_payload(payload), hashlib.sha256).hexdigest()
    supplied = signature.removeprefix("sha256=")
    return hmac.compare_digest(expected, supplied)


def valid_gateway_timestamp(timestamp: int, now: int, max_skew: int) -> bool:
    return abs(now - timestamp) <= max_skew


def valid_nonce(nonce: str) -> bool:
    return bool(re.fullmatch(r"[A-Za-z0-9_-]{22,128}", nonce))


def valid_ip_address(value: str) -> bool:
    try:
        address = ipaddress.ip_address(value)
    except ValueError:
        return False
    return not address.is_unspecified and not address.is_multicast


def valid_mac_address(value: str) -> bool:
    return bool(re.fullmatch(r"(?:[0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}", value))


async def verify_mikrotik_active_session(bundle: dict[str, Any], payload: dict[str, Any]) -> bool:
    router_url = str(bundle.get("router_url", "")).rstrip("/")
    parsed = urlsplit(router_url)
    username = bundle.get("username")
    password = bundle.get("password")
    if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password:
        return False
    if not isinstance(username, str) or not username or not isinstance(password, str) or not password:
        return False
    if not isinstance(bundle.get("hmac_secret"), str):
        return False

    try:
        async with httpx.AsyncClient(
            timeout=httpx.Timeout(settings.network_gateway_request_timeout_seconds, connect=3.0),
            verify=True,
            follow_redirects=False,
            auth=(username, password),
        ) as client:
            response = await client.get(f"{router_url}/rest/ip/hotspot/active")
            response.raise_for_status()
            sessions = response.json()
    except (httpx.HTTPError, ValueError):
        return False
    if not isinstance(sessions, list):
        return False

    expected_mac = payload["client_mac"].lower()
    expected_ip = payload["client_ip"]
    expected_user = payload["username"]
    expected_server = payload["hotspot_server"]
    return any(
        isinstance(item, dict)
        and str(item.get("mac-address", "")).lower() == expected_mac
        and item.get("address") == expected_ip
        and item.get("user") == expected_user
        and item.get("server") == expected_server
        and item.get(".id") == payload["session_id"]
        for item in sessions
    )



async def validate_mikrotik_credentials(bundle: dict[str, Any]) -> bool:
    router_url = str(bundle.get("router_url", "")).rstrip("/")
    parsed = urlsplit(router_url)
    username = bundle.get("username")
    password = bundle.get("password")
    if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password:
        return False
    if not isinstance(username, str) or not username or not isinstance(password, str) or not password:
        return False
    if not isinstance(bundle.get("hmac_secret"), str) or len(bundle["hmac_secret"].encode()) < 32:
        return False
    try:
        async with httpx.AsyncClient(
            timeout=httpx.Timeout(settings.network_gateway_request_timeout_seconds, connect=3.0),
            verify=True,
            follow_redirects=False,
            auth=(username, password),
        ) as client:
            response = await client.get(f"{router_url}/rest/system/resource")
            response.raise_for_status()
            data = response.json()
        return isinstance(data, dict) and bool(data.get("version")) and bool(data.get("board-name"))
    except (httpx.HTTPError, ValueError):
        return False
