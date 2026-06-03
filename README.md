# HCDE 511 — AI & Job Market (local data pipeline)

Raw datasets and a reproducible ETL → validation → Plotly visualization pipeline.

## Data sources

- **Indeed Hiring Lab** — `Indeed Postings/*.csv`
- **Epoch AI** — `OpenAI_Anthropic_Models.xlsx`
- **O\*NET** — `Degree_of_Automation(1).xlsx`

Index meaning and transforms: [`docs/DATA_RULES.md`](docs/DATA_RULES.md)

## Quick start

```bash
pip install -r requirements.txt
python scripts/prepare_data.py
pytest tests/test_validation.py -q
# Requires Node.js 20+ for the Job Market story:
python scripts/build_guide.py
# Or full pipeline including legacy Plotly pages:
python scripts/plot_overview.py
```

Outputs:

- `data/processed/` — JSON for charts (do not edit by hand)
- `output/guide.html` — **start here** (Next.js Job Market story; requires `output/_next/` assets; `?sector=` URL support)
- `output/explore.html` — **legacy explorer** (timeline + drawdown + sector picker)
- `output/job_index_timeline.html` — national index with context
- `output/sector_drawdown.html` — peak vs current by sector
- `output/overview.html` — two-panel summary

Design notes (Anthropic Economic Index patterns): [`docs/AEI_DESIGN_NOTES.md`](docs/AEI_DESIGN_NOTES.md)

Serve locally: `cd output && python3 -m http.server 8765` → http://127.0.0.1:8765/guide.html

Visualization stack notes: [`docs/VIZ_STACK.md`](docs/VIZ_STACK.md)

Published interactive story (D3): [manasvikale99.github.io/ai-viz](https://manasvikale99.github.io/ai-viz/)
