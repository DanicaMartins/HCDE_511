"""Shared HTML/CSS fragments for Plotly dashboard pages."""

from __future__ import annotations

# Palette (ai-viz + AEI-inspired clarity)
BG = "#F7F5F0"
TEXT = "#1A1714"
BORDER = "#E8E4DC"
GREEN = "#4A7A5A"
RED = "#B85040"
OPENAI = "#5B8DBF"
ANTHROPIC = "#C8714A"

BASE_CSS = """
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #F7F5F0;
      color: #1A1714;
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
      font-size: 15px;
      line-height: 1.55;
      padding: 0 24px 48px;
      max-width: 1100px;
      margin: 0 auto;
    }
    header { padding: 40px 0 24px; border-bottom: 1px solid #E8E4DC; margin-bottom: 24px; }
    h1 {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 32px;
      font-weight: normal;
      margin-bottom: 12px;
    }
    h2 {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 22px;
      font-weight: normal;
      margin: 32px 0 12px;
    }
    .lede { color: #555; max-width: 720px; margin-bottom: 16px; }
    .methodology {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      font-size: 12px;
      color: #666;
      margin: 12px 0 20px;
      padding: 10px 14px;
      background: #fff;
      border: 1px solid #E8E4DC;
      border-radius: 8px;
    }
    .methodology .step {
      padding: 4px 10px;
      background: #F7F5F0;
      border-radius: 4px;
      white-space: nowrap;
    }
    .methodology .arrow { color: #999; }
    .definitions {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      margin: 12px 0 20px;
      background: #fff;
      border: 1px solid #E8E4DC;
      border-radius: 8px;
      overflow: hidden;
    }
    .definitions th, .definitions td {
      padding: 10px 12px;
      text-align: left;
      border-bottom: 1px solid #F0EDE8;
    }
    .definitions th {
      background: #F7F5F0;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #888;
    }
    .callout {
      background: #fff;
      border: 1px solid #E8E4DC;
      border-left: 4px solid #5B8DBF;
      border-radius: 8px;
      padding: 16px 18px;
      margin: 16px 0;
      max-width: 720px;
    }
    .callout.warn { border-left-color: #B85040; }
    .callout strong { display: block; margin-bottom: 6px; }
    .callout ul { margin: 8px 0 0 18px; color: #444; }
    .stat-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    @media (max-width: 800px) {
      .stat-cards { grid-template-columns: repeat(2, 1fr); }
    }
    .stat-card {
      background: #fff;
      border: 1px solid #E8E4DC;
      border-radius: 8px;
      padding: 14px 16px;
    }
    .stat-card .label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #999;
      margin-bottom: 6px;
    }
    .stat-card .value {
      font-family: Georgia, serif;
      font-size: 28px;
      font-weight: bold;
      font-variant-numeric: tabular-nums;
    }
    .stat-card .hint { font-size: 12px; color: #777; margin-top: 4px; }
    .chart-wrap {
      background: #fff;
      border: 1px solid #E8E4DC;
      border-radius: 10px;
      padding: 12px 8px 4px;
      margin-bottom: 24px;
    }
    .sector-picker {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;
    }
    .sector-picker select {
      flex: 1;
      min-width: 200px;
      padding: 10px 12px;
      font-size: 14px;
      border: 1px solid #E8E4DC;
      border-radius: 8px;
      background: #fff;
    }
    .detail-panel {
      background: #fff;
      border: 1px solid #E8E4DC;
      border-radius: 10px;
      padding: 18px 20px;
      margin-bottom: 24px;
    }
    .detail-panel .row { margin-bottom: 10px; }
    .detail-panel .label {
      font-size: 10px;
      text-transform: uppercase;
      color: #999;
      letter-spacing: 0.05em;
    }
    .detail-panel .value { font-size: 15px; }
    .index-above { color: #4A7A5A; font-weight: 600; }
    .index-below { color: #B85040; font-weight: 600; }
    footer {
      margin-top: 24px;
      font-size: 12px;
      color: #888;
      padding-top: 16px;
      border-top: 1px solid #E8E4DC;
    }
    footer a { color: #5B8DBF; }
    .nav-top { margin-bottom: 16px; font-size: 13px; }
    .nav-top a { color: #5B8DBF; margin-right: 12px; }
    .insight-lede { font-size: 16px; color: #333; max-width: 720px; line-height: 1.6; }
    .measure-section { margin-top: 32px; padding-top: 24px; border-top: 1px solid #E8E4DC; }
    .measure-section h2 { margin-top: 0; }
    details.measure-details summary {
      cursor: pointer;
      font-family: Georgia, serif;
      font-size: 18px;
      margin-bottom: 12px;
      color: #1A1714;
    }
    details.measure-details[open] summary { margin-bottom: 16px; }
"""

