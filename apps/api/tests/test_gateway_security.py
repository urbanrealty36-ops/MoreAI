import asyncio
import hashlib
import hmac
import time

from moreai_api.gateway import (
    canonical_gateway_payload,
    valid_gateway_timestamp,
    valid_ip_address,
    valid_mac_address,
    valid_nonce,
    verify_gateway_signature,
)


def test_gateway_signature_is_canonical_and_bound_to_payload():
    payload = {
        "network_id": "00000000-0000-0000-0000-000000000001",
        "gateway_id": "router-1",
        "timestamp": 1793600000,
        "nonce": "abcdefghijklmnopqrstuvwx",
    }
    secret = "x" * 48
    signature = hmac.new(
        secret.encode(),
        canonical_gateway_payload(payload),
        hashlib.sha256,
    ).hexdigest()
    assert verify_gateway_signature(payload, signature, secret)
    assert verify_gateway_signature(payload, "sha256=" + signature, secret)
    assert not verify_gateway_signature({**payload, "network_id": "other"}, signature, secret)


def test_gateway_signature_rejects_short_secret_and_tampering():
    payload = {"nonce": "abcdefghijklmnopqrstuvwx"}
    assert not verify_gateway_signature(payload, "0" * 64, "short")
    assert not verify_gateway_signature(payload, "0" * 64, "z" * 48)


def test_gateway_timestamp_window_and_nonce_shape():
    now = int(time.time())
    assert valid_gateway_timestamp(now, now, 120)
    assert valid_gateway_timestamp(now - 120, now, 120)
    assert not valid_gateway_timestamp(now - 121, now, 120)
    assert not valid_gateway_timestamp(now + 121, now, 120)
    assert valid_nonce("abcdefghijklmnopqrstuvwx")
    assert not valid_nonce("short")
    assert not valid_nonce("nonce with spaces")


def test_gateway_mac_address_validation():
    assert valid_mac_address("AA:BB:CC:DD:EE:FF")
    assert not valid_mac_address("AA:BB:CC:DD:EE")
    assert not valid_mac_address("not-a-mac")
    assert valid_ip_address("192.0.2.10")
    assert not valid_ip_address("0.0.0.0")
    assert not valid_ip_address("not-an-ip")



def test_routeros_credentials_require_https_and_secret():
    from moreai_api.gateway import validate_mikrotik_credentials

    invalid_http = {
        "router_url": "http://router.example",
        "username": "api-user",
        "password": "not-a-real-password",
        "hmac_secret": "x" * 48,
    }
    missing_hmac = {
        "router_url": "https://router.example",
        "username": "api-user",
        "password": "not-a-real-password",
        "hmac_secret": "short",
    }
    assert asyncio.run(validate_mikrotik_credentials(invalid_http)) is False
    assert asyncio.run(validate_mikrotik_credentials(missing_hmac)) is False


def test_routeros_proof_matches_exact_session(monkeypatch):
    from moreai_api import gateway

    session = {
        ".id": "*A1",
        "mac-address": "AA:BB:CC:DD:EE:FF",
        "address": "192.0.2.10",
        "user": "client-1",
        "server": "hotspot-main",
    }

    class Response:
        def raise_for_status(self):
            return None

        def json(self):
            return [session]

    class Client:
        def __init__(self, **kwargs):
            self.kwargs = kwargs

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            return None

        async def get(self, url):
            assert url == "https://router.example/rest/ip/hotspot/active"
            return Response()

    monkeypatch.setattr(gateway.httpx, "AsyncClient", Client)
    bundle = {
        "router_url": "https://router.example",
        "username": "api-user",
        "password": "placeholder",
        "hmac_secret": "x" * 48,
    }
    payload = {
        "session_id": "*A1",
        "client_mac": "aa:bb:cc:dd:ee:ff",
        "client_ip": "192.0.2.10",
        "username": "client-1",
        "hotspot_server": "hotspot-main",
    }
    assert asyncio.run(gateway.verify_mikrotik_active_session(bundle, payload))
    assert not asyncio.run(
        gateway.verify_mikrotik_active_session(
            bundle,
            {**payload, "session_id": "*OTHER"},
        )
    )
