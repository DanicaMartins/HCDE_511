"use client";

import { useCallback, useMemo, useState } from "react";
import type { PlotRelayoutEvent } from "plotly.js";
import { ZOOM_HINT } from "@/lib/plot-zoom";
import { PlotChart, type PlotChartProps } from "./Plot";

type AxisRange = [string | number, string | number] | [number, number];

export function TimelinePlotChart({
  initialXRange,
  initialYRange,
  layout,
  onRelayout,
  config,
  ...props
}: PlotChartProps & {
  initialXRange?: AxisRange;
  initialYRange?: AxisRange;
}) {
  const [zoomed, setZoomed] = useState(false);
  const [resetTick, setResetTick] = useState(0);

  const zoomLayout = useMemo(() => {
    const next = { ...layout, uirevision: `reset-${resetTick}` };
    if (initialXRange) {
      next.xaxis = {
        ...next.xaxis,
        autorange: false,
        range: [initialXRange[0], initialXRange[1]],
      };
    }
    if (initialYRange) {
      next.yaxis = {
        ...next.yaxis,
        autorange: false,
        range: [initialYRange[0], initialYRange[1]],
      };
    }
    return next;
  }, [layout, resetTick, initialXRange, initialYRange]);

  const handleRelayout = useCallback(
    (event: PlotRelayoutEvent) => {
      onRelayout?.(event);
      const isAutorange =
        event["xaxis.autorange"] === true || event["yaxis.autorange"] === true;

      if (isAutorange) {
        setZoomed(false);
        return;
      }

      const x0 = event["xaxis.range[0]"];
      const x1 = event["xaxis.range[1]"];
      const y0 = event["yaxis.range[0]"];
      const y1 = event["yaxis.range[1]"];

      if (initialXRange && x0 !== undefined && x1 !== undefined) {
        if (String(x0) !== String(initialXRange[0]) || String(x1) !== String(initialXRange[1])) {
          setZoomed(true);
          return;
        }
      }
      if (initialYRange && y0 !== undefined && y1 !== undefined) {
        if (Number(y0) !== Number(initialYRange[0]) || Number(y1) !== Number(initialYRange[1])) {
          setZoomed(true);
          return;
        }
      }
    },
    [initialXRange, initialYRange, onRelayout]
  );

  const handleReset = useCallback(() => {
    setResetTick((t) => t + 1);
    setZoomed(false);
  }, []);

  return (
    <div className="plot-zoom-chart relative">
      <div className="mb-0.5 flex items-center justify-end gap-3">
        <p className="text-[10px] leading-tight text-muted/75">{ZOOM_HINT}</p>
        <button
          type="button"
          onClick={handleReset}
          className={`shrink-0 text-[10px] leading-tight transition-opacity hover:text-foreground ${
            zoomed ? "text-foreground opacity-100" : "text-muted opacity-60"
          }`}
        >
          Reset zoom
        </button>
      </div>
      <PlotChart
        {...props}
        layout={zoomLayout}
        onRelayout={handleRelayout}
        config={{ scrollZoom: true, doubleClick: "reset", ...config }}
      />
    </div>
  );
}
