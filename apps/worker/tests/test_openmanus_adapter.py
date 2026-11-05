import sys
import types

import pytest
from pydantic import BaseModel, ConfigDict, Field

from moreai_worker.openmanus_adapter import create_openmanus_agent


class FakeToolCollection:
    def __init__(self, *tools):
        self.tools = tools


class FakeTerminate:
    pass


class FakeBrowser:
    def __init__(self):
        raise AssertionError("BrowserUseTool must not be instantiated")


class FakePython:
    def __init__(self):
        raise AssertionError("PythonExecute must not be instantiated")


class FakeManus(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    max_steps: int
    tool_choices: str = "auto"
    llm: object | None = None
    available_tools: FakeToolCollection = Field(
        default_factory=lambda: FakeToolCollection(FakePython(), FakeBrowser())
    )


def install_openmanus_stubs(monkeypatch):
    app = types.ModuleType("app")
    app.__path__ = []
    agent_package = types.ModuleType("app.agent")
    agent_package.__path__ = []
    manus_module = types.ModuleType("app.agent.manus")
    manus_module.Manus = FakeManus
    tool_module = types.ModuleType("app.tool")
    tool_module.Terminate = FakeTerminate
    tool_module.ToolCollection = FakeToolCollection

    for name, module in {
        "app": app,
        "app.agent": agent_package,
        "app.agent.manus": manus_module,
        "app.tool": tool_module,
    }.items():
        monkeypatch.setitem(sys.modules, name, module)


def test_adapter_overrides_upstream_default_tools(tmp_path, monkeypatch):
    install_openmanus_stubs(monkeypatch)
    agent = create_openmanus_agent(object(), source_path=tmp_path, max_steps=99)

    assert agent.max_steps == 20
    assert agent.tool_choices == "none"
    assert len(agent.available_tools.tools) == 1
    assert isinstance(agent.available_tools.tools[0], FakeTerminate)


def test_adapter_requires_a_valid_source_directory(tmp_path):
    with pytest.raises(RuntimeError, match="source snapshot is unavailable"):
        create_openmanus_agent(object(), source_path=tmp_path / "missing")
