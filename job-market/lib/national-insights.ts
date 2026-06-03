import { aiReleasesByMonth, nationalStats } from "./chart-data";
import type { StoryData } from "./types";

const AI_ACCELERATION_START = "2024-01";

function monthLabel(ym: string): string {
  const [y, m] = ym.split("-");
  const names = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${names[parseInt(m, 10) - 1]} ${y}`;
}

export function getNationalInsights(data: StoryData) {
  const meta = data.story_meta;
  if (meta.nationalInsights) return meta.nationalInsights;

  const agg = data.aggregate;
  const { current, peak, trough } = nationalStats(agg);
  const pctBelowPeak =
    peak.index > 0 ? Math.round(((peak.index - current.index) / peak.index) * 100) : 0;

  return {
    peakMonth: peak.month,
    peakMonthLabel: monthLabel(peak.month),
    peakIndex: Math.round(peak.index * 10) / 10,
    currentIndex: Math.round(current.index * 10) / 10,
    currentMonthLabel: monthLabel(current.month),
    pctBelowPeak,
    covidDropPoints: Math.round(100 - trough.index),
    covidTroughMonth: trough.month,
    covidTroughIndex: Math.round(trough.index * 10) / 10,
  };
}

export function getAiReleaseInsights(data: StoryData) {
  const meta = data.story_meta;
  if (meta.aiReleaseInsights) return meta.aiReleaseInsights;

  const byMonth = aiReleasesByMonth(data.ai_models);
  let peakMonth = AI_ACCELERATION_START;
  let peakTotal = 0;
  Object.entries(byMonth).forEach(([month, counts]) => {
    const total = counts.OpenAI + counts.Anthropic;
    if (total > peakTotal) {
      peakTotal = total;
      peakMonth = month;
    }
  });
  const latest = data.aggregate[data.aggregate.length - 1]?.month ?? "2026-04";

  return {
    peakMonth,
    peakMonthLabel: monthLabel(peakMonth),
    peakTotal,
    accelerationStart: AI_ACCELERATION_START,
    accelerationEnd: latest,
    accelerationStartLabel: monthLabel(AI_ACCELERATION_START),
    accelerationEndLabel: monthLabel(latest),
  };
}

export const AI_ACCELERATION_BAND = {
  start: AI_ACCELERATION_START,
} as const;
