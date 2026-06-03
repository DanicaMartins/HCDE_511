"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { TaskCompositionMiniGrid } from "./TaskCompositionMiniGrid";
import { CategoryPill } from "./ui";
import { useStory } from "@/lib/story-context";
import {
  automationExposureLabel,
  baselineStatusLabel,
  getCategoryInsights,
} from "@/lib/category-insights";
import {
  cn,
  heatmapCellColor,
  HEATMAP_LEGEND_STOPS,
  pctVsBaseline,
} from "@/lib/utils";

type HoveredCell = {
  sector: string;
  month: string;
  index: number;
  x: number;
  y: number;
};

const CAT_RAIL_CLASS: Record<string, string> = {
  "Knowledge Work": "border-l-knowledge bg-knowledge-bg/40",
  "Care & Service": "border-l-care bg-care-bg/40",
  "Tech & Engineering": "border-l-tech bg-tech-bg/40",
};

const CAT_ACCENT: Record<string, string> = {
  "Knowledge Work": "text-knowledge",
  "Care & Service": "text-care",
  "Tech & Engineering": "text-tech",
};

function monthColumnLabel(month: string, index: number, months: string[]): string | null {
  const [, m] = month.split("-");
  if (index === 0) return month.slice(0, 4);
  const prevYear = months[index - 1]?.slice(0, 4);
  const year = month.slice(0, 4);
  if (year !== prevYear) return year;
  if (["02", "05", "08", "11"].includes(m)) return m;
  return null;
}

