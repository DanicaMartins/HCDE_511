import type { Layout } from "plotly.js";

export const CHART_COLORS = {
  line: "#4A7A5A",
  baseline: "#999999",
  grid: "#E8E4DC",
  aiBand: "rgba(155, 139, 184, 0.12)",
  aiLabel: "#5B8DBF",
  openai: "#5B8DBF",
  anthropic: "#C8714A",
  compare: "#9B8BB8",
  paper: "#ffffff",
  plot: "#ffffff",
} as const;

const SERIF = "var(--font-serif), Georgia, serif";
const SANS = "var(--font-sans), Manrope, Helvetica Neue, sans-serif";

export function plotlyBaseLayout(overrides: Partial<Layout> = {}): Partial<Layout> {
  return {
    paper_bgcolor: CHART_COLORS.paper,
    plot_bgcolor: CHART_COLORS.plot,
    font: { family: SANS, size: 13, color: "#1a1714" },
    margin: { l: 56, r: 24, t: 56, b: 48 },
    xaxis: { gridcolor: CHART_COLORS.grid, zeroline: false },
    yaxis: { gridcolor: CHART_COLORS.grid, zeroline: false },
    hoverlabel: {
      bgcolor: "#1a1714",
      bordercolor: "#1a1714",
      font: { family: SANS, size: 13, color: "#f7f5f0" },
      align: "left",
      namelength: -1,
    },
    ...overrides,
  };
}

export function plotlyChartTitle(text: string): Partial<Layout["title"]> {
  return {
    text,
    font: { family: SERIF, size: 20, color: "#1a1714" },
    x: 0,
    xanchor: "left",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function plotlyAnnotationStyle(partial: Record<string, any> = {}): Record<string, any> {
  return {
    font: { family: SANS, size: 12, color: "#555555" },
    bgcolor: "rgba(255,255,255,0.85)",
    bordercolor: "#E8E4DC",
    borderwidth: 1,
    borderpad: 4,
    ...partial,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function baselineShape(x0: string, x1: string): any {
  return {
    type: "line",
    x0,
    x1,
    y0: 100,
    y1: 100,
    line: { dash: "dash", color: CHART_COLORS.baseline, width: 1 },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function aiAccelerationBand(x0: string, x1: string, yMax: number): any {
  return {
    type: "rect",
    x0,
    x1,
    y0: 0,
    y1: yMax,
    fillcolor: CHART_COLORS.aiBand,
    line: { width: 0 },
    layer: "below",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function covidEraBand(x0: string, x1: string, yMax: number): any {
  return {
    type: "rect",
    x0,
    x1,
    y0: 0,
    y1: yMax,
    fillcolor: "rgba(232, 160, 168, 0.18)",
    line: { width: 0 },
    layer: "below",
  };
}
