"use client";

import { downsampleSeries, sparklinePath } from "@/lib/sparkline";
import { formatPctChange, type CompareSectorCard } from "@/lib/compare-sectors";
import { getSectorChartColor } from "@/lib/sector-colors";
import type { StoryMeta } from "@/lib/types";
import { cn } from "@/lib/utils";

const SPARK_W = 120;
const SPARK_H = 36;

export function CompareTrendCard({
  card,
  meta,
  selected,
  onSelect,
}: {
  card: CompareSectorCard;
  meta: StoryMeta;
  selected: boolean;
  onSelect: () => void;
}) {
  const color = getSectorChartColor(card.sector, meta);
  const sparkPoints = downsampleSeries(card.series, 12);
  const path = sparklinePath(sparkPoints, SPARK_W, SPARK_H);
  const pct = card.pctChange;
  const pctPositive = pct >= 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex min-w-[140px] flex-1 cursor-pointer flex-col rounded-lg border border-border bg-surface p-2.5 text-left transition-all",
        "hover:border-border/80 hover:shadow-sm",
        selected && "ring-2 ring-amber-400/90 ring-offset-1"
      )}
    >
      <div className="flex min-h-0 flex-1 gap-2">
        <span
          className="w-1 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-foreground">{card.sector}</div>
          <div className="truncate text-[10px] text-muted">{card.category}</div>
          <svg
            viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
            className="mt-1.5 h-9 w-full"
            aria-hidden
          >
            <path
              d={path}
              fill="none"
              stroke={color}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      <span
        className={cn(
          "mt-1.5 inline-block self-start rounded px-1.5 py-0.5 text-[10px] font-medium tabular-nums",
          pctPositive ? "bg-[#EFF5F2] text-above-baseline" : "bg-[#F5EBE8] text-below-baseline"
        )}
      >
        {formatPctChange(pct)}
      </span>
    </button>
  );
}
