"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CompareTrendPanel } from "./CompareTrendPanel";
import { TimelinePlotChart } from "./charts/TimelinePlotChart";
import {
  CompareLegend,
  DrawdownCard,
  EraToggle,
  MetricCard,
} from "./ui";
import { useStory } from "@/lib/story-context";
import { alignSeriesForCompare, indexYMax } from "@/lib/chart-data";
import {
  CHART_COLORS,
  aiAccelerationBand,
  baselineShape,
  covidEraBand,
  plotlyAnnotationStyle,
  plotlyBaseLayout,
} from "@/lib/chart-theme";
import { getCompareLineStyle, getSectorChartColor } from "@/lib/sector-colors";
import { cn } from "@/lib/utils";
import type { MonthPoint } from "@/lib/types";

const COVID_BAND = { start: "2020-02", end: "2020-08" };
const AI_BAND_START = "2024-01";
const CHART_MARGIN = { l: 52, r: 16, t: 56, b: 44 };

function sectorCovidTrough(series: MonthPoint[]) {
  const covid = series.filter(
    (r) => r.month >= "2020-03" && r.month <= "2020-07"
  );
  if (!covid.length) return null;
  return covid.reduce((a, b) => (b.index < a.index ? b : a), covid[0]);
}

function formatTitles(raw: string) {
  if (!raw) return "—";
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
    .join(", ");
}

