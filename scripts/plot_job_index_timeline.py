#!/usr/bin/env python3
"""
US job postings index over time — clearer version of ai-viz Section 1.

Reads only data/processed/*.json. Produces output/job_index_timeline.html

  python scripts/prepare_data.py
  python scripts/plot_job_index_timeline.py
"""

from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

import plotly.graph_objects as go
from plotly.subplots import make_subplots

from viz_common import (
    ANTHROPIC,
    BG,
    BORDER,
    GREEN,
    OPENAI,
    RED,
    TEXT,
    enrich_national_stats,
    format_month,
    wrap_insight_timeline_page,
)

ROOT = Path(__file__).resolve().parents[1]
PROCESSED = ROOT / "data" / "processed"
OUT = ROOT / "output"


def load(name: str):
    with (PROCESSED / name).open(encoding="utf-8") as f:
        return json.load(f)


def pct_vs_baseline(index: float) -> str:
    delta = index - 100
    if abs(delta) < 0.5:
        return "same as Feb 2020"
    if delta > 0:
        return f"{delta:.0f}% more postings than Feb 2020"
    return f"{abs(delta):.0f}% fewer postings than Feb 2020"


def compute_headline_stats(aggregate: list[dict], ai_models: list[dict]) -> dict:
    months = [r["month"] for r in aggregate]
    values = [r["index"] for r in aggregate]
    current = aggregate[-1]
    peak_row = max(aggregate, key=lambda r: r["index"])
    covid_rows = [r for r in aggregate if r["month"] >= "2020-03" and r["month"] <= "2020-07"]
    trough_row = min(covid_rows, key=lambda r: r["index"]) if covid_rows else aggregate[0]

    return {
        "current_index": current["index"],
        "current_month": current["month"],
        "current_label": pct_vs_baseline(current["index"]),
        "peak_index": peak_row["index"],
        "peak_month": peak_row["month"],
        "peak_label": pct_vs_baseline(peak_row["index"]),
        "trough_index": trough_row["index"],
        "trough_month": trough_row["month"],
        "trough_label": pct_vs_baseline(trough_row["index"]),
        "ai_model_count": len(ai_models),
        "month_count": len(months),
    }


def ai_releases_by_month(ai_models: list[dict]) -> dict[str, dict[str, list[str]]]:
    by_month: dict[str, dict[str, list[str]]] = defaultdict(lambda: {"OpenAI": [], "Anthropic": []})
    for m in ai_models:
        by_month[m["month"]][m["org"]].append(m["model"])
    return dict(by_month)


