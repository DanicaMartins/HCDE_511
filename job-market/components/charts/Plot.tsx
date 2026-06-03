"use client";

import dynamic from "next/dynamic";
import type { PlotParams } from "react-plotly.js";
import { attachPlotZoomGestures } from "@/lib/plot-zoom";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const DEFAULT_CONFIG: Partial<PlotParams["config"]> = {
  displayModeBar: false,
  responsive: true,
  scrollZoom: true,
  doubleClick: "reset",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PlotChartProps = Omit<PlotParams, "data" | "layout"> & {
  data: any;
  layout?: any;
};

export function PlotChart(props: PlotChartProps) {
  const { onInitialized, onHover, onUnhover, config, ...rest } = props;
  const plotProps = rest as PlotParams;

  return (
    <Plot
      {...plotProps}
      config={{ ...DEFAULT_CONFIG, ...config }}
      style={{ width: "100%", ...props.style }}
      useResizeHandler
      onHover={onHover}
      onUnhover={onUnhover}
      onInitialized={(figure, graphDiv) => {
        attachPlotZoomGestures(graphDiv);
        onInitialized?.(figure, graphDiv);
      }}
    />
  );
}