export function SectorDetailSection() {
  const {
    data,
    selectedSector,
    comparisonSectors,
    selectedCategory,
    setSelectedCategory,
    setSelectedSector,
    toggleComparisonSector,
    clearComparisonSectors,
    sectorDetailRef,
  } = useStory();
  const [showCovidEra, setShowCovidEra] = useState(false);
  const [showAiAcceleration, setShowAiAcceleration] = useState(false);
  const selectedBtnRef = useRef<HTMLButtonElement>(null);
  const railListRef = useRef<HTMLUListElement>(null);
  const skipRailScrollRef = useRef(true);

  const meta = data.story_meta;
  const st = meta.sectorStats[selectedSector];
  const primaryColor = getSectorChartColor(selectedSector, meta);

  const sidebarSectors = useMemo(() => {
    const list = meta.categories[selectedCategory] ?? [];
    return [...list].sort();
  }, [meta.categories, selectedCategory]);

  useEffect(() => {
    if (skipRailScrollRef.current) {
      skipRailScrollRef.current = false;
      return;
    }

    const btn = selectedBtnRef.current;
    const list = railListRef.current;
    if (!btn || !list) return;

    const btnTop = btn.offsetTop;
    const btnBottom = btnTop + btn.offsetHeight;
    const listTop = list.scrollTop;
    const listBottom = listTop + list.clientHeight;

    if (btnTop < listTop) {
      list.scrollTo({ top: btnTop, behavior: "smooth" });
    } else if (btnBottom > listBottom) {
      list.scrollTo({ top: btnBottom - list.clientHeight, behavior: "smooth" });
    }
  }, [selectedSector, selectedCategory]);

  const chart = useMemo(() => {
    const primary = data.sectors[selectedSector] ?? [];
    if (!primary.length) {
      return {
        traces: [],
        layout: plotlyBaseLayout({ height: 300 }),
        xRange: undefined,
        yRange: undefined,
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const traces: any[] = [
      {
        x: primary.map((d) => d.month),
        y: primary.map((d) => d.index),
        type: "scatter",
        mode: "lines",
        line: { color: primaryColor, width: 2.5 },
        name: selectedSector,
        hovertemplate:
          "%{fullData.name}<br>%{x}<br>Index: %{y:.1f}<br>100 = Feb 2020 baseline<extra></extra>",
      },
    ];

    comparisonSectors.forEach((sector, i) => {
      const compare = data.sectors[sector] ?? [];
      const aligned = alignSeriesForCompare(primary, compare);
      const style = getCompareLineStyle(i);
      traces.push({
        x: aligned.months,
        y: aligned.compareY,
        type: "scatter",
        mode: "lines",
        connectgaps: false,
        line: {
          color: getSectorChartColor(sector, meta),
          width: style.width,
          dash: style.dash,
        },
        name: sector,
        hovertemplate: "%{fullData.name}<br>%{x}<br>Index: %{y:.1f}<extra></extra>",
      });
    });

    const allY = [
      ...primary.map((d) => d.index),
      ...comparisonSectors.flatMap(
        (sector) => (data.sectors[sector] ?? []).map((d) => d.index)
      ),
    ];
    const yMax = indexYMax(allY, 200, 1.15);
    const x0 = primary[0]?.month ?? "2020-02";
    const x1 = primary[primary.length - 1]?.month ?? "2026-04";

    const covidTrough = sectorCovidTrough(primary);
    const shapes = [
      ...(showCovidEra ? [covidEraBand(COVID_BAND.start, COVID_BAND.end, yMax)] : []),
      baselineShape(x0, x1),
      ...(showAiAcceleration ? [aiAccelerationBand(AI_BAND_START, x1, yMax)] : []),
    ];

    const annotations = st
      ? [
          ...(showCovidEra
            ? [
                plotlyAnnotationStyle({
                  x: COVID_BAND.start,
                  y: yMax * 0.85,
                  text: "COVID Era",
                  showarrow: false,
                  font: { size: 11, color: "#B85040" },
                  bgcolor: "rgba(245, 235, 232, 0.9)",
                  bordercolor: "#E8A0A8",
                }),
              ]
            : []),
          plotlyAnnotationStyle({
            x: st.peakMonth,
            y: st.peakIndex,
            text: `Peak ~${Math.round(st.peakIndex)}`,
            showarrow: true,
            ay: -36,
            bgcolor: "#F5EBE8",
            bordercolor: "#E8A0A8",
          }),
          ...(showAiAcceleration
            ? [
                plotlyAnnotationStyle({
                  x: AI_BAND_START,
                  y: yMax * 0.78,
                  text: "AI Acceleration",
                  showarrow: false,
                  font: { size: 11, color: CHART_COLORS.aiLabel },
                }),
              ]
            : []),
          plotlyAnnotationStyle({
            x: st.currentMonth,
            y: st.currentIndex,
            text: `Current ~${Math.round(st.currentIndex)}`,
            showarrow: true,
            ax: 36,
            ay: 22,
            bgcolor: "#F5EBE8",
            bordercolor: "#E8A0A8",
          }),
        ]
      : [];

    if (covidTrough && st && showCovidEra) {
      annotations.push(
        plotlyAnnotationStyle({
          x: covidTrough.month,
          y: covidTrough.index,
          text: `COVID low ~${Math.round(covidTrough.index)}`,
          showarrow: true,
          ax: 28,
          ay: -28,
          font: { size: 10, color: "#B85040" },
          bgcolor: "rgba(245, 235, 232, 0.9)",
          bordercolor: "#E8A0A8",
        })
      );
    }

    return {
      traces,
      layout: plotlyBaseLayout({
        height: 300,
        margin: CHART_MARGIN,
        yaxis: {
          range: [0, yMax],
          title: { text: "Job posting index", font: { size: 11 } },
        },
        xaxis: { range: [x0, x1] },
        shapes,
        annotations,
        showlegend: comparisonSectors.length >= 2,
        legend: {
          orientation: "h",
          y: 1.12,
          x: 0,
          font: { size: 10 },
        },
      }),
      xRange: [x0, x1] as [string, string],
      yRange: [0, yMax] as [number, number],
    };
  }, [
    data,
    selectedSector,
    comparisonSectors,
    st,
    primaryColor,
    meta,
    showCovidEra,
    showAiAcceleration,
  ]);

  if (!st) return null;

  const baselineLabel = st.belowBaseline
    ? "Below Feb 2020 baseline"
    : "Above Feb 2020 baseline";

  const singleCompare = comparisonSectors.length === 1 ? comparisonSectors[0] : null;
  const compareCategoryLabel = singleCompare
    ? meta.sectorToCategory[singleCompare]
    : null;
  const compareColor = singleCompare
    ? getSectorChartColor(singleCompare, meta)
    : CHART_COLORS.compare;

  const compareLegendItems =
    comparisonSectors.length > 1
      ? comparisonSectors.map((sector, i) => ({
          label: sector,
          color: getSectorChartColor(sector, meta),
          dash: getCompareLineStyle(i).dash,
        }))
      : undefined;

  return (
    <section
      id="sector-detail"
      ref={sectorDetailRef}
      className="sector-detail-viewport flex flex-col border-t border-border"
    >
      <h2 className="shrink-0 px-4 pb-2 pt-4 font-serif text-section-title font-normal text-foreground md:px-5">
        Sector Detail: {selectedSector}
      </h2>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(220px,260px)_1fr]">
        <aside className="sector-detail-rail">
          <div className="shrink-0 border-b border-border px-3 py-2">
            <label className="sr-only" htmlFor="sector-category">
              Category
            </label>
            <select
              id="sector-category"
              className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-sm text-foreground focus:border-lavender focus:outline-none focus:ring-2 focus:ring-lavender/20"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {Object.keys(meta.categories).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <ul ref={railListRef} className="sector-detail-rail-list mt-0.5 space-y-0">
            {sidebarSectors.map((name) => {
              const isCompare = comparisonSectors.includes(name);
              const isSelected = name === selectedSector;
              return (
                <li key={name}>
                  <button
                    ref={isSelected ? selectedBtnRef : undefined}
                    type="button"
                    onClick={() => setSelectedSector(name)}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors",
                      isSelected
                        ? "bg-charcoal font-medium text-surface"
                        : "text-foreground hover:bg-surface-muted",
                      !isSelected && "rounded-md",
                      isCompare && !isSelected && "ring-1 ring-lavender/50"
                    )}
                  >
                    {isCompare && !isSelected && (
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-lavender"
                        aria-hidden
                      />
                    )}
                    <span className="truncate">{name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="sector-detail-body">
          <div className="sector-detail-chart-row">
            <div className="sector-detail-chart-cell">
              <div className="mb-1 flex flex-wrap items-center justify-end gap-3">
                <EraToggle label="COVID Era" checked={showCovidEra} onChange={setShowCovidEra} />
                <EraToggle
                  label="AI Acceleration"
                  checked={showAiAcceleration}
                  onChange={setShowAiAcceleration}
                />
              </div>
              <TimelinePlotChart
                data={chart.traces}
                layout={chart.layout}
                initialXRange={chart.xRange}
                initialYRange={chart.yRange}
              />
              <CompareLegend
                primaryLabel={`Solid = ${selectedSector}`}
                compareLabel={
                  singleCompare
                    ? `Dotted = ${singleCompare}${compareCategoryLabel ? ` (${compareCategoryLabel})` : ""}`
                    : comparisonSectors.length === 0
                      ? "Dotted = pick sectors to compare"
                      : undefined
                }
                primaryColor={primaryColor}
                compareColor={compareColor}
                compareItems={compareLegendItems}
              />
            </div>

            <div className="flex min-h-0 flex-col gap-2 overflow-y-auto border-l border-border px-3 py-2">
              <MetricCard
                compact
                label={baselineLabel}
                value={`${st.currentIndex.toFixed(0)} vs 100`}
              />
              <MetricCard
                compact
                label="Volatility since 2022"
                value={`Std. dev. ${st.volatilitySince2022}`}
              />
              <MetricCard
                compact
                label="Jobs commonly associated"
                value={formatTitles(st.titles)}
              />
              <DrawdownCard value={st.drawdown} compact />
            </div>
          </div>

          <div className="sector-detail-compare-zone">
            <CompareTrendPanel
              selectedSector={selectedSector}
              comparisonSectors={comparisonSectors}
              toggleComparisonSector={toggleComparisonSector}
              clearComparisonSectors={clearComparisonSectors}
              data={data}
              meta={meta}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
