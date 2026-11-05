from dataclasses import dataclass


@dataclass(frozen=True)
class SandboxPolicy:
    network_enabled: bool = False
    max_execution_seconds: int = 30
    max_memory_mb: int = 256
