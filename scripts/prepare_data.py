#!/usr/bin/env python3
"""ETL: raw HCDE_511 datasets -> validated JSON for visualization."""

from __future__ import annotations

import json
import re
import statistics
from datetime import datetime
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
INDEED = ROOT / "Indeed Postings"
OUT = ROOT / "data" / "processed"

SECTOR_TITLE_ALIASES = {
    "IT Infrastructure, Operations & Support": "IT Operations & Helpdesk",
    "IT Systems & Solutions": "IT Operations & Helpdesk",
    "Data & Analytics": "Information Design & Documentation",
}

FALLBACK_AUTOMATION_SCORE = 50
AUTOMATION_SCALE_MAX = 70

INDEX_SCALE_MIN = 60
INDEX_SCALE_MAX = 160

# Every Indeed sector appears in exactly one sidebar category (story UI).
SECTOR_CATEGORIES: dict[str, list[str]] = {
    "Knowledge Work": [
        "Accounting",
        "Administrative Assistance",
        "Banking & Finance",
        "Data & Analytics",
        "Human Resources",
        "IT Infrastructure, Operations & Support",
        "IT Systems & Solutions",
        "Legal",
        "Management",
        "Marketing",
        "Media & Communications",
        "Project Management",
        "Scientific Research & Development",
        "Software Development",
    ],
    "Care & Service": [
        "Cleaning & Sanitation",
        "Community & Social Service",
        "Customer Service",
        "Education & Instruction",
        "Food Preparation & Service",
        "Hospitality & Tourism",
        "Medical Information",
        "Medical Technician",
        "Nursing",
        "Pharmacy",
        "Physicians & Surgeons",
        "Security & Public Safety",
    ],
    "Tech & Engineering": [
        "Architecture",
        "Arts & Entertainment",
        "Civil Engineering",
        "Electrical Engineering",
        "Industrial Engineering",
        "Installation & Maintenance",
        "Loading & Stocking",
        "Logistic Support",
        "Production & Manufacturing",
        "Retail",
        "Sales",
    ],
}

CATEGORY_STYLES: dict[str, dict[str, str]] = {
    "Knowledge Work": {
        "color": "#5C4D7A",
        "bg": "#F3F0F8",
        "border": "#D8D0E8",
        "chartAccent": "#7B6BA8",
    },
    "Care & Service": {
        "color": "#3D6B5C",
        "bg": "#EFF5F2",
        "border": "#C5DDD4",
        "chartAccent": "#5A8F7A",
    },
    "Tech & Engineering": {
        "color": "#8A6B3D",
        "bg": "#F8F4ED",
        "border": "#E5D9C4",
        "chartAccent": "#B8925A",
    },
}


def _month_key(dt: pd.Timestamp) -> str:
    return dt.strftime("%Y-%m")


def load_monthly_aggregate() -> list[dict]:
    path = INDEED / "aggregate_job_postings_US.csv"
    df = pd.read_csv(path, parse_dates=["date"])
    df = df[df["variable"] == "total postings"].copy()
    df["month"] = df["date"].dt.to_period("M").astype(str)
    monthly = (
        df.groupby("month", as_index=False)["indeed_job_postings_index_SA"]
        .mean()
        .rename(columns={"indeed_job_postings_index_SA": "index"})
    )
    return [
        {"month": row.month, "index": round(float(row.index), 2)}
        for row in monthly.itertuples(index=False)
    ]


def load_monthly_by_sector() -> dict[str, list[dict]]:
    path = INDEED / "job_postings_by_sector_US.csv"
    df = pd.read_csv(path, parse_dates=["date"])
    df = df[df["variable"] == "total postings"].copy()
    df["display_name"] = df["display_name"].str.strip().str.strip('"')
    df["month"] = df["date"].dt.to_period("M").astype(str)
    monthly = (
        df.groupby(["display_name", "month"], as_index=False)["indeed_job_postings_index"]
        .mean()
        .rename(columns={"display_name": "sector", "indeed_job_postings_index": "index"})
    )
    out: dict[str, list[dict]] = {}
    for sector, grp in monthly.groupby("sector"):
        out[sector] = [
            {"month": r.month, "index": round(float(r.index), 2)}
            for r in grp.itertuples(index=False)
        ]
    return out


