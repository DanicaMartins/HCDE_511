import { CHART_COLORS } from "./chart-theme";
import type { StoryMeta } from "./types";

export function getCategoryChartColor(
  category: string | undefined,
  meta: StoryMeta
): string {
  if (!category) return CHART_COLORS.line;
  return meta.categoryStyles[category]?.chartAccent ?? CHART_COLORS.line;
}

export function getSectorChartColor(sector: string, meta: StoryMeta): string {
  const category = meta.sectorToCategory[sector];
  return getCategoryChartColor(category, meta);
}

/** Category palette for legend labels */
export const CATEGORY_LEGEND: Record<string, string> = {
  "Knowledge Work": "Knowledge Work (purple)",
  "Care & Service": "Care & Service (green)",
  "Tech & Engineering": "Tech & Engineering (gold)",
};

const COMPARE_LINE_DASHES = ["dot", "dash", "dashdot", "longdash", "longdashdot"] as const;

export function getCompareLineStyle(index: number): {
  dash: (typeof COMPARE_LINE_DASHES)[number];
  width: number;
} {
  return {
    dash: COMPARE_LINE_DASHES[index % COMPARE_LINE_DASHES.length],
    width: 2,
  };
}
