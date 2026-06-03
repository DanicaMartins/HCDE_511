import { cn } from "@/lib/utils";

export function DrawdownCard({
  value,
  belowPeak,
  compact = false,
}: {
  value: number;
  belowPeak?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border",
        compact ? "p-3" : "rounded-xl p-6",
        belowPeak !== false
          ? "border-rose/30 bg-[#F5EBE8]"
          : "border-above-baseline/30 bg-[#EFF5F2]"
      )}
    >
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted">Drawdown</div>
      <div
        className={cn(
          "mt-1 font-serif text-rose",
          compact ? "text-3xl" : "mt-2 text-4xl"
        )}
      >
        {Math.round(value)}
      </div>
      <div className={compact ? "mt-0.5 text-xs text-muted" : "mt-1 text-sm text-muted"}>
        from peak
      </div>
    </div>
  );
}
