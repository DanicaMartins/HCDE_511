import type { MonthPoint, StoryMeta } from "./types";

export type CompareFilter = "top_movers" | "same_category" | "different_category";

export type CompareSectorCard = {
  sector: string;
  category: string;
  peakIndex: number;
  currentIndex: number;
  pctChange: number;
  series: MonthPoint[];
};

export function pctChangeFromPeak(currentIndex: number, peakIndex: number): number {
  if (!peakIndex) return 0;
  return ((currentIndex - peakIndex) / peakIndex) * 100;
}

export function formatPctChange(pct: number): string {
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

function toCard(
  sector: string,
  meta: StoryMeta,
  series: MonthPoint[]
): CompareSectorCard | null {
  const stats = meta.sectorStats[sector];
  if (!stats) return null;
  return {
    sector,
    category: meta.sectorToCategory[sector] ?? stats.category,
    peakIndex: stats.peakIndex,
    currentIndex: stats.currentIndex,
    pctChange: pctChangeFromPeak(stats.currentIndex, stats.peakIndex),
    series,
  };
}

export function getCompareSectors(
  filter: CompareFilter,
  selectedSector: string,
  meta: StoryMeta,
  sectors: Record<string, MonthPoint[]>
): CompareSectorCard[] {
  const selectedCat = meta.sectorToCategory[selectedSector];
  const names = Object.keys(sectors).filter((s) => s !== selectedSector);

  let ordered: string[];

  switch (filter) {
    case "top_movers":
      ordered = names
        .filter((s) => meta.sectorStats[s])
        .sort(
          (a, b) =>
            Math.abs(meta.sectorStats[b].drawdown) - Math.abs(meta.sectorStats[a].drawdown)
        );
      break;
    case "same_category":
      ordered = names
        .filter((s) => meta.sectorToCategory[s] === selectedCat)
        .sort((a, b) => a.localeCompare(b));
      break;
    case "different_category":
      ordered = names
        .filter((s) => meta.sectorToCategory[s] !== selectedCat)
        .sort(
          (a, b) =>
            Math.abs(meta.sectorStats[b]?.drawdown ?? 0) -
            Math.abs(meta.sectorStats[a]?.drawdown ?? 0)
        );
      break;
  }

  return ordered
    .map((sector) => toCard(sector, meta, sectors[sector] ?? []))
    .filter((c): c is CompareSectorCard => c !== null);
}
