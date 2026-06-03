# Visualization stack (Stage 2 decision)

## Chosen approach

| Stage | Tool | Location |
|-------|------|----------|
| **1 — ETL & validation** | Python, pandas, openpyxl | [`scripts/prepare_data.py`](../scripts/prepare_data.py), [`tests/test_validation.py`](../tests/test_validation.py) |
| **2 — Interactive charts** | **Plotly** (Python) | [`scripts/plot_overview.py`](../scripts/plot_overview.py) → `output/*.html` |

**Not used locally:** D3 (reserved for the published [ai-viz](https://manasvikale99.github.io/ai-viz/) site), Matplotlib, Observable, Tableau.

## Why Plotly for local work

- Same processed JSON as any future D3 rebuild—no second ETL path.
- Fast iteration for HCDE analysis and static HTML exports.
- No npm/build step required for course deliverables.

## Why not clone D3 ai-viz here

The GitHub Pages site is a single embedded `index.html` with Node-generated constants. Cloning it duplicates maintenance unless you are shipping that exact UI. Local Plotly covers **accuracy checks** and **exploratory views**; link to ai-viz for the polished scrollytelling experience.

## Workflow

```bash
cd /Users/1902007/HCDE_511
pip install -r requirements.txt
python scripts/prepare_data.py
pytest tests/test_validation.py -q
python scripts/plot_overview.py
open output/explore.html
```

Shared page chrome (methodology strip, definitions table, caveats): [`scripts/viz_common.py`](../scripts/viz_common.py)

**Job Market story:** [`job-market/`](../job-market/) is a Next.js 14 app (Tailwind, react-plotly.js) statically exported to [`output/guide.html`](../output/guide.html) via [`scripts/build_guide.py`](../scripts/build_guide.py). Client state lives in [`job-market/lib/story-context.tsx`](../job-market/lib/story-context.tsx). JSON is synced from `data/processed/` before each build.

## Rules for new charts

1. Read only `data/processed/*.json`.
2. Follow [`docs/DATA_RULES.md`](DATA_RULES.md).
3. Re-run ETL after any raw CSV/XLSX change.
