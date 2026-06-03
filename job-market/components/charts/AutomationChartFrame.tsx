"use client";

import type { RefObject, ReactNode } from "react";

/** Decorative frame for Section 5 — soft ambient wash, no silhouettes. */
export function AutomationChartFrame({
  containerRef,
  children,
}: {
  containerRef: RefObject<HTMLDivElement>;
  children: ReactNode;
}) {
  return (
    <div
      ref={containerRef}
      className="automation-quadrant-chart relative overflow-visible rounded-xl"
    >
      <div className="automation-quadrant-chart__wash pointer-events-none absolute inset-0 rounded-xl" aria-hidden />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
