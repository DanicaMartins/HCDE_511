import type { MonthPoint } from "./types";

export type SparkPoint = { x: number; y: number };

export function downsampleSeries(points: MonthPoint[], maxPoints = 12): SparkPoint[] {
  if (!points.length) return [];
  if (points.length <= maxPoints) {
    return points.map((p, i) => ({ x: i, y: p.index }));
  }
  const step = (points.length - 1) / (maxPoints - 1);
  return Array.from({ length: maxPoints }, (_, i) => {
    const idx = Math.round(i * step);
    return { x: i, y: points[idx].index };
  });
}

export function sparklinePath(
  points: SparkPoint[],
  width: number,
  height: number,
  padding = 2
): string {
  if (points.length < 2) return "";

  const ys = points.map((p) => p.y);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const range = maxY - minY || 1;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const coords = points.map((p, i) => {
    const x = padding + (i / (points.length - 1)) * innerW;
    const y = padding + innerH - ((p.y - minY) / range) * innerH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return `M ${coords.join(" L ")}`;
}