def build_figure(aggregate: list[dict], ai_models: list[dict]) -> go.Figure:
    months = [r["month"] for r in aggregate]
    values = [r["index"] for r in aggregate]
    stats = compute_headline_stats(aggregate, ai_models)
    ai_by_month = ai_releases_by_month(ai_models)

    fig = make_subplots(
        rows=2,
        cols=1,
        shared_xaxes=True,
        row_heights=[0.72, 0.28],
        vertical_spacing=0.06,
        subplot_titles=(
            "Job Posting Index (Feb 1, 2020 = 100)",
            "No. of AI model releases per month",
        ),
    )

    # Shaded bands: index above vs below Feb 2020 baseline
    above_y = [max(v, 100) for v in values]
    below_y = [min(v, 100) for v in values]
    fig.add_trace(
        go.Scatter(
            x=months + months[::-1],
            y=above_y + [100] * len(months),
            fill="toself",
            fillcolor="rgba(74, 122, 90, 0.14)",
            line=dict(width=0),
            hoverinfo="skip",
            showlegend=False,
        ),
        row=1,
        col=1,
    )
    fig.add_trace(
        go.Scatter(
            x=months + months[::-1],
            y=below_y + [100] * len(months),
            fill="toself",
            fillcolor="rgba(184, 80, 64, 0.12)",
            line=dict(width=0),
            hoverinfo="skip",
            showlegend=False,
        ),
        row=1,
        col=1,
    )

    custom = [
        f"<b>{m}</b><br>Index: {v:.1f}<br>{pct_vs_baseline(v)}<extra></extra>"
        for m, v in zip(months, values)
    ]
    fig.add_trace(
        go.Scatter(
            x=months,
            y=values,
            mode="lines",
            name="Postings index",
            line=dict(color=TEXT, width=2.5),
            customdata=custom,
            hovertemplate="%{customdata}",
        ),
        row=1,
        col=1,
    )

    fig.add_hline(
        y=100,
        line_dash="dash",
        line_color="#888888",
        line_width=1,
        annotation_text="Feb 2020 baseline (100)",
        annotation_position="left",
        row=1,
        col=1,
    )

    # AI release bars (stacked counts per month)
    oai_counts = []
    anth_counts = []
    bar_months = sorted(set(months) | set(ai_by_month.keys()))
    for m in bar_months:
        bucket = ai_by_month.get(m, {"OpenAI": [], "Anthropic": []})
        oai_counts.append(len(bucket["OpenAI"]))
        anth_counts.append(len(bucket["Anthropic"]))

    fig.add_trace(
        go.Bar(
            x=bar_months,
            y=oai_counts,
            name="OpenAI releases",
            marker_color=OPENAI,
            opacity=0.9,
            hovertemplate="%{x}<br>OpenAI: %{y} model(s)<extra></extra>",
        ),
        row=2,
        col=1,
    )
    fig.add_trace(
        go.Bar(
            x=bar_months,
            y=anth_counts,
            name="Anthropic releases",
            marker_color=ANTHROPIC,
            opacity=0.9,
            hovertemplate="%{x}<br>Anthropic: %{y} model(s)<extra></extra>",
        ),
        row=2,
        col=1,
    )

    fig.update_layout(barmode="stack")

    # AI Acceleration shading (context window; not causal)
    fig.add_vrect(
        x0="2024-01",
        x1=months[-1],
        fillcolor="rgba(139, 175, 196, 0.12)",
        line_width=0,
        row=1,
        col=1,
    )

    annotations = [
        dict(
            x=stats["trough_month"],
            y=stats["trough_index"],
            xref="x",
            yref="y",
            text=f"COVID drop ~{stats['trough_index']:.0f}",
            showarrow=True,
            arrowhead=2,
            ax=45,
            ay=-48,
            font=dict(size=11, color=RED),
            bgcolor="rgba(255,255,255,0.92)",
            bordercolor=BORDER,
        ),
        dict(
            x=stats["peak_month"],
            y=stats["peak_index"],
            xref="x",
            yref="y",
            text=f"Hiring boom peak ~{stats['peak_index']:.0f}",
            showarrow=True,
            arrowhead=2,
            ax=-15,
            ay=-38,
            font=dict(size=11, color=TEXT),
            bgcolor="rgba(255,255,255,0.92)",
            bordercolor=BORDER,
        ),
        dict(
            x=stats["current_month"],
            y=stats["current_index"],
            xref="x",
            yref="y",
            text=f"2026 near baseline ~{stats['current_index']:.0f}",
            showarrow=True,
            arrowhead=2,
            ax=48,
            ay=28,
            font=dict(size=11, color=GREEN),
            bgcolor="rgba(255,255,255,0.92)",
            bordercolor=BORDER,
        ),
        dict(
            x="2024-06",
            y=185,
            xref="x",
            yref="y",
            text="AI Acceleration",
            showarrow=False,
            font=dict(size=10, color=OPENAI),
            bgcolor="rgba(255,255,255,0.7)",
            bordercolor=BORDER,
        ),
    ]

    fig.update_layout(
        title=None,
        paper_bgcolor=BG,
        plot_bgcolor="#FFFFFF",
        font=dict(family="Helvetica Neue, Helvetica, Arial, sans-serif", color=TEXT, size=12),
        height=720,
        margin=dict(l=56, r=24, t=80, b=48),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, x=0),
        hovermode="x unified",
        annotations=annotations,
    )
    fig.update_xaxes(showgrid=True, gridcolor=BORDER, row=2, col=1)
    fig.update_yaxes(
        title_text="Index (Feb 2020 = 100)",
        gridcolor=BORDER,
        range=[0, 200],
        row=1,
        col=1,
    )
    fig.update_yaxes(title_text="Releases", gridcolor=BORDER, row=2, col=1)

    return fig, stats


def build_story_national_figure(
    aggregate: list[dict], ai_models: list[dict]
) -> tuple[go.Figure, dict]:
    """Full national timeline + AI bars for Job Market story page."""
    return build_figure(aggregate, ai_models)


