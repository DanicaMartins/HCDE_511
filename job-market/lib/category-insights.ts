import type { StoryMeta } from "./types";

export type CategoryInsight = {
  text: string;
  tone?: "neutral" | "up" | "down";
};

function sectorsInCategory(meta: StoryMeta, category: string): string[] {
  return meta.categories[category] ?? [];
}

function peakInBoomWindow(meta: StoryMeta, category: string): CategoryInsight | null {
  const sectors = sectorsInCategory(meta, category);
  let best: { sector: string; peak: number } | null = null;

  for (const sector of sectors) {
    const st = meta.sectorStats[sector];
    if (!st) continue;
    if (st.peakMonth >= "2021-01" && st.peakMonth <= "2022-12") {
      if (!best || st.peakIndex > best.peak) {
        best = { sector, peak: st.peakIndex };
      }
    }
  }

  if (!best) return null;
  return {
    text: `${best.sector} peaked highest during the 2021–2022 hiring boom (index ~${Math.round(best.peak)}).`,
    tone: "up",
  };
}

function belowBaselineCallout(meta: StoryMeta, category: string): CategoryInsight | null {
  const sectors = sectorsInCategory(meta, category);
  const below = sectors
    .map((s) => meta.sectorStats[s])
    .filter((st) => st?.belowBaseline)
    .sort((a, b) => a.currentIndex - b.currentIndex);

  if (!below.length) return null;
  const st = below[0];
  const sector = sectors.find((s) => meta.sectorStats[s]?.currentIndex === st.currentIndex)!;
  return {
    text: `${sector} is currently below its Feb 2020 baseline (index ~${st.currentIndex.toFixed(0)}).`,
    tone: "down",
  };
}

function longestAboveBaseline(meta: StoryMeta, category: string, cells: Map<string, number>): CategoryInsight | null {
  const sectors = sectorsInCategory(meta, category);
  let best: { sector: string; months: number } | null = null;

  for (const sector of sectors) {
    let run = 0;
    let maxRun = 0;
    const months = meta.heatmap.months;
    for (const month of months) {
      const idx = cells.get(`${sector}|${month}`);
      if (idx !== undefined && idx >= 100) {
        run += 1;
        maxRun = Math.max(maxRun, run);
      } else {
        run = 0;
      }
    }
    if (!best || maxRun > best.months) {
      best = { sector, months: maxRun };
    }
  }

  if (!best || best.months < 6) return null;
  return {
    text: `${best.sector} remained above baseline longer than most ${category.toLowerCase()} sectors.`,
    tone: "neutral",
  };
}

function unevenCooling(meta: StoryMeta, category: string): CategoryInsight {
  const sectors = sectorsInCategory(meta, category);
  const post2022 = sectors.filter((s) => {
    const st = meta.sectorStats[s];
    return st && st.peakMonth >= "2021-01" && st.peakMonth <= "2022-12";
  });
  const stillAbove = post2022.filter((s) => !meta.sectorStats[s]?.belowBaseline).length;
  const cooled = post2022.length - stillAbove;

  if (post2022.length === 0) {
    return {
      text: `Sectors in this category moved at different speeds after the 2022 peak.`,
      tone: "neutral",
    };
  }

  return {
    text: `The category cooled after 2022, but not all sectors declined equally (${cooled} below baseline today, ${stillAbove} still above).`,
    tone: "neutral",
  };
}

const STATIC_FALLBACK: Record<string, CategoryInsight[]> = {
  "Knowledge Work": [
    { text: "Software Development peaked highest during the 2021–2022 hiring boom.", tone: "up" },
    { text: "Administrative Assistance is currently below its Feb 2020 baseline.", tone: "down" },
    { text: "IT Systems & Solutions remained above baseline longer than most knowledge-work sectors.", tone: "neutral" },
    { text: "The category cooled after 2022, but not all sectors declined equally.", tone: "neutral" },
  ],
  "Care & Service": [
    { text: "Physicians & Surgeons leads the category and remains well above its Feb 2020 baseline.", tone: "up" },
    { text: "Nursing hiring cooled sharply from its 2022 peak.", tone: "down" },
    { text: "Food Preparation & Service recovered faster after COVID than several peer sectors.", tone: "neutral" },
    { text: "Care & Service sectors diverged after 2022 — some still hiring above baseline, others not.", tone: "neutral" },
  ],
  "Tech & Engineering": [
    { text: "Installation & Maintenance is among the few sectors still above baseline today.", tone: "up" },
    { text: "Retail and Sales sit closer to Feb 2020 levels than engineering roles.", tone: "neutral" },
    { text: "Industrial Engineering shows high automation exposure alongside a deep posting drawdown.", tone: "down" },
    { text: "Production and logistics sectors did not all follow the same post-2022 path.", tone: "neutral" },
  ],
};

export function getCategoryInsights(
  category: string,
  meta: StoryMeta,
  cellMap: Map<string, number>
): CategoryInsight[] {
  const dynamic = [
    peakInBoomWindow(meta, category),
    belowBaselineCallout(meta, category),
    longestAboveBaseline(meta, category, cellMap),
    unevenCooling(meta, category),
  ].filter((x): x is CategoryInsight => x !== null);

  if (dynamic.length >= 3) return dynamic.slice(0, 4);
  return STATIC_FALLBACK[category] ?? STATIC_FALLBACK["Knowledge Work"];
}

export function automationExposureLabel(score: number): string {
  if (score >= 70) return "High automation exposure.";
  if (score >= 45) return "Moderate automation exposure.";
  return "Lower automation exposure.";
}

export function baselineStatus(index: number): "below" | "near" | "above" {
  if (index < 98) return "below";
  if (index <= 102) return "near";
  return "above";
}

export function baselineStatusLabel(index: number): string {
  const status = baselineStatus(index);
  if (status === "near") return "Near baseline";
  if (status === "above") return "Above baseline";
  return "Below baseline";
}

const AUTOMATION_MID = 50;
const JOB_BASELINE = 100;

export function quadrantLabel(index: number, automationScore: number): string {
  const highAuto = automationScore >= AUTOMATION_MID;
  const growing = index >= JOB_BASELINE;
  if (highAuto && !growing) return "Most exposed";
  if (highAuto && growing) return "Surprisingly resilient";
  if (!highAuto && !growing) return "Quietly struggling";
  return "Safe ground";
}
