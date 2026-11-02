import hashlib
import hmac
import json
import time

from moreai_api.gateway import (
    canonical_gateway_payload,
    valid_gateway_timestamp,
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
    signature = hmac.new(secret.encode(), canonical_gateway_payload(payload), hashlib.sha256).hexdigest()
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
