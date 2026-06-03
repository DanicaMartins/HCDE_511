"use client";

import { useEffect, useMemo, useState } from "react";
import { CompareTrendCard } from "./CompareTrendCard";
import { SearchInput } from "./ui";
import {
  type CompareFilter,
  getCompareSectors,
} from "@/lib/compare-sectors";
import { getSectorChartColor } from "@/lib/sector-colors";
import { MAX_COMPARISON_SECTORS } from "@/lib/story-context";
import { searchSectors } from "@/lib/sector-search";
import type { StoryData, StoryMeta } from "@/lib/types";
import { cn } from "@/lib/utils";

const FILTERS: { id: CompareFilter; label: string }[] = [
  { id: "top_movers", label: "Top movers" },
  { id: "same_category", label: "Same category" },
  { id: "different_category", label: "Different category" },
];

const PAGE_SIZE = 4;

export function CompareTrendPanel({
  selectedSector,
  comparisonSectors,
  toggleComparisonSector,
  clearComparisonSectors,
  data,
  meta,
}: {
  selectedSector: string;
  comparisonSectors: string[];
  toggleComparisonSector: (sector: string) => boolean;
  clearComparisonSectors: () => void;
  data: StoryData;
  meta: StoryMeta;
}) {
  const [filter, setFilter] = useState<CompareFilter>("top_movers");
  const [page, setPage] = useState(0);
  const [compareQ, setCompareQ] = useState("");
  const [atCapHint, setAtCapHint] = useState(false);

  const allSectorNames = useMemo(() => Object.keys(data.sectors), [data.sectors]);
  const atCap = comparisonSectors.length >= MAX_COMPARISON_SECTORS;

  const cards = useMemo(
    () => getCompareSectors(filter, selectedSector, meta, data.sectors),
    [filter, selectedSector, meta, data.sectors]
  );

  const pageCount = Math.max(1, Math.ceil(cards.length / PAGE_SIZE));
  const pageCards = cards.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => {
    setPage(0);
  }, [filter, selectedSector]);

  useEffect(() => {
    if (page >= pageCount) setPage(Math.max(0, pageCount - 1));
  }, [page, pageCount]);

  useEffect(() => {
    if (!atCap) setAtCapHint(false);
  }, [atCap]);

  const compareSearchResults = useMemo(
    () => searchSectors(allSectorNames, compareQ, selectedSector, 10),
    [allSectorNames, compareQ, selectedSector]
  );

  const tryToggle = (sector: string) => {
    if (sector === selectedSector) return;
    const wasSelected = comparisonSectors.includes(sector);
    if (!wasSelected && atCap) {
      setAtCapHint(true);
      return;
    }
    toggleComparisonSector(sector);
    setAtCapHint(false);
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-serif text-base font-normal text-foreground">
            Compare trends with other sectors
          </h3>
          <p className="mt-0.5 max-w-xl text-[11px] leading-snug text-muted">
            Click sectors to overlay their trends (dotted lines) on the chart above. Select up to{" "}
            {MAX_COMPARISON_SECTORS} at once. The current sector stays as the solid line.
          </p>
        </div>
        {comparisonSectors.length > 0 && (
          <button
            type="button"
            onClick={clearComparisonSectors}
            className="shrink-0 rounded-md border border-border px-2.5 py-1 text-xs text-secondary hover:bg-surface-muted"
          >
            Clear comparison{comparisonSectors.length > 1 ? ` (${comparisonSectors.length})` : ""} ×
          </button>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-full border border-border px-3 py-1 text-xs transition-colors",
              filter === f.id
                ? "border-lavender/40 bg-pale-lavender text-foreground"
                : "bg-surface text-secondary hover:bg-surface-muted"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {atCapHint && (
        <p className="mt-1.5 text-[11px] text-below-baseline">
          Maximum {MAX_COMPARISON_SECTORS} comparison sectors — remove one to add another.
        </p>
      )}

      <div className="mt-2 flex items-stretch gap-1">
        <button
          type="button"
          aria-label="Previous sectors"
          disabled={page === 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="flex h-auto w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-muted disabled:opacity-30"
        >
          ‹
        </button>

        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
          {pageCards.length === 0 ? (
            <p className="py-4 text-xs text-muted">No sectors in this filter.</p>
          ) : (
            pageCards.map((card) => (
              <CompareTrendCard
                key={card.sector}
                card={card}
                meta={meta}
                selected={comparisonSectors.includes(card.sector)}
                onSelect={() => tryToggle(card.sector)}
              />
            ))
          )}
        </div>

        <button
          type="button"
          aria-label="Next sectors"
          disabled={page >= pageCount - 1}
          onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
          className="flex h-auto w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-muted disabled:opacity-30"
        >
          ›
        </button>
      </div>

      {pageCount > 1 && (
        <div className="mt-1.5 flex justify-center gap-1.5">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Page ${i + 1}`}
              onClick={() => setPage(i)}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-colors",
                i === page ? "bg-foreground" : "bg-border"
              )}
            />
          ))}
        </div>
      )}

      <div className="relative z-20 mt-2">
        <SearchInput
          value={compareQ}
          onChange={setCompareQ}
          placeholder="Search for your sector to compare"
        />
        {compareQ.trim().length > 0 && (
          <ul className="absolute left-0 right-0 mt-1 max-h-36 overflow-y-auto rounded-lg border border-border bg-surface shadow-card">
            {compareSearchResults.length === 0 ? (
              <li className="px-4 py-2.5 text-sm text-muted">No sectors match.</li>
            ) : (
              compareSearchResults.map((name) => {
                const cat = meta.sectorToCategory[name];
                const dotColor = getSectorChartColor(name, meta);
                const isSelected = comparisonSectors.includes(name);
                return (
                  <li key={name}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-surface-muted",
                        isSelected && "bg-pale-lavender/50"
                      )}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        tryToggle(name);
                        setCompareQ("");
                      }}
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: dotColor }}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1 truncate">{name}</span>
                      <span className="shrink-0 text-xs text-muted">
                        {isSelected ? "Selected" : cat}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
