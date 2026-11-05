from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Any

from pydantic import Field


def create_openmanus_agent(
    gateway_llm: Any,
    *,
    source_path: str | Path | None = None,
    max_steps: int = 8,
) -> Any:
    """Create a bounded OpenManus agent without enabling upstream execution tools.

    The LLM implementation is injected by the future MoreAI API/worker phase.
    This Phase 02 adapter does not create queues, persist runs, access Supabase,
    or execute shell, Python, or browser tools.
    """
    source = Path(
        source_path or os.getenv("OPENMANUS_SOURCE_PATH", "vendor/openmanusweb")
    ).resolve()
    if not source.is_dir():
        raise RuntimeError(f"OpenManus source snapshot is unavailable: {source}")

    source_text = str(source)
    if source_text not in sys.path:
        sys.path.insert(0, source_text)

    from app.agent.manus import Manus
    from app.tool import Terminate, ToolCollection

    class BoundedManus(Manus):
        available_tools: ToolCollection = Field(default_factory=lambda: ToolCollection(Terminate()))

    agent = BoundedManus(max_steps=max(1, min(int(max_steps), 20)))
    agent.available_tools = ToolCollection(Terminate())
    agent.tool_choices = "none"
    agent.llm = gateway_llm
    return agent


async def run_openmanus_prompt(
    prompt: str,
    gateway_llm: Any,
    *,
    source_path: str | Path | None = None,
    max_steps: int = 8,
) -> str:
    """Run a prompt through the bounded adapter; persistence is caller-owned."""
    if not isinstance(prompt, str) or not prompt.strip():
        raise ValueError("Agent prompt required")
    agent = create_openmanus_agent(
        gateway_llm,
        source_path=source_path,
        max_steps=max_steps,
    )
    return await agent.run(prompt)
