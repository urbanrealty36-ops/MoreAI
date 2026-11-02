#!/usr/bin/env python3
"""Materialize pinned upstream submodules as immutable, file-level vendor snapshots."""
from __future__ import annotations

import csv
import hashlib
import json
import shutil
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INVENTORY = ROOT / "docs/source-migration/source-inventory-v1.csv"
PINS = json.loads((ROOT / "docs/source-migration/source-pins-v1.json").read_text())
SOURCES = {
    "OpenManusWeb": "vendor/openmanusweb",
    "Front-End-UI-MoreAI": "vendor/reference-ui",
}


def run(*args: str, cwd: Path = ROOT) -> str:
    return subprocess.check_output(args, cwd=cwd, text=True).strip()


def blob_sha(path: Path) -> str:
    return run("git", "hash-object", str(path))


def main() -> None:
    rows = list(csv.DictReader(INVENTORY.open(newline="", encoding="utf-8")))
    if not rows:
        raise SystemExit("Source inventory is empty")
    expected = {name: set() for name in SOURCES}
    for row in rows:
        repo = row["source_repo"]
        if repo not in expected:
            raise SystemExit(f"Unknown source repository in inventory: {repo}")
        expected[repo].add(row["source_path"])

    temp = Path(tempfile.mkdtemp(prefix="moreai-source-mirror-"))
    try:
        # Preserve initialized submodule working trees before removing gitlinks.
        for name, rel in SOURCES.items():
            source = ROOT / rel
            if not (source / ".git").exists() and not (source / ".git").is_file():
                raise SystemExit(f"Submodule not initialized: {rel}")
            actual_commit = run("git", "-C", str(source), "rev-parse", "HEAD")
            pin = next(x for x in PINS["sources"] if x["vendor_path"] == rel)
            if actual_commit != pin["commit"]:
                raise SystemExit(f"{rel}: checked out {actual_commit}, expected {pin['commit']}")
            tracked = set(run("git", "-C", str(source), "ls-tree", "-r", "--name-only", "HEAD").splitlines())
            if tracked != expected[name]:
                missing, extra = sorted(expected[name] - tracked), sorted(tracked - expected[name])
                raise SystemExit(f"{name}: inventory mismatch; missing={missing[:8]}, extra={extra[:8]}")
            shutil.copytree(source, temp / name, ignore=shutil.ignore_patterns(".git"))

        # Replace gitlinks with normal tracked files; source contents remain byte-identical.
        subprocess.run(["git", "rm", "-r", "--cached", "--ignore-unmatch", *SOURCES.values(), ".gitmodules"], cwd=ROOT, check=True)
        for name, rel in SOURCES.items():
            destination = ROOT / rel
            if destination.exists():
                shutil.rmtree(destination)
            shutil.copytree(temp / name, destination)

        verified = 0
        for row in rows:
            source = ROOT / SOURCES[row["source_repo"]] / row["source_path"]
            if not source.is_file():
                raise SystemExit(f"Missing mirrored file: {row['source_repo']}/{row['source_path']}")
            actual_sha = blob_sha(source)
            if actual_sha != row["blob_sha"]:
                raise SystemExit(f"Blob SHA mismatch: {source}: {actual_sha} != {row['blob_sha']}")
            if source.stat().st_size != int(row["bytes"]):
                raise SystemExit(f"Size mismatch: {source}")
            verified += 1

        report = {
            "schema_version": 1,
            "verification": "passed",
            "files_verified": verified,
            "sources": [
                {
                    "repository": name,
                    "vendor_path": rel,
                    "commit": next(x["commit"] for x in PINS["sources"] if x["vendor_path"] == rel),
                    "files": len(expected[name]),
                }
                for name, rel in SOURCES.items()
            ],
        }
        (ROOT / "docs/source-migration/source-mirror-verification.json").write_text(
            json.dumps(report, indent=2) + "\n", encoding="utf-8"
        )
        print(f"Verified and materialized {verified} source files.")
    finally:
        shutil.rmtree(temp, ignore_errors=True)


if __name__ == "__main__":
    main()
