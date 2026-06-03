"use client";

import { cn } from "@/lib/utils";

export function CompareChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm transition-all duration-200",
        selected
          ? "border-lavender bg-pale-lavender text-foreground shadow-sm"
          : "border-border bg-surface text-secondary hover:border-lavender hover:bg-surface-muted"
      )}
    >
      {label}
    </button>
  );
}