def build_guide_timeline_figure(aggregate: list[dict], ai_models: list[dict]) -> tuple[go.Figure, dict]:
    """Single-panel timeline for guide page: 3 callouts, no AI bar panel."""
    months = [r["month"] for r in aggregate]
    values = [r["index"] for r in aggregate]
    stats = compute_headline_stats(aggregate, ai_models)
    enriched = enrich_national_stats(stats)

    fig = go.Figure()
    above_y = [max(v, 100) for v in values]
    below_y = [min(v, 100) for v in values]
    fig.add_trace(
        go.Scatter(
            x=months + months[::-1],
            y=above_y + [100] * len(months),
            fill="toself",
            fillcolor="rgba(74, 122, 90, 0.14)",
            line=dict(width=0),
            hoverinfo="skip",
            showlegend=False,
        )
    )
    fig.add_trace(
        go.Scatter(
            x=months + months[::-1],
            y=below_y + [100] * len(months),
            fill="toself",
            fillcolor="rgba(184, 80, 64, 0.12)",
            line=dict(width=0),
            hoverinfo="skip",
            showlegend=False,
        )
    )
    custom = [
        f"<b>{format_month(m)}</b><br>Index: {v:.1f}<br>{pct_vs_baseline(v)}<extra></extra>"
        for m, v in zip(months, values)
    ]
    fig.add_trace(
        go.Scatter(
            x=months,
            y=values,
            mode="lines",
            name="Postings index",
            line=dict(color=GREEN, width=2.5),
            customdata=custom,
            hovertemplate="%{customdata}",
        )
    )
    fig.add_hline(
        y=100,
        line_dash="dash",
        line_color="#888888",
        line_width=1,
    )

    annotations = [
        dict(
            x=stats["trough_month"],
            y=stats["trough_index"],
            text=f"COVID drop ~{stats['trough_index']:.0f}<br>postings collapsed",
            showarrow=True,
            arrowhead=2,
            ax=50,
            ay=-45,
            font=dict(size=11, color=RED),
            bgcolor="rgba(255,255,255,0.92)",
            bordercolor=BORDER,
        ),
        dict(
            x=stats["peak_month"],
            y=stats["peak_index"],
            text=(
                f"Hiring boom peak ~{stats['peak_index']:.0f}<br>"
                f"+{enriched['pct_above_baseline']}% vs Feb 2020"
            ),
            showarrow=True,
            arrowhead=2,
            ax=-20,
            ay=-40,
            font=dict(size=11, color=TEXT),
            bgcolor="rgba(255,255,255,0.92)",
            bordercolor=BORDER,
        ),
        dict(
            x=stats["current_month"],
            y=stats["current_index"],
            text=(
                f"{format_month(stats['current_month'])}<br>"
                f"near baseline ~{stats['current_index']:.0f}"
            ),
            showarrow=True,
            arrowhead=2,
            ax=45,
            ay=25,
            font=dict(size=11, color=GREEN),
            bgcolor="rgba(255,255,255,0.92)",
            bordercolor=BORDER,
        ),
    ]

    fig.update_layout(
        title=None,
        paper_bgcolor="#FFFFFF",
        plot_bgcolor="#FFFFFF",
        font=dict(family="Helvetica Neue, Helvetica, Arial, sans-serif", color=TEXT, size=12),
        height=380,
        margin=dict(l=52, r=24, t=24, b=48),
        hovermode="x unified",
        annotations=annotations,
        showlegend=False,
    )
    fig.update_xaxes(showgrid=True, gridcolor=BORDER, title_text="")
    fig.update_yaxes(
        title_text="Index (Feb 2020 = 100)",
        gridcolor=BORDER,
        range=[0, 200],
    )
    return fig, stats


def render_html_page(fig: go.Figure, stats: dict) -> str:
    chart_div = fig.to_html(full_html=False, include_plotlyjs="cdn", config={"displayModeBar": True})
    return wrap_insight_timeline_page(
        title="US Job Postings Index — Contextual Timeline",
        h1="US Job Postings Index, 2020–2026",
        stats=stats,
        chart_div=chart_div,
        footer_extra=f"{stats['month_count']} months · ",
    )


def main() -> None:
    aggregate = load("monthly_aggregate.json")
    ai_models = load("ai_models.json")
    fig, stats = build_figure(aggregate, ai_models)

    OUT.mkdir(parents=True, exist_ok=True)
    out_path = OUT / "job_index_timeline.html"
    out_path.write_text(render_html_page(fig, stats), encoding="utf-8")
    print(f"Wrote {out_path}")
    print(
        f"  Latest: {stats['current_index']:.1f} ({stats['current_month']}) — {stats['current_label']}"
    )


if __name__ == "__main__":
    main()
