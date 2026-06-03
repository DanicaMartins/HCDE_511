#!/usr/bin/env python3
"""Unified explorer: timeline + drawdown + linked sector detail."""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path

from viz_common import (
    how_we_measure_section,
    limitations_section,
    national_insight_lede,
    stat_cards_insight_first,
    wrap_page,
)

ROOT = Path(__file__).resolve().parents[1]
PROCESSED = ROOT / "data" / "processed"
OUT = ROOT / "output"
SCRIPTS = ROOT / "scripts"


def _load_module(name: str, filename: str):
    spec = importlib.util.spec_from_file_location(name, SCRIPTS / filename)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def load(name: str):
    with (PROCESSED / name).open(encoding="utf-8") as f:
        return json.load(f)


def main() -> None:
    timeline = _load_module("plot_job_index_timeline", "plot_job_index_timeline.py")
    drawdown = _load_module("plot_sector_drawdown", "plot_sector_drawdown.py")

    aggregate = load("monthly_aggregate.json")
    ai_models = load("ai_models.json")
    sectors = load("monthly_by_sector.json")
    crosswalk = load("automation_crosswalk.json")
    titles = load("sector_titles.json")

    fig_tl, stats = timeline.build_figure(aggregate, ai_models)
    rows = drawdown.compute_drawdowns(sectors)
    fig_dd = drawdown.build_figure(rows)

    tl_div = fig_tl.to_html(full_html=False, include_plotlyjs="cdn", div_id="chart-timeline")
    dd_div = fig_dd.to_html(full_html=False, include_plotlyjs=False, div_id="chart-drawdown")

    embed = {
        "sectors": sectors,
        "summary": {r["sector"]: r for r in rows},
        "crosswalk": crosswalk,
        "titles": titles,
        "defaultSector": "Software Development",
    }
    embed_js = json.dumps(embed)

    body = f"""
  {stat_cards_insight_first(stats)}
  <p class="lede">Sector view: <strong>{rows[0]['sector']}</strong> is furthest below its own peak
  (<strong>{rows[0]['drawdown']:.0f}</strong> index points). Use the charts below to compare national
  trend, sector drawdown, and one sector at a time.</p>

  <h2>National trend</h2>
  <div class="chart-wrap">{tl_div}</div>

  <h2>Sector drawdown from peak</h2>
  <div class="chart-wrap">{dd_div}</div>

  <h2>Sector detail</h2>
  <div class="sector-picker">
    <label for="sector-select"><strong>Explore sector:</strong></label>
    <select id="sector-select" aria-label="Choose sector"></select>
  </div>
  <div class="detail-panel" id="detail-panel"></div>
  <div class="chart-wrap"><div id="chart-sector" style="min-height:360px"></div></div>

  <script>
  const DATA = {embed_js};
  const select = document.getElementById('sector-select');
  const panel = document.getElementById('detail-panel');
  const sectors = Object.keys(DATA.sectors).sort();
  sectors.forEach(s => {{
    const o = document.createElement('option');
    o.value = s; o.textContent = s;
    select.appendChild(o);
  }});
  const params = new URLSearchParams(window.location.search);
  const sectorParam = params.get('sector');
  if (sectorParam && sectors.includes(sectorParam)) {{
    select.value = sectorParam;
  }} else {{
    select.value = DATA.defaultSector;
  }}

  function pctLabel(idx) {{
    const d = idx - 100;
    if (Math.abs(d) < 0.5) return 'same as Feb 2020';
    return d > 0 ? `${{d.toFixed(0)}}% more than Feb 2020` : `${{Math.abs(d).toFixed(0)}}% fewer than Feb 2020`;
  }}

  function renderSector(name) {{
    const series = DATA.sectors[name] || [];
    const sum = DATA.summary[name] || {{}};
    const cw = DATA.crosswalk[name] || {{ score: 50, jobZone: 3, matchedCount: 0 }};
    const titleStr = DATA.titles[name] || '—';
    const cur = series.length ? series[series.length - 1] : {{ index: 0, month: '—' }};
    const cls = cur.index >= 100 ? 'index-above' : 'index-below';
    panel.innerHTML = `
      <div class="row"><div class="label">Typical job titles</div><div class="value">${{titleStr}}</div></div>
      <div class="row"><div class="label">Current index (${{cur.month}})</div>
        <div class="value ${{cls}}">${{cur.index.toFixed(1)}} — ${{pctLabel(cur.index)}}</div></div>
      <div class="row"><div class="label">Peak</div><div class="value">${{sum.peak_index?.toFixed(1) || '—'}} (${{sum.peak_month || '—'}})</div></div>
      <div class="row"><div class="label">Drawdown from peak</div><div class="value">${{sum.drawdown != null ? sum.drawdown.toFixed(1) + ' pts' : '—'}}</div></div>
      <div class="row"><div class="label">Automation score (O*NET proxy)</div>
        <div class="value">${{cw.score}} / 100 (${{cw.matchedCount}} occupations matched)</div></div>
    `;
    const months = series.map(d => d.month);
    const values = series.map(d => d.index);
    Plotly.react('chart-sector', [{{
      x: months, y: values, type: 'scatter', mode: 'lines',
      line: {{ color: '#1A1714', width: 2 }},
      name: 'Sector index'
    }}], {{
      title: name + ' — monthly posting index',
      shapes: [{{ type: 'line', x0: months[0], x1: months[months.length-1], y0: 100, y1: 100,
        line: {{ dash: 'dash', color: '#999' }} }}],
      yaxis: {{ title: 'Index (Feb 2020 = 100)' }},
      margin: {{ t: 40, l: 50, r: 20, b: 40 }},
      paper_bgcolor: '#fff', plot_bgcolor: '#fff'
    }}, {{ displayModeBar: false }});
  }}

  select.addEventListener('change', () => renderSector(select.value));
  renderSector(select.value);
  </script>

  {how_we_measure_section()}
  {limitations_section()}
"""

    html = wrap_page(
        title="AI & Job Market — Explorer",
        h1="AI & the job market — explorer",
        lede=national_insight_lede(stats),
        body_html=body,
        narrative_order="insight_first",
    )

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "explore.html").write_text(html, encoding="utf-8")
    print(f"Wrote {OUT / 'explore.html'}")


if __name__ == "__main__":
    main()