export function SectorHeatmap() {
  const { data, selectedSector, selectedCategory, setSelectedCategory, setSelectedSector } =
    useStory();
  const meta = data.story_meta;
  const hm = meta.heatmap;
  const gridRef = useRef<HTMLDivElement>(null);

  const [hovered, setHovered] = useState<HoveredCell | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const cellMap = useMemo(() => {
    const m = new Map<string, number>();
    hm.cells.forEach((c) => m.set(`${c.sector}|${c.month}`, c.index));
    return m;
  }, [hm.cells]);

  const categorySectors = useMemo(
    () => meta.categories[selectedCategory] ?? [],
    [meta.categories, selectedCategory]
  );

  const insights = useMemo(
    () => getCategoryInsights(selectedCategory, meta, cellMap),
    [selectedCategory, meta, cellMap]
  );

  const crosswalk = data.crosswalk[selectedSector] ?? { score: 50 };
  const sectorCategory = meta.sectorToCategory[selectedSector] ?? selectedCategory;
  const catStyle = meta.categoryStyles[selectedCategory];

  const selectSector = useCallback(
    (sector: string) => {
      setSelectedSector(sector, { scroll: false });
    },
    [setSelectedSector]
  );

  const onCellEnter = (
    sector: string,
    month: string,
    index: number,
    el: HTMLButtonElement
  ) => {
    setHoveredRow(sector);
    const grid = gridRef.current;
    if (!grid) return;
    const gridRect = grid.getBoundingClientRect();
    const cellRect = el.getBoundingClientRect();
    setHovered({
      sector,
      month,
      index,
      x: cellRect.left - gridRect.left + cellRect.width / 2,
      y: cellRect.top - gridRect.top,
    });
  };

  return (
    <section
      id="heatmap"
      className="category-heatmap-viewport border-t border-border"
    >
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(220px,260px)_1fr]">
        <aside className="category-heatmap-rail flex flex-col border-b border-border lg:border-b-0 lg:border-r">
          <div className="shrink-0 border-b border-border px-4 py-3">
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-muted">
              Category
            </label>
            <select
              className="w-full rounded-md border border-border bg-surface px-2.5 py-2 text-sm text-foreground focus:border-knowledge focus:outline-none focus:ring-2 focus:ring-knowledge-border/60"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {Object.keys(meta.categories).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <h3 className="font-serif text-lg font-normal text-foreground">Key insights</h3>
            <ul className="mt-3 space-y-3">
              {insights.map((insight, i) => (
                <li
                  key={i}
                  className={cn(
                    "border-l-[3px] py-1 pl-3 text-sm leading-relaxed text-secondary",
                    CAT_RAIL_CLASS[selectedCategory] ?? "border-l-border bg-surface-muted/50"
                  )}
                >
                  {insight.text}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[11px] leading-snug text-muted">
              Feb 1, 2020 = 100. Values above 100 are above baseline; values below 100 are below
              baseline.
            </p>
          </div>
        </aside>

        <div className="category-heatmap-main flex min-w-0 flex-col">
          <header className="shrink-0 px-4 pb-2 pt-4 md:px-5">
            <h2 className="font-serif text-section-title font-normal text-foreground">
              Compare job posting demand within each category
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-secondary">
              Each row is a sector. Each column is a month. Color shows whether postings were
              below, near, or above that sector&apos;s Feb 2020 baseline.
            </p>
          </header>

          <div className="relative min-h-0 flex-1 px-4 pb-3 md:px-5">
            <div className="mb-2 flex flex-wrap items-center justify-end gap-2">
              <span className="text-[10px] text-muted">Below baseline</span>
              <div className="flex h-3 overflow-hidden rounded-sm">
                {HEATMAP_LEGEND_STOPS.map((stop) => (
                  <div
                    key={stop.label}
                    className="w-7 first:rounded-l-sm last:rounded-r-sm"
                    style={{ backgroundColor: stop.color }}
                    title={stop.label}
                  />
                ))}
              </div>
              <span className="text-[10px] text-muted">Above baseline</span>
              <div className="ml-2 flex gap-1 text-[9px] text-muted/80">
                {HEATMAP_LEGEND_STOPS.map((s) => (
                  <span key={s.label}>{s.label}</span>
                ))}
              </div>
            </div>

            <div ref={gridRef} className="relative overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-[11px]">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-20 w-[148px] bg-surface pb-1 pr-2 text-left font-normal text-muted" />
                    {hm.months.map((month, i) => {
                      const label = monthColumnLabel(month, i, hm.months);
                      return (
                        <th
                          key={month}
                          className="min-w-[10px] p-0 pb-1 text-center font-normal text-muted"
                        >
                          {label && (
                            <span className={label.length === 4 ? "text-[10px]" : "text-[9px]"}>
                              {label}
                            </span>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {categorySectors.map((sector) => {
                    const isSelected = sector === selectedSector;
                    const isRowHover = sector === hoveredRow;
                    return (
                      <tr
                        key={sector}
                        className={cn(
                          isSelected && "bg-pale-lavender/30",
                          isRowHover && !isSelected && "bg-surface-muted/80"
                        )}
                      >
                        <td className="sticky left-0 z-10 bg-inherit py-0 pr-2">
                          <button
                            type="button"
                            onClick={() => selectSector(sector)}
                            className={cn(
                              "block w-full truncate py-[3px] pl-1 text-left transition-colors",
                              isSelected
                                ? cn("font-medium", CAT_ACCENT[selectedCategory] ?? "text-foreground")
                                : "text-foreground hover:text-secondary"
                            )}
                          >
                            {sector}
                          </button>
                        </td>
                        {hm.months.map((month) => {
                          const key = `${sector}|${month}`;
                          const idx = cellMap.get(key);
                          if (idx === undefined) {
                            return (
                              <td key={month} className="p-px">
                                <div className="h-[14px] w-full min-w-[8px] rounded-[2px] bg-border-subtle" />
                              </td>
                            );
                          }
                          const isCellHover =
                            hovered?.sector === sector && hovered?.month === month;
                          return (
                            <td key={month} className="p-px">
                              <button
                                type="button"
                                aria-label={`${sector}, ${month}, index ${idx.toFixed(1)}`}
                                onClick={() => selectSector(sector)}
                                onMouseEnter={(e) => onCellEnter(sector, month, idx, e.currentTarget)}
                                onMouseLeave={() => {
                                  setHovered(null);
                                  setHoveredRow(null);
                                }}
                                className={cn(
                                  "h-[14px] w-full min-w-[8px] rounded-[2px] transition-shadow",
                                  isCellHover && "ring-2 ring-charcoal ring-offset-1",
                                  isSelected && !isCellHover && "ring-1 ring-charcoal/30"
                                )}
                                style={{ backgroundColor: heatmapCellColor(idx) }}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {hovered && (
                <div
                  className="pointer-events-none absolute z-30 w-52 -translate-x-1/2 rounded-lg border border-border bg-charcoal px-3 py-2.5 text-left text-white shadow-card"
                  style={{
                    left: hovered.x,
                    top: hovered.y - 8,
                    transform: "translate(-50%, -100%)",
                  }}
                >
                  <p className="text-xs font-medium">{hovered.sector}</p>
                  <p className="mt-0.5 text-[11px] text-white/70">{hovered.month}</p>
                  <p className="mt-1.5 text-sm font-medium">Index: {hovered.index.toFixed(1)}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[11px]">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        hovered.index >= 100 ? "bg-[#7BA88A]" : "bg-[#E8A8A0]"
                      )}
                    />
                    {baselineStatusLabel(hovered.index)}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-white/80">
                    {pctVsBaseline(hovered.index)} for this sector.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 border-t border-border px-4 py-4 md:px-5">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <h3
                className={cn(
                  "font-serif text-xl font-normal",
                  CAT_ACCENT[sectorCategory] ?? "text-foreground"
                )}
              >
                Selected: {selectedSector}
              </h3>
              <CategoryPill category={sectorCategory} />
            </div>

            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="rounded-xl border border-border bg-surface p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  Automation Risk Score
                </p>
                <p className="mt-2 font-serif text-3xl text-foreground">
                  {crosswalk.score}
                  <span className="text-lg text-muted"> / 100</span>
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-border-subtle">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${crosswalk.score}%`,
                      backgroundColor: catStyle?.chartAccent ?? "#5A8F7A",
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-secondary">
                  {automationExposureLabel(crosswalk.score)}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-surface p-4">
                <TaskCompositionMiniGrid
                  automationScore={crosswalk.score}
                  matchedCount={crosswalk.matchedCount}
                />
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-muted">
              The national average hides sector-level differences. The heatmap shows how sectors
              within the same category moved differently over time. Selecting a sector connects its
              hiring pattern to automation exposure — where AI may be relevant without claiming
              causation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
