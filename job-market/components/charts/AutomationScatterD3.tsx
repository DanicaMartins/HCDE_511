"use client";

import { useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";
import { CHART_COLORS } from "@/lib/chart-theme";
import {
  AUTOMATION_MID,
  BUBBLE_TRANSITION_MS,
  bubbleBaseRadius,
  ENTRANCE_STAGGER_MS,
  JOB_BASELINE,
  type SectorNode,
  sectorIndexAtMonth,
  Y_DOMAIN,
} from "@/lib/automation-scatter-data";
import type { StoryMeta } from "@/lib/types";

const CHART_HEIGHT = 520;
const MARGIN = { top: 28, right: 24, bottom: 52, left: 56 };

const QUADRANTS = [
  {
    title: "Most exposed",
    subtitle: "High automation · jobs declining",
    xRatio: 0.25,
    y: 75,
  },
  {
    title: "Surprisingly resilient",
    subtitle: "High automation · jobs growing",
    xRatio: 0.75,
    y: 75,
  },
  {
    title: "Quietly struggling",
    subtitle: "Low automation · jobs declining",
    xRatio: 0.25,
    y: 25,
  },
  {
    title: "Safe ground",
    subtitle: "Low automation · jobs growing",
    xRatio: 0.75,
    y: 25,
  },
] as const;

export type BubbleVisual = {
  name: string;
  category: string;
  automation: number;
  color: string;
  radius: number;
  opacity: number;
  strokeWidth: number;
  emphasized: boolean;
};

type AutomationScatterD3Props = {
  width: number;
  xDomain: [number, number];
  nodes: SectorNode[];
  meta: StoryMeta;
  month: string;
  frameIndex: number;
  entranceKey: number;
  entranceComplete: boolean;
  visuals: BubbleVisual[];
  onEntranceComplete: () => void;
  onSectorClick: (sector: string) => void;
  onSectorHover: (sector: string, event: React.MouseEvent<SVGCircleElement>) => void;
  onSectorUnhover: () => void;
};

export function AutomationScatterD3({
  width,
  xDomain,
  nodes,
  meta,
  month,
  frameIndex,
  entranceKey,
  entranceComplete,
  visuals,
  onEntranceComplete,
  onSectorClick,
  onSectorHover,
  onSectorUnhover,
}: AutomationScatterD3Props) {
  const innerWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const innerHeight = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;
  const bubblesGroupRef = useRef<SVGGElement>(null);
  const onEntranceCompleteRef = useRef(onEntranceComplete);
  onEntranceCompleteRef.current = onEntranceComplete;

  const xScale = useMemo(
    () => d3.scaleLinear().domain(xDomain).range([0, innerWidth]),
    [xDomain, innerWidth]
  );

  const yScale = useMemo(
    () => d3.scaleLinear().domain(Y_DOMAIN).range([innerHeight, 0]),
    [innerHeight]
  );

  const xTicks = useMemo(() => xScale.ticks(7), [xScale]);
  const yTicks = useMemo(() => yScale.ticks(5), [yScale]);

  const visualByName = useMemo(() => {
    const map = new Map<string, BubbleVisual>();
    visuals.forEach((v) => map.set(v.name, v));
    return map;
  }, [visuals]);

  const nodeByName = useMemo(() => {
    const map = new Map<string, SectorNode>();
    nodes.forEach((n) => map.set(n.name, n));
    return map;
  }, [nodes]);

  useEffect(() => {
    if (!bubblesGroupRef.current) return;

    let cancelled = false;
    let completed = false;
    const finishEntrance = () => {
      if (cancelled || completed) return;
      completed = true;
      onEntranceCompleteRef.current();
    };

    const circles = d3
      .select(bubblesGroupRef.current)
      .selectAll<SVGCircleElement, unknown>("circle");

    circles.interrupt();
    circles
      .attr("cx", xScale(JOB_BASELINE))
      .attr("cy", function () {
        const name = this.getAttribute("data-sector");
        return yScale(nodeByName.get(name ?? "")?.automation ?? 50);
      })
      .attr("r", 0);

    const count = circles.size();
    let ended = 0;

    circles
      .transition("entrance")
      .delay((_, i) => i * ENTRANCE_STAGGER_MS)
      .duration(400)
      .ease(d3.easeCubicOut)
      .attr("r", function () {
        const name = this.getAttribute("data-sector");
        const node = nodeByName.get(name ?? "");
        return node ? bubbleBaseRadius(node.matchedCount) : 5.5;
      })
      .on("end", function () {
        if (cancelled) return;
        ended += 1;
        if (ended >= count) finishEntrance();
      });

    const totalMs = Math.max(0, (nodes.length - 1) * ENTRANCE_STAGGER_MS + 400);
    const timer = window.setTimeout(finishEntrance, totalMs);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      circles.interrupt();
    };
  }, [nodeByName, nodes.length, xScale, yScale, entranceKey]);

  useEffect(() => {
    if (!bubblesGroupRef.current || !entranceComplete) return;

    d3.select(bubblesGroupRef.current)
      .selectAll<SVGCircleElement, unknown>("circle")
      .transition("month")
      .duration(BUBBLE_TRANSITION_MS)
      .ease(d3.easeLinear)
      .attr("cx", function () {
        const name = this.getAttribute("data-sector");
        const node = nodeByName.get(name ?? "");
        if (!node) return xScale(JOB_BASELINE);
        return xScale(sectorIndexAtMonth(node, month));
      });
  }, [entranceComplete, month, frameIndex, nodeByName, xScale]);

  useEffect(() => {
    if (!bubblesGroupRef.current) return;
    const selection = d3.select(bubblesGroupRef.current).selectAll<SVGCircleElement, unknown>("circle");
    selection
      .attr("cy", function () {
        const name = this.getAttribute("data-sector");
        return yScale(nodeByName.get(name ?? "")?.automation ?? 50);
      })
      .attr("fill", function () {
        const name = this.getAttribute("data-sector");
        return visualByName.get(name ?? "")?.color ?? "#888";
      })
      .attr("fill-opacity", function () {
        const name = this.getAttribute("data-sector");
        return visualByName.get(name ?? "")?.opacity ?? 0.82;
      })
      .attr("stroke", function () {
        const name = this.getAttribute("data-sector");
        return visualByName.get(name ?? "")?.emphasized ? "#1a1714" : "rgba(255,255,255,0.9)";
      })
      .attr("stroke-width", function () {
        const name = this.getAttribute("data-sector");
        return visualByName.get(name ?? "")?.strokeWidth ?? 1;
      });

    if (entranceComplete) {
      selection.attr("r", function () {
        const name = this.getAttribute("data-sector");
        return visualByName.get(name ?? "")?.radius ?? 5.5;
      });
    }
  }, [entranceComplete, nodeByName, visualByName, yScale]);

  const yearLabel = month.slice(0, 4);

  return (
    <svg
      width={width}
      height={CHART_HEIGHT}
      className="block max-w-full select-none"
      aria-label="Automation exposure scatter chart"
    >
      <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
        <text
          x={innerWidth / 2}
          y={innerHeight / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#1a1714"
          fontSize={280}
          fontWeight={600}
          opacity={0.06}
          pointerEvents="none"
          aria-hidden
        >
          {yearLabel}
        </text>

        {yTicks.map((tick) => (
          <line
            key={`yg-${tick}`}
            x1={0}
            x2={innerWidth}
            y1={yScale(tick)}
            y2={yScale(tick)}
            stroke="rgba(232, 228, 220, 0.65)"
            strokeWidth={1}
          />
        ))}
        {xTicks.map((tick) => (
          <line
            key={`xg-${tick}`}
            x1={xScale(tick)}
            x2={xScale(tick)}
            y1={0}
            y2={innerHeight}
            stroke="rgba(232, 228, 220, 0.65)"
            strokeWidth={1}
          />
        ))}

        <line
          x1={xScale(JOB_BASELINE)}
          x2={xScale(JOB_BASELINE)}
          y1={0}
          y2={innerHeight}
          stroke={CHART_COLORS.baseline}
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
        <line
          x1={0}
          x2={innerWidth}
          y1={yScale(AUTOMATION_MID)}
          y2={yScale(AUTOMATION_MID)}
          stroke={CHART_COLORS.baseline}
          strokeWidth={1}
          strokeDasharray="4 4"
        />

        {QUADRANTS.map((q) => (
          <g key={q.title} pointerEvents="none">
            <rect
              x={q.xRatio * innerWidth - 88}
              y={yScale(q.y) - 22}
              width={176}
              height={44}
              rx={4}
              fill="rgba(255,255,255,0.72)"
              stroke="#E8E4DC"
              strokeWidth={1}
            />
            <text
              x={q.xRatio * innerWidth}
              y={yScale(q.y) - 6}
              textAnchor="middle"
              fill="#1a1714"
              fontSize={12}
              fontWeight={600}
            >
              {q.title}
            </text>
            <text
              x={q.xRatio * innerWidth}
              y={yScale(q.y) + 8}
              textAnchor="middle"
              fill="#6b6560"
              fontSize={10}
            >
              {q.subtitle}
            </text>
          </g>
        ))}

        <g ref={bubblesGroupRef}>
          {nodes.map((node) => (
            <circle
              key={node.name}
              className="bubble cursor-pointer"
              data-sector={node.name}
              onMouseEnter={(event) => onSectorHover(node.name, event)}
              onMouseLeave={onSectorUnhover}
              onClick={() => onSectorClick(node.name)}
            />
          ))}
        </g>
      </g>

      <text
        x={MARGIN.left + innerWidth / 2}
        y={CHART_HEIGHT - 12}
        textAnchor="middle"
        fill="#6b6560"
        fontSize={12}
      >
        Job posting index (year-end)
      </text>
      <text
        x={xScale(JOB_BASELINE) + MARGIN.left}
        y={CHART_HEIGHT - 28}
        textAnchor="middle"
        fill="#6b6560"
        fontSize={10}
      >
        Feb 2020 baseline
      </text>

      <text
        transform={`translate(16, ${MARGIN.top + innerHeight / 2}) rotate(-90)`}
        textAnchor="middle"
        fill="#6b6560"
        fontSize={12}
      >
        Automation exposure score
      </text>

      {xTicks.map((tick) => (
        <text
          key={`xt-${tick}`}
          x={MARGIN.left + xScale(tick)}
          y={CHART_HEIGHT - MARGIN.bottom + 18}
          textAnchor="middle"
          fill="#6b6560"
          fontSize={11}
        >
          {tick}
        </text>
      ))}
      {yTicks.map((tick) => (
        <text
          key={`yt-${tick}`}
          x={MARGIN.left - 10}
          y={MARGIN.top + yScale(tick)}
          textAnchor="end"
          dominantBaseline="middle"
          fill="#6b6560"
          fontSize={11}
        >
          {tick}
        </text>
      ))}
    </svg>
  );
}

export { CHART_HEIGHT as AUTOMATION_CHART_HEIGHT };