# Index gradient scale on guide rail (fixed range for consistent visual comparison)
INDEX_SCALE_MIN = 60
INDEX_SCALE_MAX = 160

GUIDE_CSS = """
    body.guide-page { max-width: 1280px; }
    .guide-layout {
      display: grid;
      grid-template-columns: minmax(280px, 340px) 1fr;
      gap: 32px;
      align-items: start;
      margin-bottom: 32px;
    }
    @media (max-width: 960px) {
      .guide-layout { grid-template-columns: 1fr; }
    }
    .guide-rail {
      background: #fff;
      border: 1px solid #E8E4DC;
      border-radius: 10px;
      padding: 24px 22px;
      position: sticky;
      top: 16px;
    }
    @media (max-width: 960px) {
      .guide-rail { position: static; }
    }
    .guide-rail h2 {
      font-size: 20px;
      margin: 0 0 20px;
      line-height: 1.3;
    }
    .guide-big-num {
      font-family: Georgia, serif;
      font-size: 72px;
      font-weight: normal;
      line-height: 1;
      font-variant-numeric: tabular-nums;
      color: #4A7A5A;
      margin-bottom: 4px;
    }
    .guide-big-label {
      font-size: 13px;
      color: #666;
      margin-bottom: 24px;
    }
    .index-scale-wrap { margin-bottom: 20px; }
    .index-scale-bar {
      position: relative;
      height: 14px;
      border-radius: 7px;
      background: linear-gradient(90deg, #E8A0A8 0%, #B8D4C8 50%, #4A7A5A 100%);
      margin: 8px 0 28px;
    }
    .index-scale-ticks {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #888;
      margin-top: 4px;
    }
    .index-scale-marker {
      position: absolute;
      top: -6px;
      transform: translateX(-50%);
      width: 2px;
      height: 26px;
      background: #1A1714;
    }
    .index-scale-marker.baseline { background: #888; height: 20px; top: -3px; }
    .index-scale-marker .dot {
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid #fff;
      box-shadow: 0 0 0 1px #1A1714;
    }
    .index-scale-marker.baseline .dot { background: #E8A0A8; }
    .index-scale-marker.current .dot { background: #4A7A5A; }
    .index-scale-legend {
      font-size: 12px;
      color: #555;
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .index-scale-legend span { display: inline-block; margin-right: 12px; }
    .guide-rules {
      list-style: none;
      counter-reset: guide-rule;
      margin: 0 0 20px;
      padding: 0;
    }
    .guide-rules li {
      counter-increment: guide-rule;
      margin-bottom: 12px;
      font-size: 14px;
      color: #444;
      padding-left: 28px;
      position: relative;
    }
    .guide-rules li::before {
      content: counter(guide-rule);
      position: absolute;
      left: 0;
      font-weight: 600;
      color: #1A1714;
    }
    .callout.info-purple {
      border-left-color: #8B7AB8;
      background: #F5F3FA;
      max-width: none;
    }
    .callout.info-purple .info-icon {
      display: inline-block;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #8B7AB8;
      color: #fff;
      text-align: center;
      font-size: 12px;
      line-height: 18px;
      margin-right: 6px;
      font-weight: bold;
    }
    .guide-main h2 { margin-top: 0; }
    .guide-section { margin-bottom: 28px; }
    .guide-section .section-caption {
      font-size: 14px;
      color: #555;
      max-width: 640px;
      margin-bottom: 12px;
    }
    .takeaway-list { list-style: none; padding: 0; margin: 0; }
    .takeaway-item {
      display: flex;
      gap: 14px;
      align-items: flex-start;
      padding: 14px 0;
      border-bottom: 1px solid #F0EDE8;
    }
    .takeaway-item:last-child { border-bottom: none; }
    .takeaway-icon {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #F7F5F0;
      border: 1px solid #E8E4DC;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }
    .takeaway-text { font-size: 15px; color: #333; }
    .takeaway-text a { color: #5B8DBF; }
    .guide-cta {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin: 24px 0 8px;
    }
    .guide-cta a {
      display: inline-block;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      text-decoration: none;
      font-weight: 500;
    }
    .guide-cta .btn-primary {
      background: #1A1714;
      color: #F7F5F0;
    }
    .guide-cta .btn-secondary {
      background: #fff;
      color: #1A1714;
      border: 1px solid #E8E4DC;
    }
    .nav-top a.nav-active { font-weight: 600; color: #1A1714; }
"""

