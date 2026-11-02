#!/usr/bin/env python3
"""Verify pinned vendor source gitlinks against the reviewed provenance manifest."""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / "docs/source-migration/source-pins-v1.json").read_text())
errors: list[str] = []
for source in manifest["sources"]:
    path = source["vendor_path"]
    expected = source["commit"]
    try:
        gitlink = subprocess.check_output(
            ["git", "rev-parse", f"HEAD:{path}"], cwd=ROOT, text=True
        ).strip()
        checkout = subprocess.check_output(
            ["git", "-C", str(ROOT / path), "rev-parse", "HEAD"], cwd=ROOT, text=True
        ).strip()
    except (subprocess.CalledProcessError, FileNotFoundError) as exc:
        errors.append(f"{path}: submodule is missing or not initialized ({exc})")
        continue
    if gitlink != expected:
        errors.append(f"{path}: gitlink {gitlink} != manifest {expected}")
    if checkout != expected:
        errors.append(f"{path}: checkout {checkout} != manifest {expected}")
    print(f"OK {path} @ {expected}")
if errors:
    raise SystemExit("\n".join(errors))
print(f"Verified {len(manifest['sources'])} immutable source pins.")
