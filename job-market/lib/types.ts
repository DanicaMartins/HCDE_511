export type MonthPoint = { month: string; index: number };

export type CategoryStyle = {
  color: string;
  bg: string;
  border: string;
  chartAccent: string;
};

export type SectorStats = {
  peakIndex: number;
  peakMonth: string;
  currentIndex: number;
  currentMonth: string;
  drawdown: number;
  belowBaseline: boolean;
  volatilitySince2022: number;
  titles: string;
  category: string;
};

export type StoryMeta = {
  categories: Record<string, string[]>;
  categoryStyles: Record<string, CategoryStyle>;
  sectorToCategory: Record<string, string>;
  defaultCategory: string;
  defaultSector: string;
  top10Highest: Array<{
    rank: number;
    sector: string;
    currentIndex: number;
    barPct: number;
    category: string;
    categoryColor: string;
  }>;
  top10Lowest: Array<{
    rank: number;
    sector: string;
    currentIndex: number;
    barPct: number;
    category: string;
    categoryColor: string;
  }>;
  nationalInsights: {
    peakMonth: string;
    peakMonthLabel: string;
    peakIndex: number;
    currentIndex: number;
    currentMonthLabel: string;
    pctBelowPeak: number;
    covidDropPoints: number;
    covidTroughMonth: string;
    covidTroughIndex: number;
  };
  aiReleaseInsights: {
    peakMonth: string;
    peakMonthLabel: string;
    peakTotal: number;
    accelerationStart: string;
    accelerationEnd: string;
    accelerationStartLabel: string;
    accelerationEndLabel: string;
  };
  sectorStats: Record<string, SectorStats>;
  quickFact: {
    headline: string;
    footnote: string;
    linkText: string;
    linkAnchor: string;
  };
  heroFacts: string[];
  compareSuggestions: string[];
  heatmap: {
    months: string[];
    sectorsGrouped: Array<{ category: string; sectors: string[] }>;
    cells: Array<{ sector: string; category: string; month: string; index: number }>;
  };
};

export type StoryData = {
  aggregate: MonthPoint[];
  sectors: Record<string, MonthPoint[]>;
  titles: Record<string, string>;
  crosswalk: Record<string, { score: number; matchedCount?: number }>;
  ai_models: Array<{ month: string; org: string; model: string }>;
  story_meta: StoryMeta;
};