STORY_CSS = """
    body.story-page { max-width: 1180px; }
    .story-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 0 12px;
      border-bottom: 1px solid #E8E4DC;
      margin-bottom: 0;
    }
    .story-nav .brand {
      font-family: Georgia, serif;
      font-size: 15px;
      color: #1A1714;
      text-decoration: none;
    }
    .story-nav-links { display: flex; gap: 20px; font-size: 14px; }
    .story-nav-links a {
      color: #666;
      text-decoration: none;
    }
    .story-nav-links a.active, .story-nav-links a:hover { color: #1A1714; }
    .story-nav-links a.active { font-weight: 600; border-bottom: 2px solid #1A1714; padding-bottom: 2px; }
    .hero-wrap { position: relative; padding: 48px 0 40px; }
    .quick-fact {
      position: absolute;
      top: 8px;
      right: 0;
      max-width: 280px;
      background: #fff;
      border: 1px solid #E8E4DC;
      border-radius: 12px;
      padding: 14px 16px;
      box-shadow: 0 4px 20px rgba(26, 23, 20, 0.06);
      font-size: 13px;
      color: #444;
    }
    .quick-fact a { color: #5B8DBF; font-size: 12px; text-decoration: none; }
    .quick-fact .qf-foot { font-size: 11px; color: #888; margin-top: 6px; }
    .hero-title {
      font-family: Georgia, serif;
      font-size: 48px;
      font-weight: normal;
      line-height: 1.15;
      margin-bottom: 16px;
      max-width: 720px;
    }
    .hero-subtitle {
      font-size: 17px;
      color: #555;
      max-width: 640px;
      line-height: 1.55;
    }
    @media (max-width: 800px) {
      .quick-fact { position: static; max-width: none; margin-bottom: 20px; }
      .hero-title { font-size: 36px; }
    }
    .story-section {
      padding: 48px 0;
      border-top: 1px solid #E8E4DC;
    }
    .story-section h2 {
      font-family: Georgia, serif;
      font-size: 28px;
      font-weight: normal;
      margin-bottom: 8px;
    }
    .story-section .section-label {
      font-size: 13px;
      color: #888;
      margin-bottom: 24px;
    }
    .national-grid {
      display: grid;
      grid-template-columns: minmax(260px, 300px) 1fr;
      gap: 28px;
      align-items: start;
    }
    @media (max-width: 960px) {
      .national-grid { grid-template-columns: 1fr; }
    }
    .explainer-card {
      background: #fff;
      border: 1px solid #E8E4DC;
      border-radius: 12px;
      padding: 22px 20px;
      box-shadow: 0 2px 12px rgba(26, 23, 20, 0.04);
      position: sticky;
      top: 16px;
    }
    @media (max-width: 960px) { .explainer-card { position: static; } }
    .explainer-card h3 {
      font-family: Georgia, serif;
      font-size: 18px;
      margin-bottom: 16px;
      font-weight: normal;
    }
    .diverging-scale {
      height: 12px;
      border-radius: 6px;
      background: linear-gradient(90deg, #E8A0A8 0%, #E8E4DC 45%, #4A7A5A 100%);
      margin: 10px 0 6px;
    }
    .scale-ticks {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #888;
    }
    .explainer-lines { font-size: 13px; color: #555; line-height: 1.6; margin-top: 14px; }
    .explainer-lines p { margin-bottom: 8px; }
    .chart-caption {
      font-size: 13px;
      color: #666;
      margin-top: 10px;
      font-style: italic;
    }
    .ai-legend {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #666;
      margin-top: 8px;
    }
    .ai-legend span::before {
      content: '';
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 2px;
      margin-right: 6px;
      vertical-align: middle;
    }
    .ai-legend .oai::before { background: #5B8DBF; }
    .ai-legend .anth::before { background: #C8714A; }
    .sector-breakdown { margin-top: 32px; }
    .sector-breakdown-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 16px;
    }
    .sector-breakdown-header h3 {
      font-family: Georgia, serif;
      font-size: 20px;
      font-weight: normal;
    }
    .sector-breakdown-header .hint-top { font-size: 13px; color: #888; }
    .top10-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 32px;
    }
    @media (max-width: 640px) { .top10-grid { grid-template-columns: 1fr; } }
    .sector-rank-row {
      display: grid;
      grid-template-columns: 28px 1fr 80px 48px;
      gap: 10px;
      align-items: center;
      padding: 10px 12px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.15s;
    }
    .sector-rank-row:hover, .sector-rank-row.hover { background: #F0EDE8; }
    .sector-rank-row.selected { background: #1A1714; color: #F7F5F0; }
    .sector-rank-row.selected .mini-bar-fill { opacity: 0.9; }
    .sector-rank-row .rank { color: #999; font-size: 12px; }
    .sector-rank-row.selected .rank { color: #ccc; }
    .mini-bar {
      height: 6px;
      background: #F0EDE8;
      border-radius: 3px;
      overflow: hidden;
    }
    .mini-bar-fill {
      height: 100%;
      border-radius: 3px;
      background: linear-gradient(90deg, #E8A0A8, #4A7A5A);
    }
    .sector-rank-row .idx-val {
      font-variant-numeric: tabular-nums;
      text-align: right;
      font-weight: 600;
    }
    .interaction-cues {
      margin-top: 14px;
      font-size: 13px;
      color: #888;
    }
    .interaction-cues .scroll-cue { margin-left: 12px; }
    .sector-detail-layout {
      display: grid;
      grid-template-columns: 220px 1fr;
      gap: 24px;
      align-items: start;
    }
    @media (max-width: 900px) {
      .sector-detail-layout { grid-template-columns: 1fr; }
    }
    .sector-sidebar {
      background: #fff;
      border: 1px solid #E8E4DC;
      border-radius: 12px;
      padding: 16px;
    }
    .sector-sidebar select {
      width: 100%;
      padding: 8px 10px;
      margin-bottom: 12px;
      border: 1px solid #E8E4DC;
      border-radius: 8px;
      font-size: 13px;
    }
    .sector-nav-list { list-style: none; max-height: 320px; overflow-y: auto; }
    .sector-nav-item {
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 13px;
      cursor: pointer;
      margin-bottom: 4px;
    }
    .sector-nav-item:hover { background: #F7F5F0; }
    .sector-nav-item.selected {
      background: #1A1714;
      color: #fff;
    }
    .sector-search {
      width: 100%;
      margin-top: 12px;
      padding: 10px 12px;
      border: 1px solid #E8E4DC;
      border-radius: 8px;
      font-size: 14px;
    }
    .detail-grid {
      display: grid;
      grid-template-columns: minmax(200px, 240px) 1fr;
      gap: 20px;
    }
    @media (max-width: 800px) {
      .detail-grid { grid-template-columns: 1fr; }
    }
    .metric-stack { display: flex; flex-direction: column; gap: 12px; }
    .metric-card {
      background: #fff;
      border: 1px solid #E8E4DC;
      border-radius: 10px;
      padding: 14px 16px;
    }
    .metric-card .mc-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #999;
      margin-bottom: 4px;
    }
    .metric-card .mc-value { font-size: 15px; color: #333; }
    .drawdown-card {
      background: #F5EBE8;
      border: 1px solid #E8D4D0;
      border-radius: 12px;
      padding: 20px 18px;
      margin-top: 4px;
    }
    .drawdown-card .dc-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #888;
    }
    .drawdown-card .dc-value {
      font-family: Georgia, serif;
      font-size: 42px;
      color: #B85040;
      line-height: 1.1;
      margin: 6px 0;
    }
    .drawdown-card .dc-sub { font-size: 13px; color: #666; }
    .chart-legend-box {
      font-size: 12px;
      color: #666;
      margin-top: 8px;
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    .chart-legend-box .leg-solid::before,
    .chart-legend-box .leg-dotted::before {
      content: '';
      display: inline-block;
      width: 20px;
      height: 3px;
      margin-right: 6px;
      vertical-align: middle;
    }
    .chart-legend-box .leg-solid::before { background: #4A7A5A; }
    .chart-legend-box .leg-dotted::before {
      background: repeating-linear-gradient(90deg, #9B8BB8 0 4px, transparent 4px 8px);
      height: 0;
      border-top: 2px dashed #9B8BB8;
    }
    .compare-block {
      margin-top: 28px;
      padding-top: 20px;
      border-top: 1px solid #F0EDE8;
    }
    .compare-block h4 {
      font-family: Georgia, serif;
      font-size: 18px;
      font-weight: normal;
      margin-bottom: 8px;
    }
    .compare-helper { font-size: 13px; color: #666; margin-bottom: 14px; max-width: 640px; line-height: 1.5; }
    .compare-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
    .compare-chip {
      padding: 8px 14px;
      border: 1px solid #E8E4DC;
      border-radius: 20px;
      font-size: 13px;
      background: #fff;
      cursor: pointer;
    }
    .compare-chip:hover, .compare-chip.active {
      border-color: #9B8BB8;
      background: #F5F3FA;
    }
    .compare-search {
      width: 100%;
      max-width: 400px;
      padding: 12px 14px;
      border: 1px solid #E8E4DC;
      border-radius: 10px;
      font-size: 14px;
    }
    .compare-results {
      list-style: none;
      margin-top: 8px;
      max-height: 160px;
      overflow-y: auto;
    }
    .compare-results li {
      padding: 8px 12px;
      cursor: pointer;
      border-radius: 6px;
      font-size: 14px;
    }
    .compare-results li:hover { background: #F7F5F0; }
    .section-stub {
      padding: 40px 0;
      border-top: 1px solid #E8E4DC;
      color: #666;
    }
    .section-stub h2 { font-family: Georgia, serif; font-size: 24px; color: #1A1714; }
    #heatmap-selected { font-weight: 600; color: #1A1714; }
    .measure-section { margin-top: 48px; }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      border: 0;
    }
"""


