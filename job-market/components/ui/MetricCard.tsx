import type { ReactNode } from "react";

export function MetricCard({
  label,
  value,
  icon,
  compact = false,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "rounded-lg border border-border bg-surface p-3" : "card-editorial p-5"}>
      {icon && <div className="mb-1 text-muted">{icon}</div>}
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted">{label}</div>
      <div className={compact ? "mt-1 text-sm text-foreground" : "mt-2 text-base text-foreground"}>
        {value}
      </div>
    </div>
  );
}
