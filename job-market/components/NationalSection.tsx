"use client";

import { useCallback, useMemo, useState } from "react";
import { NationalSidebar } from "./NationalSidebar";
import { TimelinePlotChart } from "./charts/TimelinePlotChart";
import { SectorBreakdownPanel } from "./SectorBreakdownPanel";
import { EraToggle, SectionTitle } from "./ui";
import { useStory } from "@/lib/story-context";
import {
  aiReleasesByMonth,
  nationalStats,
  seriesToTrace,
  sortMonths,
} from "@/lib/chart-data";
import { AI_ACCELERATION_BAND } from "@/lib/national-insights";
import {
  type NationalInsightId,
  INSIGHT_MARKER_COLORS,
} from "@/lib/national-insight-highlight";
import {
  CHART_COLORS,
  aiAccelerationBand,
  baselineShape,
  covidEraBand,
  plotlyAnnotationStyle,
  plotlyBaseLayout,
} from "@/lib/chart-theme";

const CHART_MARGIN = { l: 52, r: 16, t: 8, b: 40 };
const COVID_BAND = { start: "2020-02", end: "2020-08" };

function insightVerticalLine(month: string) {
  return {
    type: "line" as const,
    x0: month,
    x1: month,
    y0: 0,
    y1: 200,
    line: { dash: "dot", color: "rgba(26, 23, 20, 0.2)", width: 1 },
    layer: "below" as const,
  };
}

