import type { StoryData } from "./types";

/** Client fallback when heroFacts is missing from older JSON. */
export function getHeroFacts(data: StoryData): string[] {
  const fromMeta = data.story_meta.heroFacts;
  if (fromMeta?.length) return fromMeta;

  const facts: string[] = [];
  const agg = data.aggregate;
  const meta = data.story_meta;

  if (agg.length) {
    const cur = agg[agg.length - 1];
    facts.push(`U.S. job posting index ~${cur.index.toFixed(0)} (100 = Feb 2020)`);
    const covid = agg.filter((r) => r.month.startsWith("2020-0"));
    if (covid.length) {
      const trough = covid.reduce((a, b) => (b.index < a.index ? b : a), covid[0]);
      facts.push(`COVID low ~${trough.index.toFixed(0)} vs Feb 2020 baseline`);
    }
  }

  if (meta.top10Highest[0]) {
    const t = meta.top10Highest[0];
    facts.push(`${t.sector} leads at index ~${t.currentIndex.toFixed(0)}`);
  }

  if (meta.quickFact?.headline) {
    facts.push(meta.quickFact.headline);
  }

  return facts.length ? facts : ["Explore sector-level job posting trends since 2020."];
}
