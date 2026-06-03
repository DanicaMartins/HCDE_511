#!/usr/bin/env python3
"""Copy processed JSON into job-market/public/data for Next build."""

from __future__ import annotations

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "data" / "processed"
DST = ROOT / "job-market" / "public" / "data"

FILES = [
    "monthly_aggregate.json",
    "monthly_by_sector.json",
    "story_meta.json",
    "automation_crosswalk.json",
    "sector_titles.json",
    "ai_models.json",
]


def main() -> None:
    DST.mkdir(parents=True, exist_ok=True)
    for name in FILES:
        shutil.copy2(SRC / name, DST / name)
    print(f"Synced {len(FILES)} files to {DST}")


if __name__ == "__main__":
    main()
