import type { StoryData, StoryMeta } from "./types";

export const JOB_BASELINE = 100;
export const AUTOMATION_MID = 50;
/** One frame per year (~7 frames → ~5.6s total). */
export const PLAYBACK_INTERVAL_MS = 800;
export const BUBBLE_TRANSITION_MS = 450;
export const ENTRANCE_STAGGER_MS = 30;

export type PlaybackFrame = {
  year: number;
  monthKey: string;
};

/** One snapshot per year: Dec year-end, except 2026 uses latest Apr data. */
export function buildPlaybackFrames(): PlaybackFrame[] {
  const frames: PlaybackFrame[] = [];
  for (let year = 2020; year <= 2026; year++) {
    frames.push({
      year,
      monthKey: year === 2026 ? "2026-04" : `${year}-12`,
    });
  }
  return frames;
}

export type SectorNode = {
  name: string;
  category: string;
  automation: number;
  matchedCount: number;
  indexByMonth: Map<string, number>;
};

export function buildSectorNodes(
  sectors: StoryData["sectors"],
  crosswalk: StoryData["crosswalk"],
  meta: StoryMeta
): SectorNode[] {
  return Object.keys(sectors)
    .filter((name) => sectors[name]?.length)
    .map((name) => {
      const indexByMonth = new Map<string, number>();
      sectors[name].forEach((point) => indexByMonth.set(point.month, point.index));
      const cw = crosswalk[name] ?? { score: 50, matchedCount: 0 };
      return {
        name,
        category: meta.sectorToCategory[name] ?? "",
        automation: cw.score,
        matchedCount: cw.matchedCount ?? 0,
        indexByMonth,
      };
    });
}

export function sectorIndexAtMonth(node: SectorNode, month: string): number {
  if (node.indexByMonth.has(month)) return node.indexByMonth.get(month)!;
  const sorted = Array.from(node.indexByMonth.keys()).sort();
  const prior = sorted.filter((m) => m <= month).pop();
  if (prior) return node.indexByMonth.get(prior)!;
  return JOB_BASELINE;
}

/** Bubble radius from O*NET occupation match count (occupation breadth). */
export function bubbleBaseRadius(matchedCount: number): number {
  return Math.max(5, Math.min(16, Math.sqrt(matchedCount) * 2.2 + 5));
}

export function getFixedXDomain(sectors: StoryData["sectors"]): [number, number] {
  const values: number[] = [];
  Object.values(sectors).forEach((series) =>
    series.forEach((point) => values.push(point.index))
  );
  if (!values.length) return [60, 180];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.06 || 8;
  return [min - pad, max + pad];
}

export const Y_DOMAIN: [number, number] = [0, 100];

/** Top-left quadrant: high automation, below baseline. */
export function getMostExposedSectors(
  nodes: SectorNode[],
  monthKey: string
): SectorNode[] {
  return nodes
    .filter((node) => {
      const index = sectorIndexAtMonth(node, monthKey);
      return index < JOB_BASELINE && node.automation >= AUTOMATION_MID;
    })
    .sort(
      (a, b) =>
        sectorIndexAtMonth(a, monthKey) - sectorIndexAtMonth(b, monthKey) ||
        b.automation - a.automation
    );
}

export function yearFromMonth(month: string): string {
  return month.slice(0, 4);
}