def story_nav() -> str:
    return """
    <nav class="story-nav" aria-label="Site">
      <a class="brand" href="#hero">AI and the Job Market</a>
      <div class="story-nav-links">
        <a href="#models">Models</a>
        <a href="#national" class="active">Job Market</a>
        <a href="#media">Media Narrative</a>
        <a href="#methodology">Methodology</a>
      </div>
    </nav>
    """


def story_hero(quick_fact: dict) -> str:
    qf = quick_fact
    return f"""
    <section class="hero-wrap" id="hero">
      <aside class="quick-fact" aria-label="Quick fact">
        <div>{qf.get('headline', '')}</div>
        <div class="qf-foot">{qf.get('footnote', '')}</div>
        <a href="{qf.get('linkAnchor', '#sector-detail')}">{qf.get('linkText', 'Quick Facts →')}</a>
      </aside>
      <h1 class="hero-title">AI and the Job Market</h1>
      <p class="hero-subtitle">How did your sector change? A visual story of U.S. job posting demand from 2020 to 2026.</p>
    </section>
    """


def story_index_explainer() -> str:
    return """
    <aside class="explainer-card" aria-labelledby="explainer-title">
      <h3 id="explainer-title">How to read the Index</h3>
      <div class="diverging-scale" role="img" aria-label="Index scale below 100 pink, above 100 green"></div>
      <div class="scale-ticks"><span>60</span><span>80</span><span>100</span><span>120</span><span>160</span></div>
      <div class="explainer-lines">
        <p><strong>100</strong> = same posting volume as Feb 2020</p>
        <p><strong>160</strong> = 60% more postings than Feb 2020</p>
        <p><strong>72</strong> = 28% fewer postings than Feb 2020</p>
        <p>The index shows change over time, not raw job counts.</p>
        <p>We use an index so different sectors can be compared on the same scale.</p>
      </div>
    </aside>
    """


