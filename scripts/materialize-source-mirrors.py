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
        # Read Git objects directly so checkout EOL/smudge filters cannot alter hashes.
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
            (temp / name).mkdir(parents=True)
            for source_path in sorted(expected[name]):
                blob = run("git", "-C", str(source), "rev-parse", f"HEAD:{source_path}")
                row = next(r for r in rows if r["source_repo"] == name and r["source_path"] == source_path)
                if blob != row["blob_sha"]:
                    raise SystemExit(f"Upstream object mismatch: {name}/{source_path}: {blob}")
                data = subprocess.check_output(["git", "-C", str(source), "cat-file", "blob", blob])
                calculated = hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()
                if calculated != blob or len(data) != int(row["bytes"]):
                    raise SystemExit(f"Upstream blob integrity failure: {name}/{source_path}")
                target = temp / name / source_path
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(data)
                mode = run("git", "-C", str(source), "ls-tree", "HEAD", "--", source_path).split()[0]
                if mode == "100755":
                    target.chmod(0o755)

        subprocess.run(["git", "rm", "-r", "--cached", "--ignore-unmatch", *SOURCES.values(), ".gitmodules"], cwd=ROOT, check=True)
        (ROOT / ".gitmodules").unlink(missing_ok=True)
        for name, rel in SOURCES.items():
            destination = ROOT / rel
            if destination.exists():
                shutil.rmtree(destination)
            shutil.copytree(temp / name, destination)

        verified = 0
        for row in rows:
            source = ROOT / SOURCES[row["source_repo"]] / row["source_path"]
            data = source.read_bytes()
            actual_sha = hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()
            if actual_sha != row["blob_sha"] or len(data) != int(row["bytes"]):
                raise SystemExit(f"Blob SHA/size mismatch: {source}: {actual_sha}")
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
