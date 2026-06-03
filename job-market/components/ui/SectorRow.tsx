"use client";

import { cn, pctVsBaseline } from "@/lib/utils";

export function SectorRow({
  rank,
  sector,
  currentIndex,
  barPct,
  compact = false,
  selected,
  hovered,
  onSelect,
  onHover,
  onLeave,
}: {
  rank: number;
  sector: string;
  currentIndex: number;
  barPct: number;
  compact?: boolean;
  selected: boolean;
  hovered: boolean;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={cn(
        "grid w-full cursor-pointer items-center rounded-lg text-left text-foreground transition-all duration-150",
        compact
          ? "grid-cols-[28px_1fr_auto_48px] gap-2 px-2 py-1.5"
          : "grid-cols-[32px_1fr_auto_52px] gap-3 px-3 py-3",
        selected && "bg-[#E5E7EB]",
        !selected && hovered && "bg-surface-muted",
        !selected && !hovered && "hover:bg-surface-muted"
      )}
      title={`${sector}: index ${currentIndex.toFixed(0)} — ${pctVsBaseline(currentIndex)}`}
    >
      <span className="text-xs tabular-nums text-muted">{rank}</span>
      <span
        className={cn("min-w-0 truncate text-sm text-foreground", selected && "font-semibold")}
      >
        {sector}
      </span>
      <span className="h-1.5 w-24 overflow-hidden rounded-full bg-border-subtle">
        <span
          className="block h-full rounded-full"
          style={{
            width: `${barPct}%`,
            background: "linear-gradient(90deg, var(--dusty-rose), var(--above-baseline))",
          }}
          aria-hidden
        />
      </span>
      <span
        className={cn(
          "text-right text-sm tabular-nums text-foreground",
          selected ? "font-bold" : "font-semibold"
        )}
      >
        {currentIndex.toFixed(0)}
      </span>
    </button>
  );
}
