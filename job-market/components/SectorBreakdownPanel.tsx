"use client";

import { useMemo, useState } from "react";
import { SectorRow } from "./ui/SectorRow";
import { useStory } from "@/lib/story-context";
import { cn } from "@/lib/utils";

type SortMode = "highest" | "lowest";

export function SectorBreakdownPanel({
  id,
  className = "",
  compact = false,
}: {
  id?: string;
  className?: string;
  compact?: boolean;
}) {
  const { data, selectedSector, hoveredSector, setSelectedSector, setHoveredSector } = useStory();
  const [sortMode, setSortMode] = useState<SortMode>("highest");

  const rows = useMemo(() => {
    const source =
      sortMode === "highest"
        ? data.story_meta.top10Highest
        : data.story_meta.top10Lowest ?? data.story_meta.top10Highest;
    return source.map((row, i) => ({ ...row, rank: i + 1 }));
  }, [data.story_meta, sortMode]);

  const col1 = rows.filter((r) => r.rank <= 5);
  const col2 = rows.filter((r) => r.rank > 5);

  return (
    <div id={id} className={className}>
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3",
          compact ? "mb-2" : "mb-4"
        )}
      >
        <h3
          className={cn(
            "font-serif font-normal text-foreground",
            compact ? "text-lg md:text-xl" : "text-2xl md:text-3xl"
          )}
        >
          Break down of 37 sectors
        </h3>
        <label className="flex items-center gap-2 text-xs text-muted">
          <span className="sr-only">Sort sectors</span>
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-foreground focus:border-lavender focus:outline-none focus:ring-2 focus:ring-lavender/20"
          >
            <option value="highest">Top 10 highest</option>
            <option value="lowest">Top 10 lowest</option>
          </select>
        </label>
      </div>

      <div className={cn("grid md:grid-cols-2", compact ? "gap-0 md:gap-x-8" : "gap-2 md:gap-x-12")}>
        <div className="space-y-0">
          {col1.map((row) => (
            <SectorRow
              key={row.sector}
              rank={row.rank}
              sector={row.sector}
              currentIndex={row.currentIndex}
              barPct={row.barPct}
              compact={compact}
              selected={selectedSector === row.sector}
              hovered={hoveredSector === row.sector}
              onSelect={() => setSelectedSector(row.sector, { scroll: true })}
              onHover={() => setHoveredSector(row.sector)}
              onLeave={() => setHoveredSector(null)}
            />
          ))}
        </div>
        <div className="space-y-0">
          {col2.map((row) => (
            <SectorRow
              key={row.sector}
              rank={row.rank}
              sector={row.sector}
              currentIndex={row.currentIndex}
              barPct={row.barPct}
              compact={compact}
              selected={selectedSector === row.sector}
              hovered={hoveredSector === row.sector}
              onSelect={() => setSelectedSector(row.sector, { scroll: true })}
              onHover={() => setHoveredSector(row.sector)}
              onLeave={() => setHoveredSector(null)}
            />
          ))}
        </div>
      </div>

      <p className={cn("flex items-center gap-2 text-muted", compact ? "mt-2 text-xs" : "mt-5 text-sm")}>
        <span aria-hidden>👆</span>
        Click to see Details
      </p>
    </div>
  );
}