def wrap_story_page(
    title: str,
    body_html: str,
    story_script: str,
    footer_extra: str = "",
) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title}</title>
  <style>{BASE_CSS}{STORY_CSS}</style>
</head>
<body class="story-page">
  {story_nav()}
  {body_html}
  <section class="measure-section" id="methodology">
    {how_we_measure_section()}
    {limitations_section()}
  </section>
  <footer>
    Data: Indeed Hiring Lab · O*NET · Epoch AI · Feb 2020 baseline.
    {footer_extra}
    <a href="explore.html">Legacy explorer</a> ·
    <a href="https://www.anthropic.com/economic-index">Anthropic Economic Index</a>
  </footer>
  <script>{story_script}</script>
</body>
</html>
"""


def _scale_position(value: float) -> float:
    """Map index value to 0–100% along guide gradient bar."""
    span = INDEX_SCALE_MAX - INDEX_SCALE_MIN
    pct = (value - INDEX_SCALE_MIN) / span * 100
    return max(0.0, min(100.0, pct))


def nav_top_links(active: str = "") -> str:
    links = [
        ("guide", "Guide", "guide.html"),
        ("explore", "Explorer", "explore.html"),
        ("timeline", "National timeline", "job_index_timeline.html"),
        ("drawdown", "Sector drawdown", "sector_drawdown.html"),
        ("overview", "Overview", "overview.html"),
    ]
    parts = []
    for key, label, href in links:
        cls = ' class="nav-active"' if active == key else ""
        parts.append(f'<a href="{href}"{cls}>{label}</a>')
    return "\n    ".join(parts)


def index_guide_rail(stats: dict) -> str:
    s = enrich_national_stats(stats)
    baseline_pct = _scale_position(100)
    current_pct = _scale_position(s["current_index"])
    current_round = round(s["current_index"])
    delta = current_round - 100
    if abs(delta) < 1:
        current_hint = "about the same as Feb 1, 2020"
    elif delta > 0:
        current_hint = f"{delta}% more than Feb 1, 2020"
    else:
        current_hint = f"{abs(delta)}% fewer than Feb 1, 2020"

    return f"""
    <aside class="guide-rail" aria-labelledby="guide-rail-title">
      <h2 id="guide-rail-title">How to read the Job Postings Index</h2>
      <div class="guide-big-num">{current_round}</div>
      <div class="guide-big-label">U.S. total, {s['current_month_display']}</div>
      <div class="index-scale-wrap">
        <div class="index-scale-bar" role="img" aria-label="Index scale from {INDEX_SCALE_MIN} to {INDEX_SCALE_MAX}">
          <span class="index-scale-marker baseline" style="left: {baseline_pct:.1f}%"
            title="Baseline 100"><span class="dot"></span></span>
          <span class="index-scale-marker current" style="left: {current_pct:.1f}%"
            title="Current {current_round}"><span class="dot"></span></span>
        </div>
        <div class="index-scale-ticks">
          <span>{INDEX_SCALE_MIN}</span><span>80</span><span>100</span><span>120</span><span>{INDEX_SCALE_MAX}</span>
        </div>
        <div class="index-scale-legend">
          <span><strong style="color:#B85040">●</strong> 100 = Feb 1, 2020 baseline</span>
          <span><strong style="color:#4A7A5A">●</strong> {current_round} = {current_hint}</span>
        </div>
      </div>
      <ol class="guide-rules">
        <li>The index shows <strong>change over time</strong>, not raw job counts.</li>
        <li><strong>100</strong> means posting volume on <strong>February 1, 2020</strong> for that series.</li>
        <li>Compare months and sectors on the same scale&mdash;not whether a number is &ldquo;good.&rdquo;</li>
        <li>Each sector&rsquo;s <strong>peak</strong> is its own highest month; drawdown is distance from that peak.</li>
        <li>AI model releases on the explorer are <strong>context</strong>, not proof of cause.</li>
      </ol>
      <div class="callout info-purple">
        <p><span class="info-icon" aria-hidden="true">i</span>
        <strong>What this is not</strong></p>
        <p style="margin-top:8px;font-size:13px;color:#555;">
          Not employment levels, wages, unemployment, or how many people hold jobs.
          Indeed publishes indexed change from Feb 2020, not raw posting counts here.
        </p>
      </div>
    </aside>
    """


def key_takeaways_block(
    stats: dict,
    compare_sector: str = "Software Development",
    compare_peak: float | None = None,
    compare_current: float | None = None,
) -> str:
    s = enrich_national_stats(stats)
    sw_line = ""
    if compare_peak is not None and compare_current is not None:
        sw_line = (
            f"<a href=\"explore.html?sector={compare_sector.replace(' ', '+')}\">"
            f"{compare_sector}</a> peaked near <strong>{compare_peak:.0f}</strong> "
            f"and is now <strong>{compare_current:.0f}</strong>&mdash;far below its own high "
            f"while the U.S. total is near 100."
        )
    else:
        sw_line = (
            f"Some sectors (e.g. <a href=\"explore.html?sector=Software+Development\">"
            f"Software Development</a>) boomed, then cooled sharply from their own peaks."
        )

    return f"""
    <section class="guide-section" id="key-takeaways" aria-labelledby="takeaways-title">
      <h2 id="takeaways-title">Key takeaways</h2>
      <ul class="takeaway-list">
        <li class="takeaway-item">
          <span class="takeaway-icon" aria-hidden="true">↗</span>
          <span class="takeaway-text">The <strong>national</strong> market is close to its Feb 2020 baseline
          (index <strong>{s['current_index']:.0f}</strong> in {s['current_month_display']})&mdash;but still
          ~<strong>{s['pct_below_peak']}%</strong> below the {s['peak_month_display']} peak.</span>
        </li>
        <li class="takeaway-item">
          <span class="takeaway-icon" aria-hidden="true">〰</span>
          <span class="takeaway-text">{sw_line}</span>
        </li>
        <li class="takeaway-item">
          <span class="takeaway-icon" aria-hidden="true">◎</span>
          <span class="takeaway-text">AI model releases provide <strong>timeline context</strong> on the
          explorer&mdash;not proof that AI caused posting changes.</span>
        </li>
      </ul>
    </section>
    """


def guide_cta_block() -> str:
    return """
    <div class="guide-cta">
      <a class="btn-primary" href="explore.html">Explore all sectors</a>
      <a class="btn-secondary" href="explore.html?sector=Software+Development">Software Development detail</a>
      <a class="btn-secondary" href="job_index_timeline.html">Full timeline + AI releases</a>
    </div>
    """


def wrap_guide_page(
    title: str,
    page_h1: str,
    rail_html: str,
    main_html: str,
    footer_extra: str = "",
) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title}</title>
  <style>{BASE_CSS}{GUIDE_CSS}</style>
</head>
<body class="guide-page">
  <div class="nav-top">
    {nav_top_links(active="guide")}
  </div>
  <header>
    <h1>{page_h1}</h1>
    <p class="lede">A short guide to the Indeed job postings index and what the national average can hide.</p>
  </header>
  <div class="guide-layout">
    {rail_html}
    <div class="guide-main">
      {main_html}
      {guide_cta_block()}
    </div>
  </div>
  {how_we_measure_section()}
  {limitations_section()}
  <footer>
    Data: Indeed Hiring Lab · O*NET · Epoch AI · Feb 2020 baseline.
    {footer_extra}
    Design patterns informed by
    <a href="https://www.anthropic.com/economic-index">Anthropic Economic Index</a>
    and <a href="https://manasvikale99.github.io/ai-viz/">AI &amp; The Job Market</a>.
    Methodology notes in repo <code>docs/AEI_DESIGN_NOTES.md</code>.
  </footer>
</body>
</html>
"""


