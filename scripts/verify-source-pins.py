#!/usr/bin/env python3
"""Verify file-level source mirrors against the audited upstream manifest."""
from __future__ import annotations

import csv
import hashlib
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


def sha(path: Path) -> str:
    return subprocess.check_output(["git", "hash-object", str(path)], cwd=ROOT, text=True).strip()


def main() -> None:
    if not ROWS:
        raise SystemExit("Source inventory is empty")
    report_path = ROOT / "docs/source-migration/source-mirror-verification.json"
    report = json.loads(report_path.read_text())
    if report.get("verification") != "passed" or report.get("files_verified") != len(ROWS):
        raise SystemExit("Source mirror verification report is missing or incomplete")
    for row in ROWS:
        path = ROOT / SOURCE_PATHS[row["source_repo"]] / row["source_path"]
        if not path.is_file():
            raise SystemExit(f"Missing source file: {path}")
        if path.stat().st_size != int(row["bytes"]) or sha(path) != row["blob_sha"]:
            raise SystemExit(f"Source hash/size mismatch: {path}")
    for name, rel in SOURCE_PATHS.items():
        pin = next(x for x in PINS["sources"] if x["vendor_path"] == rel)
        print(f"OK {name}: {pin['commit']} ({sum(1 for r in ROWS if r['source_repo'] == name)} files)")
    print(f"Verified {len(ROWS)} source files against Git blob SHA and byte size.")


if __name__ == "__main__":
    main()