def load_sector_titles(sectors: list[str]) -> dict[str, str]:
    path = INDEED / "sector-job-title-examples.csv"
    df = pd.read_csv(path)
    lookup = dict(zip(df["sector"], df["job_titles"]))
    titles: dict[str, str] = {}
    for sector in sectors:
        alias = SECTOR_TITLE_ALIASES.get(sector, sector)
        titles[sector] = lookup.get(alias, lookup.get(sector, ""))
    return titles


def _parse_job_zone(zone: str) -> float | None:
    if pd.isna(zone):
        return None
    s = str(zone).strip()
    if s == "1-2":
        return 1.5
    m = re.match(r"^(\d+)$", s)
    return float(m.group(1)) if m else None


def load_onet_automation() -> pd.DataFrame:
    path = ROOT / "Degree_of_Automation(1).xlsx"
    raw = pd.read_excel(path, sheet_name=0, header=None)
    df = raw.iloc[4:].copy()
    df.columns = ["context", "job_zone", "onet_code", "occupation"]
    df["context"] = pd.to_numeric(df["context"], errors="coerce")
    df["occupation"] = df["occupation"].astype(str)
    df = df.dropna(subset=["context", "occupation"])
    return df


def _match_occupations(
    onet: pd.DataFrame, title_tokens: list[str]
) -> pd.DataFrame:
    matched_idx: set[int] = set()
    occ_lower = onet["occupation"].str.lower()

    for token in title_tokens:
        t = token.strip().lower()
        if len(t) < 3:
            continue
        hits = onet.index[occ_lower.str.contains(re.escape(t), regex=True, na=False)]
        matched_idx.update(hits.tolist())

    if not matched_idx:
        for token in title_tokens:
            parts = token.strip().lower().split()
            if not parts:
                continue
            first = parts[0]
            if len(first) < 4:
                continue
            hits = onet.index[occ_lower.str.contains(rf"\b{re.escape(first)}\b", regex=True, na=False)]
            matched_idx.update(hits.tolist())

    if not matched_idx:
        return onet.iloc[0:0]
    return onet.loc[sorted(matched_idx)]


def build_automation_crosswalk(
    sectors: list[str], sector_titles: dict[str, str], onet: pd.DataFrame
) -> dict[str, dict]:
    crosswalk: dict[str, dict] = {}
    for sector in sorted(sectors):
        raw_titles = sector_titles.get(sector, "")
        tokens = [t.strip() for t in raw_titles.split(",") if t.strip()]
        matched = _match_occupations(onet, tokens)
        count = len(matched)

        if count == 0:
            crosswalk[sector] = {
                "score": FALLBACK_AUTOMATION_SCORE,
                "jobZone": 3,
                "matchedCount": 0,
            }
            continue

        mean_context = float(matched["context"].mean())
        score = round(mean_context / AUTOMATION_SCALE_MAX * 100)
        zones = [_parse_job_zone(z) for z in matched["job_zone"]]
        zones = [z for z in zones if z is not None]
        job_zone = round(sum(zones) / len(zones), 1) if zones else 3

        crosswalk[sector] = {
            "score": score,
            "jobZone": job_zone,
            "matchedCount": count,
        }
    return crosswalk


def _parse_publication_date(val) -> pd.Timestamp | None:
    if pd.isna(val):
        return None
    if isinstance(val, (pd.Timestamp, datetime)):
        return pd.Timestamp(val)
    if isinstance(val, (int, float)):
        return pd.Timestamp("1899-12-30") + pd.Timedelta(days=float(val))
    parsed = pd.to_datetime(val, errors="coerce")
    return parsed if pd.notna(parsed) else None


def _org_label(org: str) -> str | None:
    if pd.isna(org):
        return None
    s = str(org)
    if "Anthropic" in s:
        return "Anthropic"
    if "OpenAI" in s:
        return "OpenAI"
    return None


def load_ai_models() -> list[dict]:
    path = ROOT / "OpenAI_Anthropic_Models.xlsx"
    df = pd.read_excel(path, sheet_name="OpenAI & Anthropic")
    cutoff = pd.Timestamp("2020-01-01")
    models: list[dict] = []

    for _, row in df.iterrows():
        org = _org_label(row.get("Organization"))
        if org is None:
            continue
        pub = _parse_publication_date(row.get("Publication date"))
        if pub is None or pub < cutoff:
            continue
        month = _month_key(pub)
        models.append(
            {
                "model": str(row.get("Model", "")),
                "org": org,
                "domain": str(row.get("Domain", "") or ""),
                "date": pub.strftime("%Y-%m-%d"),
                "month": month,
            }
        )

    models.sort(key=lambda m: (m["date"], m["model"]))
    seen: dict[str, dict] = {}
    for m in models:
        seen[m["model"]] = m
    return list(seen.values())


