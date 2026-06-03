#!/usr/bin/env python3
"""Sector drawdown from peak — insight chart (AEI-style exemplars)."""

from __future__ import annotations

import json
from pathlib import Path

import plotly.graph_objects as go

from viz_common import (
    BG,
    BORDER,
    GREEN,
    RED,
    TEXT,
    format_month,
    how_we_measure_section,
    limitations_section,
    wrap_page,
)

ROOT = Path(__file__).resolve().parents[1]
PROCESSED = ROOT / "data" / "processed"
OUT = ROOT / "output"

EXEMPLARS = [
    "Software Development",
    "IT Systems & Solutions",
    "Nursing",
    "Accounting",
    "Marketing",
]


def load(name: str):
    with (PROCESSED / name).open(encoding="utf-8") as f:
        return json.load(f)


def compute_drawdowns(sectors: dict) -> list[dict]:
    rows = []
    for name, series in sectors.items():
        if not series:
            continue
        peak_row = max(series, key=lambda r: r["index"])
        current = series[-1]
        drawdown = current["index"] - peak_row["index"]
        pct_from_peak = (current["index"] / peak_row["index"] - 1) * 100
        rows.append(
            {
                "sector": name,
                "peak_index": peak_row["index"],
                "peak_month": peak_row["month"],
                "current_index": current["index"],
                "current_month": current["month"],
                "drawdown": drawdown,
                "pct_from_peak": pct_from_peak,
                "is_exemplar": name in EXEMPLARS,
            }
        )
    rows.sort(key=lambda r: r["drawdown"])
    return rows


def build_figure(rows: list[dict]) -> go.Figure:
    # Horizontal bar: drawdown (negative = below peak)
    sectors = [r["sector"] for r in rows]
    drawdowns = [r["drawdown"] for r in rows]
    colors = []
    for r in rows:
        if r["is_exemplar"]:
            colors.append(RED if r["drawdown"] < -15 else "#C8714A")
        else:
            colors.append("#B8B0A8" if r["drawdown"] < 0 else GREEN)

    fig = go.Figure()
    fig.add_trace(
        go.Bar(
            y=sectors,
            x=drawdowns,
            orientation="h",
            marker_color=colors,
            customdata=[
                (
                    f"Peak: {r['peak_index']:.0f} ({r['peak_month']})<br>"
                    f"Now: {r['current_index']:.0f} ({r['current_month']})<br>"
                    f"{r['pct_from_peak']:.0f}% vs peak"
                )
                for r in rows
            ],
            hovertemplate="%{y}<br>Drawdown: %{x:.1f} pts<br>%{customdata}<extra></extra>",
        )
    )
    fig.add_vline(x=0, line_color="#888", line_width=1)
    fig.update_layout(
        title=dict(
            text="Distance from each sector’s peak posting index",
            x=0,
            font=dict(size=18, family="Georgia, serif", color=TEXT),
        ),
        xaxis_title="Index points below peak (negative = fewer postings than peak month)",
        yaxis_title="",
        paper_bgcolor=BG,
        plot_bgcolor="#FFFFFF",
        height=max(520, len(rows) * 16),
        margin=dict(l=200, r=40, t=60, b=50),
        font=dict(family="Helvetica Neue, sans-serif", color=TEXT),
        showlegend=False,
    )
    fig.update_yaxes(autorange="reversed")
    return fig


def peak_now_pair(series: list[dict], label: str) -> dict:
    peak_row = max(series, key=lambda r: r["index"])
    current = series[-1]
    return {
        "label": label,
        "peak_index": peak_row["index"],
        "peak_month": peak_row["month"],
        "current_index": current["index"],
        "current_month": current["month"],
    }


def build_peak_now_dumbbell(
    national_series: list[dict],
    sector_series: list[dict],
    sector_name: str = "Software Development",
) -> tuple[go.Figure, dict, dict]:
    """Two-row peak→now range chart for guide page (shared x-scale)."""
    us = peak_now_pair(national_series, "U.S. total")
    sector = peak_now_pair(sector_series, sector_name)
    pairs = [us, sector]
    x_max = max(p["peak_index"] for p in pairs) * 1.05
    x_max = max(x_max, 240)

    fig = go.Figure()
    for p in pairs:
        hover = (
            f"<b>{p['label']}</b><br>"
            f"Peak: {p['peak_index']:.0f} ({format_month(p['peak_month'])})<br>"
            f"Now: {p['current_index']:.0f} ({format_month(p['current_month'])})<extra></extra>"
        )
        fig.add_trace(
            go.Scatter(
                x=[p["peak_index"], p["current_index"]],
                y=[p["label"], p["label"]],
                mode="lines+markers",
                line=dict(color="#B8B0A8", width=3),
                marker=dict(
                    size=[14, 14],
                    symbol=["circle", "circle-open"],
                    color=[RED, GREEN],
                    line=dict(width=2, color=GREEN),
                ),
                showlegend=False,
                hovertemplate=hover,
            )
        )

    fig.update_layout(
        title=None,
        paper_bgcolor="#FFFFFF",
        plot_bgcolor="#FFFFFF",
        height=220,
        margin=dict(l=160, r=40, t=16, b=48),
        font=dict(family="Helvetica Neue, sans-serif", color=TEXT, size=12),
        xaxis=dict(
            title="Posting index (Feb 2020 = 100)",
            range=[0, x_max],
            gridcolor=BORDER,
        ),
        yaxis=dict(title="", autorange="reversed"),
    )
    fig.add_vline(x=100, line_dash="dash", line_color="#999", line_width=1)
    return fig, us, sector


def sector_summary_json(rows: list[dict]) -> str:
    """Compact dict for explore.html JS."""
    return json.dumps({r["sector"]: r for r in rows}, indent=None)


def main() -> None:
    sectors = load("monthly_by_sector.json")
    rows = compute_drawdowns(sectors)
    fig = build_figure(rows)
    chart_div = fig.to_html(full_html=False, include_plotlyjs="cdn", config={"displayModeBar": True})

    worst = rows[0]
    best_drawdown = rows[-1]
    insight_lede = (
        f"<p class=\"insight-lede\">The <strong>US total</strong> looks almost back to Feb 2020, but sectors "
        f"diverge sharply. <strong>{worst['sector']}</strong> is still "
        f"<strong>{abs(worst['drawdown']):.0f} index points</strong> below its peak "
        f"({format_month(worst['peak_month'])}). "
        f"<strong>{best_drawdown['sector']}</strong> is closest to its own high "
        f"({best_drawdown['drawdown']:+.0f} pts). Highlighted bars are example sectors.</p>"
    )

    body = f"""
  <div class="chart-wrap">{chart_div}</div>
  {how_we_measure_section()}
  {limitations_section()}
"""
    html = wrap_page(
        title="Sector drawdown from peak",
        h1="Sector drawdown from peak",
        lede=insight_lede,
        body_html=body,
        narrative_order="insight_first",
    )
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "sector_drawdown.html").write_text(html, encoding="utf-8")
    (OUT / "sector_drawdown_data.json").write_text(sector_summary_json(rows), encoding="utf-8")
    print(f"Wrote {OUT / 'sector_drawdown.html'}")
    print(f"  Largest drawdown: {worst['sector']} ({worst['drawdown']:.1f})")


if __name__ == "__main__":
    main()