MONTH_NAMES = (
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
)


def format_month(ym: str) -> str:
    """YYYY-MM -> 'May 2022'."""
    year, month = ym.split("-")
    return f"{MONTH_NAMES[int(month) - 1]} {year}"


def enrich_national_stats(stats: dict) -> dict:
    """Add display fields for insight-first copy."""
    s = dict(stats)
    s["peak_month_display"] = format_month(s["peak_month"])
    s["current_month_display"] = format_month(s["current_month"])
    s["trough_month_display"] = format_month(s["trough_month"])
    s["pct_above_baseline"] = round(s["peak_index"] - 100)
    s["pct_below_peak"] = round(100 * (1 - s["current_index"] / s["peak_index"]))
    return s


def national_insight_lede(stats: dict) -> str:
    s = enrich_national_stats(stats)
    return (
        f"<p class=\"insight-lede\"><strong>{s['peak_month_display']}</strong> was the highest month for "
        f"US job postings in this series: about <strong>{s['pct_above_baseline']}% more</strong> Indeed job "
        f"ads than on <strong>Feb 1, 2020</strong> (index <strong>{s['peak_index']:.0f}</strong>). "
        f"By <strong>{s['current_month_display']}</strong>, the national total is only slightly above "
        f"Feb 2020 (<strong>~{s['current_index']:.0f}</strong>)&mdash;but still about "
        f"<strong>{s['pct_below_peak']}% below</strong> that {s['peak_month_display']} peak. "
        f"Many sectors never recovered their own highs (see "
        f"<a href=\"sector_drawdown.html\">sector drawdown</a>).</p>"
    )