def _bar_pct(index: float) -> float:
    span = INDEX_SCALE_MAX - INDEX_SCALE_MIN
    return round(max(0.0, min(100.0, (index - INDEX_SCALE_MIN) / span * 100)), 1)


def _sector_drawdown_stats(series: list[dict]) -> dict:
    peak_row = max(series, key=lambda r: r["index"])
    current = series[-1]
    drawdown = round(current["index"] - peak_row["index"], 1)
    post_2022 = [r["index"] for r in series if r["month"] >= "2022-01"]
    volatility = round(statistics.pstdev(post_2022), 1) if len(post_2022) > 1 else 0.0
    return {
        "peakIndex": round(peak_row["index"], 2),
        "peakMonth": peak_row["month"],
        "currentIndex": round(current["index"], 2),
        "currentMonth": current["month"],
        "drawdown": drawdown,
        "belowBaseline": current["index"] < 100,
        "volatilitySince2022": volatility,
    }


def _sector_to_category() -> dict[str, str]:
    out: dict[str, str] = {}
    for cat, names in SECTOR_CATEGORIES.items():
        for name in names:
            out[name] = cat
    return out


def _build_heatmap(sectors: dict[str, list[dict]], sector_to_cat: dict[str, str]) -> dict:
    sample = next(iter(sectors.values()), [])
    months = [r["month"] for r in sample]
    cells: list[dict] = []
    sectors_grouped: list[dict] = []
    for cat, names in SECTOR_CATEGORIES.items():
        sectors_grouped.append({"category": cat, "sectors": names})
        for name in names:
            by_month = {r["month"]: r["index"] for r in sectors.get(name, [])}
            for month in months:
                if month in by_month:
                    cells.append(
                        {
                            "sector": name,
                            "category": cat,
                            "month": month,
                            "index": by_month[month],
                        }
                    )
    return {"months": months, "sectorsGrouped": sectors_grouped, "cells": cells}


def build_hero_facts(
    aggregate: list[dict],
    sector_stats: dict[str, dict],
    top10: list[dict],
    best_mom: tuple[float, str, str] | None,
) -> list[str]:
    """Short data-backed strings for the hero AI chatbox typewriter cycle."""
    facts: list[str] = []

    if aggregate:
        cur = aggregate[-1]
        y, m = cur["month"].split("-")
        month_label = datetime(int(y), int(m), 1).strftime("%B %Y")
        facts.append(
            f"U.S. job posting index ~{cur['index']:.0f} in {month_label} (100 = Feb 2020)"
        )

    covid = [r for r in aggregate if r["month"].startswith("2020-0")]
    if covid:
        trough = min(covid, key=lambda r: r["index"])
        ty, tm = trough["month"].split("-")
        t_label = datetime(int(ty), int(tm), 1).strftime("%B %Y")
        facts.append(f"COVID low ~{trough['index']:.0f} in {t_label} vs Feb 2020 baseline")

    if aggregate:
        peak = max(aggregate, key=lambda r: r["index"])
        if peak["index"] > 110:
            py, pm = peak["month"].split("-")
            p_label = datetime(int(py), int(pm), 1).strftime("%B %Y")
            facts.append(f"Hiring boom peaked ~{peak['index']:.0f} nationally in {p_label}")

    if best_mom:
        delta, sector, month = best_mom
        y, m = month.split("-")
        month_label = datetime(int(y), int(m), 1).strftime("%B %Y")
        facts.append(f"{sector} rose {delta:.0f} points month-over-month in {month_label}")

    if top10:
        leader = top10[0]
        facts.append(
            f"{leader['sector']} leads at index ~{leader['currentIndex']:.0f} vs Feb 2020"
        )

    if sector_stats:
        worst_name, worst_st = min(sector_stats.items(), key=lambda x: x[1]["drawdown"])
        if worst_st["drawdown"] < -10:
            facts.append(
                f"{worst_name} down {abs(worst_st['drawdown']):.0f} from its own posting peak"
            )

    seen: set[str] = set()
    out: list[str] = []
    for line in facts:
        if line in seen:
            continue
        seen.add(line)
        out.append(line)
        if len(out) >= 6:
            break
    return out


AI_ACCELERATION_START = "2024-01"


