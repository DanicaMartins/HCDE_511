#!/usr/bin/env python3
"""Build Job Market story (Next.js static export → output/guide.html)."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    subprocess.run([sys.executable, str(ROOT / "scripts" / "build_guide.py")], check=True)


if __name__ == "__main__":
    main()
