import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function pctVsBaseline(index: number): string {
  const d = index - 100;
  if (Math.abs(d) < 0.5) return "same as Feb 2020";
  if (d > 0) return `${d.toFixed(0)}% more postings than Feb 2020`;
  return `${Math.abs(d).toFixed(0)}% fewer postings than Feb 2020`;
}

export function formatMonth(ym: string): string {
  const [y, m] = ym.split("-");
  const names = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${names[parseInt(m, 10) - 1]} ${y}`;
}

export function heatmapCellColor(index: number): string {
  if (index < 80) return "#E8C4B8";
  if (index < 90) return "#E8D4CC";
  if (index < 100) return "#E8E4DC";
  if (index < 110) return "#B8D4C4";
  if (index < 120) return "#5A8F7A";
  if (index < 130) return "#3D6B5C";
  return "#2A5248";
}

export const HEATMAP_LEGEND_STOPS = [
  { label: "< 80", color: "#E8C4B8" },
  { label: "90", color: "#E8D4CC" },
  { label: "100", color: "#E8E4DC" },
  { label: "110", color: "#B8D4C4" },
  { label: "120", color: "#5A8F7A" },
  { label: "> 130", color: "#2A5248" },
] as const;
