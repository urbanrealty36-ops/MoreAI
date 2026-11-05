from dataclasses import dataclass


@dataclass(frozen=True)
class SandboxPolicy:
    """Fail-closed authorization limits; this is not a substitute for OS isolation."""

    network_enabled: bool = False
    max_execution_seconds: int = 30
    max_memory_mb: int = 256
    allow_shell: bool = False
    allow_python: bool = False
    allow_browser: bool = False
    browser_egress_proxy: str | None = None
    allowed_browser_domains: tuple[str, ...] = ()

    def __post_init__(self) -> None:
        if not 1 <= self.max_execution_seconds <= 120:
            raise ValueError("Execution budget must be between 1 and 120 seconds")
        if not 64 <= self.max_memory_mb <= 1024:
            raise ValueError("Memory budget must be between 64 and 1024 MB")
        if self.allow_browser and (
            not self.network_enabled
            or not self.browser_egress_proxy
            or not self.allowed_browser_domains
        ):
            raise ValueError("Browser requires network, an egress proxy, and a domain allowlist")
        if self.allow_shell:
            raise ValueError("Unrestricted shell execution is not supported")

    def authorize(self, tool_name: str) -> None:
        if tool_name == "shell":
            raise PermissionError("Shell execution is disabled")
        if tool_name == "python" and not self.allow_python:
            raise PermissionError(
                "Python execution is disabled until an isolated runtime is configured"
            )
        if tool_name == "browser" and not self.allow_browser:
            raise PermissionError(
                "Browser execution is disabled until isolated egress is configured"
            )
        if tool_name not in {"python", "browser", "shell", "file"}:
            raise PermissionError("Unknown tool is denied by default")