def stat_cards_insight_first(stats: dict) -> str:
    s = enrich_national_stats(stats)
    return f"""
    <div class="stat-cards">
      <div class="stat-card">
        <div class="label">US hiring peak</div>
        <div class="value">{s['peak_month_display']}</div>
        <div class="hint">~{s['pct_above_baseline']}% more than Feb 1, 2020 · index {s['peak_index']:.1f}</div>
      </div>
      <div class="stat-card">
        <div class="label">Latest ({s['current_month_display']})</div>
        <div class="value">{s['current_index']:.1f}</div>
        <div class="hint">{s['current_label']} · ~{s['pct_below_peak']}% below {s['peak_month_display']} peak</div>
      </div>
      <div class="stat-card">
        <div class="label">COVID low ({s['trough_month_display']})</div>
        <div class="value">{s['trough_index']:.1f}</div>
        <div class="hint">{s['trough_label']} · index {s['trough_index']:.0f}</div>
      </div>
      <div class="stat-card">
        <div class="label">AI models tracked (2020+)</div>
        <div class="value">{s['ai_model_count']}</div>
        <div class="hint">OpenAI &amp; Anthropic releases on timeline</div>
      </div>
    </div>
    """


def how_we_measure_section() -> str:
    return f"""
    <section class="measure-section" aria-labelledby="how-we-measure">
      <details class="measure-details">
        <summary id="how-we-measure">How we measure (index &amp; data)</summary>
        {methodology_strip()}
        {index_reading_callout()}
        {definitions_table()}
      </details>
    </section>
    """


def limitations_section() -> str:
    return f"""
    <section class="measure-section" aria-labelledby="limitations">
      <h2 id="limitations">Limitations</h2>
      {caveats_block()}
    </section>
    """


def methodology_strip() -> str:
    return """
    <div class="methodology" aria-label="Data pipeline">
      <span class="step">Indeed daily CSV</span>
      <span class="arrow">→</span>
      <span class="step">Monthly mean (total postings, SA)</span>
      <span class="arrow">→</span>
      <span class="step">37 sectors</span>
      <span class="arrow">→</span>
      <span class="step">O*NET title match</span>
      <span class="arrow">→</span>
      <span class="step">Automation score</span>
      <span class="arrow">·</span>
      <span class="step">Rules in repo docs/DATA_RULES.md</span>
    </div>
    """


