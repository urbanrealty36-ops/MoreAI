import pytest

from moreai_sandbox.policy import SandboxPolicy


def test_shell_is_denied_even_when_requested() -> None:
    policy = SandboxPolicy()
    with pytest.raises(ValueError):
        SandboxPolicy(allow_shell=True)
    with pytest.raises(PermissionError):
        policy.authorize("shell")


def test_python_and_browser_are_disabled_by_default() -> None:
    policy = SandboxPolicy()
    with pytest.raises(PermissionError):
        policy.authorize("python")
    with pytest.raises(PermissionError):
        policy.authorize("browser")


def test_browser_requires_egress_proxy_and_allowlist() -> None:
    with pytest.raises(ValueError):
        SandboxPolicy(allow_browser=True, network_enabled=True)


def test_unknown_tool_is_denied() -> None:
    with pytest.raises(PermissionError):
        SandboxPolicy().authorize("arbitrary")