def _month_label(ym: str) -> str:
    y, m = ym.split("-")
    return datetime(int(y), int(m), 1).strftime("%B %Y")


def build_national_insights(aggregate: list[dict]) -> dict:
    peak = max(aggregate, key=lambda r: r["index"])
    current = aggregate[-1]
    covid = [r for r in aggregate if r["month"].startswith("2020-0")]
    if covid:
        trough = min(covid, key=lambda r: r["index"])
    else:
        trough = min(aggregate, key=lambda r: r["index"])
    pct_below = (
        round((peak["index"] - current["index"]) / peak["index"] * 100)
        if peak["index"]
        else 0
    )
    return {
        "peakMonth": peak["month"],
        "peakMonthLabel": _month_label(peak["month"]),
        "peakIndex": round(peak["index"], 1),
        "currentIndex": round(current["index"], 1),
        "currentMonthLabel": _month_label(current["month"]),
        "pctBelowPeak": pct_below,
        "covidDropPoints": round(100 - trough["index"]),
        "covidTroughMonth": trough["month"],
        "covidTroughIndex": round(trough["index"], 1),
    }


def build_ai_release_insights(ai_models: list[dict], latest_month: str) -> dict:
    by_month: dict[str, int] = {}
    for m in ai_models:
        by_month[m["month"]] = by_month.get(m["month"], 0) + 1
    peak_month = max(by_month, key=by_month.get) if by_month else latest_month
    return {
        "peakMonth": peak_month,
        "peakMonthLabel": _month_label(peak_month),
        "peakTotal": by_month[peak_month],
        "accelerationStart": AI_ACCELERATION_START,
        "accelerationEnd": latest_month,
        "accelerationStartLabel": _month_label(AI_ACCELERATION_START),
        "accelerationEndLabel": _month_label(latest_month),
    }


def build_story_meta(
    aggregate: list[dict],
    sectors: dict[str, list[dict]],
    sector_titles: dict[str, str],
    ai_models: list[dict],
) -> dict:
    flat = [s for group in SECTOR_CATEGORIES.values() for s in group]
    if sorted(flat) != sorted(sectors.keys()):
        missing = set(sectors.keys()) - set(flat)
        extra = set(flat) - set(sectors.keys())
        raise RuntimeError(
            f"SECTOR_CATEGORIES mismatch: missing={missing!r} extra={extra!r}"
        )

    sector_to_cat = _sector_to_category()
    sector_stats: dict[str, dict] = {}
    ranked: list[dict] = []
    for name, series in sectors.items():
        if not series:
            continue
        stats = _sector_drawdown_stats(series)
        cat = sector_to_cat[name]
        styles = CATEGORY_STYLES[cat]
        stats["titles"] = sector_titles.get(name, "")
        stats["category"] = cat
        sector_stats[name] = stats
        ranked.append(
            {
                "sector": name,
                "currentIndex": stats["currentIndex"],
                "barPct": _bar_pct(stats["currentIndex"]),
                "category": cat,
                "categoryColor": styles["color"],
            }
        )

    ranked.sort(key=lambda r: r["currentIndex"], reverse=True)
    top10 = [{"rank": i + 1, **row} for i, row in enumerate(ranked[:10])]
    top10_lowest = [
        {"rank": i + 1, **row}
        for i, row in enumerate(sorted(ranked, key=lambda r: r["currentIndex"])[:10])
    ]
    latest_month = aggregate[-1]["month"] if aggregate else "2026-04"
    national_insights = build_national_insights(aggregate)
    ai_release_insights = build_ai_release_insights(ai_models, latest_month)

    best_mom: tuple[float, str, str] | None = None
    for name, series in sectors.items():
        for i in range(1, len(series)):
            if series[i]["month"] < "2024-01":
                continue
            delta = series[i]["index"] - series[i - 1]["index"]
            if best_mom is None or delta > best_mom[0]:
                best_mom = (delta, name, series[i]["month"])

    if best_mom:
        delta, sector, month = best_mom
        y, m = month.split("-")
        month_label = datetime(int(y), int(m), 1).strftime("%B %Y")
        quick_fact = {
            "headline": (
                f"{sector} index rose {delta:.0f} points month-over-month in {month_label}"
            ),
            "footnote": "Patterns show overlap, not causation.",
            "linkText": "Quick Facts →",
            "linkAnchor": "#sector-detail",
        }
    else:
        sd = sector_stats.get("Software Development", {})
        quick_fact = {
            "headline": (
                f"Software Development is {abs(sd.get('drawdown', 0)):.0f} index points "
                "below its own peak"
            ),
            "footnote": "Patterns show overlap, not causation.",
            "linkText": "Quick Facts →",
            "linkAnchor": "#sector-detail",
        }

    hero_facts = build_hero_facts(aggregate, sector_stats, top10, best_mom)
    if not hero_facts:
        hero_facts = [quick_fact["headline"]]

    default_sector = "Administrative Assistance"
    return {
        "categories": SECTOR_CATEGORIES,
        "categoryStyles": CATEGORY_STYLES,
        "sectorToCategory": sector_to_cat,
        "defaultCategory": sector_to_cat[default_sector],
        "defaultSector": default_sector,
        "top10Highest": top10,
        "top10Lowest": top10_lowest,
        "sectorStats": sector_stats,
        "quickFact": quick_fact,
        "heroFacts": hero_facts,
        "nationalInsights": national_insights,
        "aiReleaseInsights": ai_release_insights,
        "indexScaleMin": INDEX_SCALE_MIN,
        "indexScaleMax": INDEX_SCALE_MAX,
        "heatmap": _build_heatmap(sectors, sector_to_cat),
        "compareSuggestions": [
            "Data & Analytics",
            "Project Management",
            "Marketing",
            "Nursing",
            "Civil Engineering",
        ],
    }


