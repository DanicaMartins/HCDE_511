#!/usr/bin/env python3
"""Sync data, build Next.js story, copy static export to output/guide.html."""

from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JOB_MARKET = ROOT / "job-market"
OUT = ROOT / "out"
OUTPUT = ROOT / "output"
SCRIPTS = ROOT / "scripts"


def main() -> None:
    subprocess.run([sys.executable, str(SCRIPTS / "sync_story_assets.py")], check=True)

    lock = JOB_MARKET / "package-lock.json"
    if lock.exists():
        subprocess.run(["npm", "ci"], cwd=JOB_MARKET, check=True)
    else:
        subprocess.run(["npm", "install"], cwd=JOB_MARKET, check=True)
    subprocess.run(["npm", "run", "build"], cwd=JOB_MARKET, check=True)

    export_dir = JOB_MARKET / "out"
    if not export_dir.exists():
        raise RuntimeError(f"Missing Next export at {export_dir}")

    OUTPUT.mkdir(parents=True, exist_ok=True)
    index = export_dir / "index.html"
    if not index.exists():
        raise RuntimeError("Next export missing index.html")

    shutil.copy2(index, OUTPUT / "guide.html")

    next_src = export_dir / "_next"
    next_dst = OUTPUT / "_next"
    if next_dst.exists():
        shutil.rmtree(next_dst)
    if next_src.exists():
        shutil.copytree(next_src, next_dst)

    for name in ("favicon.ico", "404.html"):
        src = export_dir / name
        if src.exists():
            shutil.copy2(src, OUTPUT / name)

    print(f"Wrote {OUTPUT / 'guide.html'}")
    print(f"Wrote {OUTPUT / '_next'}/")


if __name__ == "__main__":
    main()
