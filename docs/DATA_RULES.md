# Data rules (single source of truth)

All charts and exports for this project must follow these rules. Implemented in [`scripts/prepare_data.py`](../scripts/prepare_data.py).

## Presentation order (dashboards)

On HTML pages, lead with the **human insight** (e.g. “May 2022 was the highest month—about 60% more postings than Feb 1, 2020”). Put **index mechanics** (100 = baseline, formula, definitions table) under **How we measure**, below the chart. See [`scripts/viz_common.py`](../scripts/viz_common.py).

## 1. Index semantics

- **100 = posting volume on February 1, 2020** for that series (US aggregate or sector).
- Formula: `index = (postings on date / postings on 2020-02-01) × 100`.
- **Not** a health score, target, or raw job count. Compare **change over time** and across sectors.
- Copy for audiences: *100 is the Feb 2020 baseline; 150 means 50% more postings than that day; 72 means 28% fewer.*

## 2. Indeed filters

| Use case | Filter | Column |
|----------|--------|--------|
| National trend line | `variable == "total postings"` | `indeed_job_postings_index_SA` |
| Sector trends / heatmap | `variable == "total postings"` | `indeed_job_postings_index` |
| Do **not** use for main charts | `variable == "new postings"` | — |

## 3. Time aggregation

- Source data is **daily**.
- Plotting uses **monthly mean** per series: `YYYY-MM` = average of all daily index values in that month.
- Align months across aggregate, sectors, and AI overlays on this calendar month key.

## 4. AI model releases

- Source: `OpenAI_Anthropic_Models.xlsx` (sheet `OpenAI & Anthropic` or equivalent combined list).
- Include models with **publication date ≥ 2020-01-01**.
- Organization: `OpenAI` if `Organization` contains `"OpenAI"`; `Anthropic` if contains `"Anthropic"` (exclude other org-only rows unless both).
- Output fields: `model`, `org`, `domain`, `date` (ISO), `month` (`YYYY-MM`).
- Timeline overlays bucket by **`month`** of publication.

## 5. Automation risk (sector-level)

- Source occupations: `Degree_of_Automation(1).xlsx` — O*NET **Degree of Automation** in column `Context` (scale **1–70**).
- Sector job titles: `Indeed Postings/sector-job-title-examples.csv`, with Indeed → example sector renames:

| Indeed sector (time series) | Title lookup sector |
|----------------------------|---------------------|
| IT Infrastructure, Operations & Support | IT Operations & Helpdesk |
| IT Systems & Solutions | IT Operations & Helpdesk |
| Data & Analytics | Information Design & Documentation |

- Matching: for each comma-separated title token, match occupations whose title **contains** the token (case-insensitive). If no matches, try **first word** of each token (length ≥ 4).
- Sector score = **mean** of matched occupation `Context` values → `risk_score = round(mean / 70 × 100)`.
- **Fallback `risk_score = 50`** when `matchedCount == 0` (e.g. Banking & Finance, Loading & Stocking in reference viz).
- `job_zone` = mean of matched rows’ Job Zone (numeric parse of `1-2` → 1.5).
- Only sectors present in **Indeed sector CSV** (37) receive crosswalk entries.

## 6. Presentation

- Green/red vs 100 is **relative to Feb 2020 volume only**, not “good/bad” labor market.
- National average near 100 can hide sector peaks; call out sector-level exploration when summarizing.

## Processed outputs

After `python scripts/prepare_data.py`:

| File | Contents |
|------|----------|
| `data/processed/monthly_aggregate.json` | US monthly SA total postings index |
| `data/processed/monthly_by_sector.json` | 37 sectors × monthly index |
| `data/processed/ai_models.json` | Model releases 2020+ |
| `data/processed/automation_crosswalk.json` | Sector automation + job zone |
| `data/processed/sector_titles.json` | Indeed sector → example job titles string |
| `data/processed/metadata.json` | Run timestamp, row counts, validation summary |

Charts and notebooks must read **only** these files, not raw CSV/XLSX directly.
