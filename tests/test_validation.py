"""Sanity checks for processed data (run after prepare_data.py)."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
PROCESSED = ROOT / "data" / "processed"


def _load(name: str):
    path = PROCESSED / name
    assert path.exists(), f"Missing {path}; run: python scripts/prepare_data.py"
    return json.loads(path.read_text(encoding="utf-8"))


@pytest.fixture(scope="module")
def aggregate():
    return _load("monthly_aggregate.json")


@pytest.fixture(scope="module")
def sectors():
    return _load("monthly_by_sector.json")


@pytest.fixture(scope="module")
def crosswalk():
    return _load("automation_crosswalk.json")


@pytest.fixture(scope="module")
def ai_models():
    return _load("ai_models.json")


def test_aggregate_feb_2020_near_baseline(aggregate):
    feb = next(r for r in aggregate if r["month"] == "2020-02")
    assert 98 <= feb["index"] <= 102


def test_aggregate_covid_trough(aggregate):
    covid = [r for r in aggregate if r["month"].startswith("2020-0")]
    trough = min(covid, key=lambda r: r["index"])
    assert trough["index"] < 75
    assert trough["month"] in ("2020-04", "2020-05")


def test_aggregate_latest_month(aggregate):
    assert aggregate[-1]["month"] == "2026-04"
    assert 100 <= aggregate[-1]["index"] <= 105


def test_sector_count(sectors):
    assert len(sectors) == 37


def test_it_systems_apr_2026(sectors):
    series = sectors["IT Systems & Solutions"]
    apr = next(r for r in series if r["month"] == "2026-04")
    assert 68 <= apr["index"] <= 78


def test_accounting_automation_score(crosswalk):
    assert crosswalk["Accounting"]["score"] == 73


def test_banking_finance_fallback(crosswalk):
    assert crosswalk["Banking & Finance"]["score"] == 50
    assert crosswalk["Banking & Finance"]["matchedCount"] == 0


def test_all_sectors_have_crosswalk(sectors, crosswalk):
    assert set(crosswalk.keys()) == set(sectors.keys())


def test_story_meta():
    meta = _load("story_meta.json")
    assert len(meta["top10Highest"]) == 10
    assert meta["defaultSector"] == "Administrative Assistance"
    assert len(meta["categories"]) == 3
    assert "Care & Service" in meta["categories"]
    assert meta["sectorToCategory"]["Nursing"] == "Care & Service"
    flat = [s for g in meta["categories"].values() for s in g]
    sectors = _load("monthly_by_sector.json")
    assert len(flat) == 37
    assert set(flat) == set(sectors.keys())
    assert len(meta["heatmap"]["cells"]) == 37 * len(meta["heatmap"]["months"])


def test_ai_models_count(ai_models):
    assert len(ai_models) >= 120


def test_ai_models_have_required_fields(ai_models):
    sample = ai_models[0]
    for key in ("model", "org", "date", "month"):
        assert key in sample
    assert sample["org"] in ("OpenAI", "Anthropic")


def test_metadata_ok():
    meta = _load("metadata.json")
    assert meta["validation"]["status"] == "ok"
    assert meta["validation"]["sector_count"] == 37
