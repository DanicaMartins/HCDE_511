import type { MonthPoint } from "./types";

export function sortMonths(months: string[]): string[] {
  return [...months].sort();
}

export function assertMonotonicMonths(series: MonthPoint[]): void {
  if (process.env.NODE_ENV === "production") return;
  for (let i = 1; i < series.length; i++) {
    if (series[i].month < series[i - 1].month) {
      console.warn("[chart-data] months not sorted", series[0]?.month, series[i]?.month);
      break;
    }
  }
}

export function seriesToTrace(series: MonthPoint[]): { x: string[]; y: number[] } {
  assertMonotonicMonths(series);
  return {
    x: series.map((d) => d.month),
    y: series.map((d) => d.index),
  };
}

export type AlignedCompare = {
  months: string[];
  primaryY: (number | null)[];
  compareY: (number | null)[];
};

export function alignSeriesForCompare(
  primary: MonthPoint[],
  compare: MonthPoint[]
): AlignedCompare {
  const pmap = new Map(primary.map((d) => [d.month, d.index]));
  const cmap = new Map(compare.map((d) => [d.month, d.index]));
  const months = sortMonths(
    Array.from(new Set([...Array.from(pmap.keys()), ...Array.from(cmap.keys())]))
  );
  return {
    months,
    primaryY: months.map((m) => (pmap.has(m) ? pmap.get(m)! : null)),
    compareY: months.map((m) => (cmap.has(m) ? cmap.get(m)! : null)),
  };
}

export function nationalStats(aggregate: MonthPoint[]) {
  if (!aggregate.length) {
    throw new Error("Empty aggregate series");
  }
  const current = aggregate[aggregate.length - 1];
  const peak = aggregate.reduce((a, b) => (b.index > a.index ? b : a), aggregate[0]);
  const covid = aggregate.filter((r) => r.month >= "2020-03" && r.month <= "2020-07");
  const trough = covid.length
    ? covid.reduce((a, b) => (b.index < a.index ? b : a), covid[0])
    : aggregate.reduce((a, b) => (b.index < a.index ? b : a), aggregate[0]);
  return { current, peak, trough };
}

export function aiReleasesByMonth(
  ai: Array<{ month: string; org: string }>
): Record<string, { OpenAI: number; Anthropic: number }> {
  const out: Record<string, { OpenAI: number; Anthropic: number }> = {};
  ai.forEach((m) => {
    if (!out[m.month]) out[m.month] = { OpenAI: 0, Anthropic: 0 };
    if (m.org === "OpenAI") out[m.month].OpenAI += 1;
    else if (m.org === "Anthropic") out[m.month].Anthropic += 1;
  });
  return out;
}

export function indexYMax(values: number[], floor = 200, padding = 1.1): number {
  const finite = values.filter((v) => Number.isFinite(v));
  const max = finite.length ? Math.max(...finite) : 100;
  return Math.max(floor, max * padding);
}
