import pytest
from pydantic import ValidationError

from moreai_api.routers.partner import VerificationMethodSelection


@pytest.mark.parametrize(
    "method_key",
    ["gps", "mikrotik_hotspot", "radius", "gateway", "isp_api"],
)
def test_verification_method_contract_accepts_supported_single_choice(method_key):
    payload = VerificationMethodSelection(method_key=method_key)
    assert payload.method_key == method_key
    assert payload.config_public == {}


def test_verification_method_contract_rejects_unknown_or_hybrid_method():
    with pytest.raises(ValidationError):
        VerificationMethodSelection(method_key="hybrid")
    with pytest.raises(ValidationError):
        VerificationMethodSelection(method_key="gps,radius")


def test_verification_method_contract_rejects_secret_fields():
    with pytest.raises(ValidationError):
        VerificationMethodSelection(
            method_key="mikrotik_hotspot",
            shared_secret="must-not-be-accepted",
        )