def definitions_table() -> str:
    return """
    <table class="definitions">
      <thead>
        <tr><th>Metric</th><th>Meaning</th><th>Not</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Posting index</strong></td>
          <td>% of Feb 1, 2020 posting volume for that series (100 = same day).</td>
          <td>Raw job count, employment level, or wages.</td>
        </tr>
        <tr>
          <td><strong>Drawdown</strong></td>
          <td>Current index minus sector peak index (negative = below peak).</td>
          <td>Permanent job loss count.</td>
        </tr>
        <tr>
          <td><strong>Automation score</strong></td>
          <td>O*NET &ldquo;degree of automation&rdquo; matched via sector job titles, scaled 0–100.</td>
          <td>Claude automation vs augmentation (Anthropic metric).</td>
        </tr>
        <tr>
          <td><strong>AI releases</strong></td>
          <td>OpenAI/Anthropic model publication months (Epoch-style registry).</td>
          <td>Proof that releases caused posting changes.</td>
        </tr>
      </tbody>
    </table>
    """


def caveats_block() -> str:
    return """
    <div class="callout warn">
      <strong>What this does not show</strong>
      <ul>
        <li>Indeed does not publish raw posting counts in our dataset—only indexed change from Feb 2020.</li>
        <li>100 is a reference day, not a &ldquo;healthy&rdquo; labor market target.</li>
        <li>Automation scores use keyword matching; some sectors fall back to a default when no occupation matches.</li>
        <li>Correlation between AI releases and posting trends is not causation.</li>
        <li>National totals near 100 in 2026 can hide sectors still far below their 2021–2022 peaks—see drawdown chart.</li>
      </ul>
    </div>
    """


def index_reading_callout() -> str:
    return """
    <div class="callout">
      <strong>How to read the index</strong>
      <ul>
        <li><strong>100</strong> = posting volume on <strong>February 1, 2020</strong>.</li>
        <li><strong>150</strong> = 50% more postings than that day; <strong>72</strong> = 28% fewer.</li>
        <li>Compare <em>change over time</em> and across sectors—not whether a value is &ldquo;good.&rdquo;</li>
      </ul>
    </div>
    """


def wrap_chart_page(title: str, h1: str, lede: str, chart_div: str) -> str:
    """Wrap a single Plotly div with methodology below chart."""
    body = f"""
  <p class="lede">{lede}</p>
  <div class="chart-wrap">{chart_div}</div>
  {how_we_measure_section()}
  {limitations_section()}
"""
    return wrap_page(title=title, h1=h1, lede="", body_html=body, narrative_order="insight_first")


def wrap_page(
    title: str,
    h1: str,
    lede: str,
    body_html: str,
    footer_extra: str = "",
    include_definitions: bool = True,
    include_index_callout: bool = False,
    narrative_order: str = "classic",
) -> str:
    if narrative_order == "insight_first":
        header_block = f"""
  <header>
    <h1>{h1}</h1>
    {lede}
  </header>
"""
    else:
        header_block = f"""
  <header>
    <h1>{h1}</h1>
    <p class="lede">{lede}</p>
    {methodology_strip()}
    {index_reading_callout() if include_index_callout else ""}
    {definitions_table() if include_definitions else ""}
    {caveats_block()}
  </header>
"""
    parts = [
        f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title}</title>
  <style>{BASE_CSS}</style>
</head>
<body>
  <div class="nav-top">
    {nav_top_links(active="")}
  </div>
{header_block}
""",
        body_html,
        f"""
  <footer>
    Data: Indeed Hiring Lab · O*NET · Epoch AI · Feb 2020 baseline.
    {footer_extra}
    Design patterns informed by
    <a href="https://www.anthropic.com/economic-index">Anthropic Economic Index</a>
    and <a href="https://manasvikale99.github.io/ai-viz/">AI &amp; The Job Market</a>.
    Methodology notes in repo <code>docs/AEI_DESIGN_NOTES.md</code>.
  </footer>
</body>
</html>
""",
    ]
    return "".join(parts)


def wrap_insight_timeline_page(
    title: str,
    h1: str,
    stats: dict,
    chart_div: str,
    footer_extra: str = "",
    extra_body: str = "",
) -> str:
    """Insight lede + stat cards + chart + how we measure + limitations."""
    s = enrich_national_stats(stats)
    body = f"""
  {stat_cards_insight_first(s)}
  <div class="chart-wrap">{chart_div}</div>
  {how_we_measure_section()}
  {limitations_section()}
  {extra_body}
"""
    return wrap_page(
        title=title,
        h1=h1,
        lede=national_insight_lede(s),
        body_html=body,
        footer_extra=footer_extra,
        narrative_order="insight_first",
    )
