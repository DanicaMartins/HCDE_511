#!/usr/bin/env python3
"""
Stage 2 visualization (Plotly): reads only data/processed/*.json.

Run:
  python scripts/prepare_data.py
  python scripts/plot_overview.py
"""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path

import plotly.graph_objects as go
from plotly.subplots import make_subplots

from viz_common import (
    how_we_measure_section,
    limitations_section,
    national_insight_lede,
    wrap_chart_page,
    wrap_page,
)

ROOT = Path(__file__).resolve().parents[1]
PROCESSED = ROOT / "data" / "processed"
OUT = ROOT / "output"
SCRIPTS = ROOT / "scripts"


def load(name: str):
    with (PROCESSED / name).open(encoding="utf-8") as f:
        return json.load(f)


def _run_script(filename: str) -> None:
    spec = importlib.util.spec_from_file_location(filename, SCRIPTS / filename)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    mod.main()


def plot_aggregate_timeline(aggregate: list[dict], ai_models: list[dict]) -> go.Figure:
    months = [r["month"] for r in aggregate]
    values = [r["index"] for r in aggregate]

    fig = go.Figure()
    fig.add_trace(
        go.Scatter(
            x=months,
            y=values,
            mode="lines",
            name="US postings index (SA)",
            line=dict(color="#1A1714", width=2),
        )
    )
    fig.add_hline(y=100, line_dash="dash", line_color="#999", annotation_text="Feb 2020 = 100")

    for org, color in (("OpenAI", "#5B8DBF"), ("Anthropic", "#C8714A")):
        releases = [m["month"] for m in ai_models if m["org"] == org]
        if releases:
            fig.add_trace(
                go.Scatter(
                    x=releases,
                    y=[values[months.index(m)] if m in months else None for m in releases],
                    mode="markers",
                    name=f"{org} releases",
                    marker=dict(color=color, size=6, opacity=0.7),
                    text=[m["model"] for m in ai_models if m["org"] == org],
                    hovertemplate="%{text}<extra></extra>",
                )
            )

    fig.update_layout(
        title="US Job Postings Index (monthly mean, SA total postings)",
        xaxis_title="Month",
        yaxis_title="Index (Feb 2020 = 100)",
        template="plotly_white",
        height=420,
        margin=dict(l=50, r=30, t=50, b=50),
    )
    return fig


def plot_automation_vs_index(sectors: dict, crosswalk: dict) -> go.Figure:
    points = []
    for name, series in sectors.items():
        if not series:
            continue
        current = series[-1]["index"]
        cw = crosswalk.get(name, {"score": 50, "matchedCount": 0})
        points.append(
            dict(
                sector=name,
                index=current,
                automation=cw["score"],
                matched=cw.get("matchedCount", 0),
            )
        )

    fig = go.Figure()
    fig.add_trace(
        go.Scatter(
            x=[p["index"] for p in points],
            y=[p["automation"] for p in points],
            mode="markers",
            marker=dict(
                size=[max(8, min(28, p["matched"] ** 0.5 * 3)) for p in points],
                color=["#4A7A5A" if p["index"] >= 100 else "#B85040" for p in points],
                opacity=0.75,
            ),
            text=[p["sector"] for p in points],
            hovertemplate="%{text}<br>Index: %{x:.1f}<br>Automation: %{y}<extra></extra>",
        )
    )
    fig.add_vline(x=100, line_dash="dash", line_color="#999")
    fig.update_layout(
        title="Automation risk vs. current job index (by sector)",
        xaxis_title="Current index (latest month)",
        yaxis_title="Automation risk (0–100)",
        template="plotly_white",
        height=480,
    )
    return fig


def main() -> None:
    _run_script("plot_job_index_timeline.py")
    _run_script("plot_sector_drawdown.py")
    _run_script("plot_explore_dashboard.py")
    _run_script("build_guide.py")

    aggregate = load("monthly_aggregate.json")
    sectors = load("monthly_by_sector.json")
    crosswalk = load("automation_crosswalk.json")
    ai_models = load("ai_models.json")

    OUT.mkdir(parents=True, exist_ok=True)

    fig1 = plot_aggregate_timeline(aggregate, ai_models)
    fig2 = plot_automation_vs_index(sectors, crosswalk)

    div1 = fig1.to_html(full_html=False, include_plotlyjs="cdn", config={"displayModeBar": True})
    div2 = fig2.to_html(full_html=False, include_plotlyjs="cdn", config={"displayModeBar": True})

    (OUT / "aggregate_timeline.html").write_text(
        wrap_chart_page(
            "Aggregate timeline (simple)",
            "US postings index — simple view",
            "Compact national trend; see job_index_timeline.html for full context and AI release bars.",
            div1,
        ),
        encoding="utf-8",
    )
    (OUT / "automation_scatter.html").write_text(
        wrap_chart_page(
            "Automation vs index",
            "Automation risk vs. current job index",
            "Each point is a sector. Color: green if index ≥ 100 vs Feb 2020, else red. "
            "Bubble size reflects O*NET occupation match count.",
            div2,
        ),
        encoding="utf-8",
    )

    combined = make_subplots(rows=2, cols=1, subplot_titles=("Aggregate", "Sectors"))
    for trace in fig1.data:
        combined.add_trace(trace, row=1, col=1)
    for trace in fig2.data:
        combined.add_trace(trace, row=2, col=1)
    combined.update_layout(height=900, title_text="AI & Job Market — Plotly overview")
    comb_div = combined.to_html(full_html=False, include_plotlyjs="cdn", config={"displayModeBar": True})
    spec = importlib.util.spec_from_file_location(
        "plot_job_index_timeline", SCRIPTS / "plot_job_index_timeline.py"
    )
    timeline_mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(timeline_mod)
    stats = timeline_mod.compute_headline_stats(aggregate, ai_models)

    overview_body = f"""
  <p class="lede">Two-panel summary. Start at <a href="guide.html">guide.html</a> or use
  <a href="explore.html">explore.html</a> for the full linked story.</p>
  <div class="chart-wrap">{comb_div}</div>
  {how_we_measure_section()}
  {limitations_section()}
"""
    (OUT / "overview.html").write_text(
        wrap_page(
            title="Overview",
            h1="AI & Job Market — overview",
            lede=national_insight_lede(stats),
            body_html=overview_body,
            narrative_order="insight_first",
        ),
        encoding="utf-8",
    )

    print(f"Wrote {OUT / 'aggregate_timeline.html'}")
    print(f"Wrote {OUT / 'automation_scatter.html'}")
    print(f"Wrote {OUT / 'overview.html'}")


if __name__ == "__main__":
    main()
