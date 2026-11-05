#!/usr/bin/env python3
"""Verify the committed vendor Git objects against the audited file-level inventory."""
from __future__ import annotations

import csv
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ROWS = list(csv.DictReader((ROOT / "docs/source-migration/source-inventory-v1.csv").open(encoding="utf-8")))
PINS = json.loads((ROOT / "docs/source-migration/source-pins-v1.json").read_text())
SOURCE_PATHS = {
    "OpenManusWeb": "vendor/openmanusweb",
    "Front-End-UI-MoreAI": "vendor/reference-ui",
}


def git(*args: str) -> str:
    return subprocess.check_output(["git", *args], cwd=ROOT, text=True).strip()


def main() -> None:
    if not ROWS:
        raise SystemExit("Source inventory is empty")
    report = json.loads((ROOT / "docs/source-migration/source-mirror-verification.json").read_text())
    if report.get("verification") != "passed" or report.get("files_verified") != len(ROWS):
        raise SystemExit("Source mirror verification report is missing or incomplete")
    for row in ROWS:
        prefix = SOURCE_PATHS[row["source_repo"]]
        path = f"{prefix}/{row['source_path']}"
        actual_sha = git("rev-parse", f"HEAD:{path}")
        actual_size = int(git("cat-file", "-s", f"HEAD:{path}"))
        if actual_sha != row["blob_sha"] or actual_size != int(row["bytes"]):
            raise SystemExit(
                f"Committed source mismatch: {path}: "
                f"sha={actual_sha}/{row['blob_sha']}, size={actual_size}/{row['bytes']}"
            )
    for name, rel in SOURCE_PATHS.items():
        pin = next(x for x in PINS["sources"] if x["vendor_path"] == rel)
        print(f"OK {name}: {pin['commit']} ({sum(1 for r in ROWS if r['source_repo'] == name)} files)")
    print(f"Verified {len(ROWS)} committed vendor blobs against upstream SHA and byte size.")


if __name__ == "__main__":
    main()
