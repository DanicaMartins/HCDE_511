"use client";

import { cn } from "@/lib/utils";

const COLS = 10;
const ROWS = 3;

type CellKind = "automated" | "augmented" | "unknown";

const CELL_CLASS: Record<CellKind, string> = {
  automated: "bg-[#C5DDD4]",
  augmented: "bg-[#D8D0E8]",
  unknown: "bg-[#EDE8E0]",
};

const LEGEND = [
  { kind: "automated" as const, label: "Mostly automated tasks" },
  { kind: "augmented" as const, label: "Mostly augmented tasks" },
  { kind: "unknown" as const, label: "Tasks that don't appear in our data" },
];

/** Illustrative grid — detailed task breakdown not yet in dataset. */
export function TaskCompositionMiniGrid({
  automationScore,
  matchedCount,
  className,
}: {
  automationScore: number;
  matchedCount?: number;
  className?: string;
}) {
  const automatedCells = Math.round((automationScore / 100) * COLS);
  const augmentedCells = Math.round(((100 - automationScore) / 100) * COLS * 0.45);

  const cells: CellKind[] = Array.from({ length: COLS * ROWS }, (_, i) => {
    const col = i % COLS;
    if (col < automatedCells) return "automated";
    if (col < automatedCells + augmentedCells) return "augmented";
    return "unknown";
  });

  const coverageNote =
    matchedCount !== undefined && matchedCount > 0
      ? `${matchedCount} O*NET task${matchedCount === 1 ? "" : "s"} matched in our crosswalk for this sector.`
      : "Task-level breakdown not yet available for this sector.";

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className="text-xs font-medium text-foreground">Task composition estimate</p>
      <ul className="space-y-1">
        {LEGEND.map(({ kind, label }) => (
          <li key={kind} className="flex items-center gap-2 text-[11px] text-secondary">
            <span className={cn("h-2.5 w-2.5 shrink-0 rounded-sm", CELL_CLASS[kind])} aria-hidden />
            {label}
          </li>
        ))}
      </ul>
      <div
        className="grid gap-0.5"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        aria-label="Illustrative task exposure grid"
      >
        {cells.map((kind, i) => (
          <div key={i} className={cn("aspect-square rounded-[2px]", CELL_CLASS[kind])} />
        ))}
      </div>
      <p className="text-[10px] leading-snug text-muted">{coverageNote}</p>
    </div>
  );
}
