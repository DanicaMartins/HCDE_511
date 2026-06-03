import { STORY_DATA } from "./data";

/** Dev-time sanity checks mirroring scripts/prepare_data.py run_validation */
export function validateStoryData(): { ok: boolean; warnings: string[] } {
  const warnings: string[] = [];
  const { aggregate, sectors, crosswalk, story_meta } = STORY_DATA;

  const feb = aggregate.find((r) => r.month === "2020-02");
  if (!feb) warnings.push("Missing 2020-02 in aggregate");
  else if (Math.abs(feb.index - 100) > 2) {
    warnings.push(`Feb 2020 aggregate ${feb.index} (expected ~100)`);
  }

  if (Object.keys(sectors).length !== 37) {
    warnings.push(`Expected 37 sectors, got ${Object.keys(sectors).length}`);
  }

  const covid = aggregate.filter((r) => r.month.startsWith("2020-0"));
  if (covid.length) {
    const trough = covid.reduce((a, b) => (b.index < a.index ? b : a), covid[0]);
    if (trough.index > 75) {
      warnings.push(`COVID trough ${trough.month} index ${trough.index} (expected ~67)`);
    }
  }

  const acct = crosswalk.Accounting;
  if (acct && acct.score !== 73) {
    warnings.push(`Accounting automation ${acct.score} (reference: 73)`);
  }

  const cellKeys = new Set(
    story_meta.heatmap.cells.map((c) => `${c.sector}|${c.month}`)
  );
  for (const group of story_meta.heatmap.sectorsGrouped) {
    for (const sector of group.sectors) {
      for (const month of story_meta.heatmap.months) {
        const key = `${sector}|${month}`;
        const hasMonth = sectors[sector]?.some((r) => r.month === month);
        if (hasMonth && !cellKeys.has(key)) {
          warnings.push(`Heatmap missing cell for ${key} though series has data`);
        }
      }
    }
  }

  return { ok: warnings.length === 0, warnings };
}
