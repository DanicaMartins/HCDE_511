"use client";

import { cn } from "@/lib/utils";

export function PlotHoverCard({
  title,
  subtitle,
  rows,
  footnote,
  className,
  style,
}: {
  title: string;
  subtitle?: string;
  rows: Array<{ label: string; value: string; tone?: "up" | "down" | "neutral" }>;
  footnote?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const toneDot = {
    up: "bg-[#7BA88A]",
    down: "bg-[#E8A8A0]",
    neutral: "bg-white/50",
  };

  return (
    <div
      className={cn(
        "pointer-events-none absolute z-50 w-64 rounded-lg border border-white/10 bg-charcoal px-3.5 py-3 text-left text-white shadow-card",
        className
      )}
      style={style}
    >
      <p className="text-sm font-medium leading-snug">{title}</p>
      {subtitle && <p className="mt-0.5 text-xs text-white/65">{subtitle}</p>}
      <dl className="mt-2.5 space-y-1.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-3 text-xs">
            <dt className="text-white/60">{row.label}</dt>
            <dd className="flex items-center gap-1.5 text-right font-medium">
              {row.tone && (
                <span
                  className={cn("h-1.5 w-1.5 shrink-0 rounded-full", toneDot[row.tone])}
                  aria-hidden
                />
              )}
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
      {footnote && (
        <p className="mt-2.5 border-t border-white/10 pt-2 text-[11px] leading-snug text-white/55">
          {footnote}
        </p>
      )}
    </div>
  );
}

/** Keep tooltip inside chart bounds; flip below cursor when near top edge. */
export function clampHoverCardPosition(
  x: number,
  y: number,
  containerWidth: number,
  containerHeight: number
): { left: number; top: number; transform: string } {
  const cardHalf = 128;
  const cardHeight = 190;
  const pad = 10;

  const left = Math.max(
    cardHalf + pad,
    Math.min(containerWidth - cardHalf - pad, x)
  );

  const showBelow = y - cardHeight - pad < 0;
  if (showBelow) {
    return {
      left,
      top: Math.min(y + 16, containerHeight - pad),
      transform: "translate(-50%, 0)",
    };
  }

  return {
    left,
    top: Math.max(pad + cardHeight, y - 12),
    transform: "translate(-50%, -100%)",
  };
}