def write_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
        f.write("\n")


def run_validation(
    aggregate: list[dict],
    sectors: dict[str, list[dict]],
    crosswalk: dict[str, dict],
) -> dict:
    """Return validation report; raises on hard failures."""
    errors: list[str] = []
    warnings: list[str] = []

    feb = next((r for r in aggregate if r["month"] == "2020-02"), None)
    if feb is None:
        errors.append("Missing 2020-02 in aggregate")
    elif abs(feb["index"] - 100) > 2:
        warnings.append(f"Feb 2020 aggregate {feb['index']:.2f} (expected ~100)")

    if len(sectors) != 37:
        errors.append(f"Expected 37 sectors, got {len(sectors)}")

    covid = [r for r in aggregate if r["month"].startswith("2020-0")]
    if covid:
        trough = min(covid, key=lambda r: r["index"])
        if trough["index"] > 75:
            warnings.append(f"COVID trough month {trough['month']} index {trough['index']:.1f} (expected ~67)")

    its = sectors.get("IT Systems & Solutions", [])
    apr26 = next((r for r in its if r["month"] == "2026-04"), None)
    if apr26 and not (68 <= apr26["index"] <= 78):
        warnings.append(f"IT Systems 2026-04 index {apr26['index']:.1f} (expected ~73)")

    acct = crosswalk.get("Accounting", {})
    if acct.get("score") != 73:
        warnings.append(f"Accounting automation score {acct.get('score')} (reference viz: 73)")

    if errors:
        raise RuntimeError("Validation failed:\n" + "\n".join(errors))

    return {
        "status": "ok",
        "errors": errors,
        "warnings": warnings,
        "sector_count": len(sectors),
        "aggregate_months": len(aggregate),
        "latest_aggregate_month": aggregate[-1]["month"] if aggregate else None,
    }


def main() -> None:
    aggregate = load_monthly_aggregate()
    sectors = load_monthly_by_sector()
    sector_names = sorted(sectors.keys())
    sector_titles = load_sector_titles(sector_names)
    onet = load_onet_automation()
    crosswalk = build_automation_crosswalk(sector_names, sector_titles, onet)
    ai_models = load_ai_models()

    validation = run_validation(aggregate, sectors, crosswalk)

    write_json(OUT / "monthly_aggregate.json", aggregate)
    write_json(OUT / "monthly_by_sector.json", sectors)
    write_json(OUT / "sector_titles.json", sector_titles)
    write_json(OUT / "automation_crosswalk.json", crosswalk)
    write_json(OUT / "ai_models.json", ai_models)
    write_json(
        OUT / "story_meta.json",
        build_story_meta(aggregate, sectors, sector_titles, ai_models),
    )
    write_json(
        OUT / "metadata.json",
        {
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "validation": validation,
            "ai_model_count": len(ai_models),
        },
    )

    print(f"Wrote processed data to {OUT}")
    if validation["warnings"]:
        print("Warnings:")
        for w in validation["warnings"]:
            print(f"  - {w}")


if __name__ == "__main__":
    main()