export function NationalSection() {
  const { data } = useStory();
  const agg = data.aggregate;
  const ai = data.ai_models;
  const [showCovidEra, setShowCovidEra] = useState(false);
  const [showAiAcceleration, setShowAiAcceleration] = useState(false);
  const [activeInsight, setActiveInsight] = useState<NationalInsightId | null>(null);

  const stats = useMemo(() => nationalStats(agg), [agg]);
  const lastMonth = agg[agg.length - 1]?.month ?? "2026-04";
  const aiBandX0 = AI_ACCELERATION_BAND.start;

  const onInsightSelect = useCallback((id: NationalInsightId) => {
    setActiveInsight((prev) => (prev === id ? null : id));
  }, []);

  const { lineLayout, lineData, barData, barLayout, lineXRange, lineYRange, barXRange, barYRange } =
    useMemo(() => {
      const { x, y } = seriesToTrace(agg);
      const aiByMonth = aiReleasesByMonth(ai);
      const barMonths = sortMonths([...x, ...Object.keys(aiByMonth)]);

      const bandShapes = [
        ...(showCovidEra ? [covidEraBand(COVID_BAND.start, COVID_BAND.end, 200)] : []),
        baselineShape(x[0], x[x.length - 1]),
        ...(showAiAcceleration
          ? [aiAccelerationBand(aiBandX0, lastMonth, 200)]
          : []),
      ];

      const allInsightAnnotations = {
        covid: plotlyAnnotationStyle({
          x: stats.trough.month,
          y: stats.trough.index,
          text: `COVID drop ~${stats.trough.index.toFixed(0)}`,
          showarrow: true,
          arrowhead: 2,
          ax: 40,
          ay: -40,
          bgcolor: "#F5EBE8",
          bordercolor: "#E8A0A8",
        }),
        peak: plotlyAnnotationStyle({
          x: stats.peak.month,
          y: stats.peak.index,
          text: `Hiring boom peak ~${stats.peak.index.toFixed(0)}`,
          showarrow: true,
          ax: -10,
          ay: -35,
          bgcolor: "#EFF5F2",
          bordercolor: "#4A7A5A",
        }),
        current: plotlyAnnotationStyle({
          x: stats.current.month,
          y: stats.current.index,
          text: `2026 near baseline ~${stats.current.index.toFixed(0)}`,
          showarrow: true,
          ax: 45,
          ay: 25,
          bgcolor: "#E8EEF5",
          bordercolor: CHART_COLORS.aiLabel,
        }),
      };

      const lineAnnotations = activeInsight
        ? [allInsightAnnotations[activeInsight]]
        : [
            allInsightAnnotations.covid,
            allInsightAnnotations.peak,
            allInsightAnnotations.current,
          ];

      if (showCovidEra) {
        lineAnnotations.unshift(
          plotlyAnnotationStyle({
            x: COVID_BAND.start,
            y: 185,
            text: "COVID Era",
            showarrow: false,
            font: { size: 11, color: "#B85040" },
            bgcolor: "rgba(245, 235, 232, 0.9)",
            bordercolor: "#E8A0A8",
          })
        );
      }

      if (showAiAcceleration) {
        lineAnnotations.push(
          plotlyAnnotationStyle({
            x: "2025-06",
            y: 188,
            text: "AI Acceleration",
            showarrow: false,
            font: { size: 12, color: CHART_COLORS.aiLabel },
          })
        );
      }

      const insightPoint =
        activeInsight === "peak"
          ? { month: stats.peak.month, index: stats.peak.index }
          : activeInsight === "current"
            ? { month: stats.current.month, index: stats.current.index }
            : activeInsight === "covid"
              ? { month: stats.trough.month, index: stats.trough.index }
              : null;

      const lineShapes = [
        ...bandShapes,
        ...(insightPoint ? [insightVerticalLine(insightPoint.month)] : []),
      ];

      const lineTraces = [
        {
          x,
          y,
          type: "scatter" as const,
          mode: "lines" as const,
          line: { color: CHART_COLORS.line, width: 2.5 },
          hovertemplate: "%{x}<br>Index: %{y:.1f}<br>100 = Feb 2020 baseline<extra></extra>",
        },
        ...(insightPoint
          ? [
              {
                x: [insightPoint.month],
                y: [insightPoint.index],
                type: "scatter" as const,
                mode: "markers" as const,
                marker: {
                  size: 14,
                  color: INSIGHT_MARKER_COLORS[activeInsight!],
                  line: { color: "#1a1714", width: 1.5 },
                },
                hovertemplate: "%{x}<br>Index: %{y:.1f}<br>100 = Feb 2020 baseline<extra></extra>",
                showlegend: false,
              },
            ]
          : []),
      ];

      const lineLayout = plotlyBaseLayout({
        height: 280,
        margin: CHART_MARGIN,
        yaxis: {
          title: { text: "Job posting Index", font: { size: 11 } },
          range: [0, 200],
        },
        xaxis: { range: [x[0], x[x.length - 1]] },
        hovermode: "x unified",
        shapes: lineShapes,
        annotations: lineAnnotations,
        showlegend: false,
      });

      const barBandShapes = [
        ...(showCovidEra
          ? [
              {
                type: "rect" as const,
                x0: COVID_BAND.start,
                x1: COVID_BAND.end,
                y0: 0,
                y1: 12,
                fillcolor: "rgba(232, 160, 168, 0.18)",
                line: { width: 0 },
                layer: "below" as const,
              },
            ]
          : []),
        ...(showAiAcceleration
          ? [
              {
                type: "rect" as const,
                x0: aiBandX0,
                x1: lastMonth,
                y0: 0,
                y1: 12,
                fillcolor: CHART_COLORS.aiBand,
                line: { width: 0 },
                layer: "below" as const,
              },
            ]
          : []),
      ];

      const barTraces = [
        {
          x: barMonths,
          y: barMonths.map((m) => aiByMonth[m]?.OpenAI ?? 0),
          type: "bar" as const,
          name: "OpenAI",
          marker: { color: CHART_COLORS.openai },
          hovertemplate: "%{x}<br>OpenAI: %{y} releases<extra></extra>",
        },
        {
          x: barMonths,
          y: barMonths.map((m) => aiByMonth[m]?.Anthropic ?? 0),
          type: "bar" as const,
          name: "Anthropic",
          marker: { color: CHART_COLORS.anthropic },
          hovertemplate: "%{x}<br>Anthropic: %{y} releases<extra></extra>",
        },
      ];

      const barLayout = plotlyBaseLayout({
        height: 150,
        margin: CHART_MARGIN,
        barmode: "stack",
        yaxis: {
          title: { text: "No. of Model releases", font: { size: 11 } },
          range: [0, 12],
        },
        xaxis: { range: [x[0], x[x.length - 1]] },
        shapes: barBandShapes,
        showlegend: false,
      });

      return {
        lineData: lineTraces,
        lineLayout,
        barData: barTraces,
        barLayout,
        lineXRange: [x[0], x[x.length - 1]] as [string, string],
        lineYRange: [0, 200] as [number, number],
        barXRange: [x[0], x[x.length - 1]] as [string, string],
        barYRange: [0, 12] as [number, number],
      };
    }, [agg, ai, stats, showAiAcceleration, showCovidEra, lastMonth, aiBandX0, activeInsight]);

  return (
    <section id="national" className="national-viewport border-t border-border">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(260px,300px)_1fr]">
        <NationalSidebar
          activeInsight={activeInsight}
          onInsightSelect={onInsightSelect}
        />

        <div className="national-main">
          <div className="shrink-0 px-4 pb-2 pt-1 md:px-5 md:pt-2">
            <SectionTitle
              title="National Average of the US Job Posting Index"
              note="seasonally adjusted"
              compact
            />
          </div>

          <div className="flex flex-col">
            <div className="national-chart-zone flex-[4]">
              <div className="mb-1 flex flex-wrap items-center justify-end gap-3">
                <EraToggle label="COVID Era" checked={showCovidEra} onChange={setShowCovidEra} />
                <EraToggle
                  label="AI Acceleration"
                  checked={showAiAcceleration}
                  onChange={setShowAiAcceleration}
                />
              </div>
              <TimelinePlotChart
                data={lineData}
                layout={lineLayout}
                initialXRange={lineXRange}
                initialYRange={lineYRange}
              />
            </div>

            <div className="national-chart-zone flex-[2]">
              <TimelinePlotChart
                data={barData}
                layout={barLayout}
                initialXRange={barXRange}
                initialYRange={barYRange}
              />
            </div>

            <div className="national-sector-zone">
              <SectorBreakdownPanel id="sector-breakdown" compact />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
