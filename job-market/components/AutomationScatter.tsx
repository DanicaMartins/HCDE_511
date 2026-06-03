"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AutomationScatterD3, type BubbleVisual } from "./charts/AutomationScatterD3";
import { AutomationChartFrame } from "./charts/AutomationChartFrame";
import { clampHoverCardPosition, PlotHoverCard } from "./charts/PlotHoverCard";
import { ChartContainer, NarrativeIntro, SectionTitle } from "./ui";
import { useStory } from "@/lib/story-context";
import {
  automationExposureLabel,
  quadrantLabel,
} from "@/lib/category-insights";
import {
  buildPlaybackFrames,
  bubbleBaseRadius,
  buildSectorNodes,
  getFixedXDomain,
  getMostExposedSectors,
  PLAYBACK_INTERVAL_MS,
  sectorIndexAtMonth,
} from "@/lib/automation-scatter-data";
import { getCategoryChartColor } from "@/lib/sector-colors";
import { cn, formatMonth, pctVsBaseline } from "@/lib/utils";

const CATEGORIES = ["Knowledge Work", "Care & Service", "Tech & Engineering"] as const;

const CAT_TAB_ACTIVE: Record<string, string> = {
  "Knowledge Work": "bg-knowledge-bg text-knowledge border-knowledge-border",
  "Care & Service": "bg-care-bg text-care border-care-border",
  "Tech & Engineering": "bg-tech-bg text-tech border-tech-border",
};

type HoveredPoint = {
  sector: string;
  category: string;
  month: string;
  index: number;
  automation: number;
  x: number;
  y: number;
  transform: string;
};

export function AutomationScatter() {
  const { data, selectedSector, setSelectedSector, setSelectedCategory } = useStory();
  const meta = data.story_meta;
  const containerRef = useRef<HTMLDivElement>(null);
  const chartAreaRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(720);
  const [hovered, setHovered] = useState<HoveredPoint | null>(null);
  const [highlightCategory, setHighlightCategory] = useState<string | null>(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [entranceComplete, setEntranceComplete] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [entranceKey, setEntranceKey] = useState(0);
  const hoverPausedRef = useRef(false);
  const wasPlayingRef = useRef(false);

  const frames = useMemo(() => buildPlaybackFrames(), []);
  const currentFrame = frames[frameIndex] ?? frames[frames.length - 1];
  const currentMonth = currentFrame.monthKey;

  const nodes = useMemo(
    () => buildSectorNodes(data.sectors, data.crosswalk, meta),
    [data.crosswalk, data.sectors, meta]
  );

  const xDomain = useMemo(() => getFixedXDomain(data.sectors), [data.sectors]);

  const worthWatching = useMemo(
    () => getMostExposedSectors(nodes, currentMonth),
    [currentMonth, nodes]
  );

  const visuals = useMemo((): BubbleVisual[] => {
    return nodes.map((node) => {
      const selected = node.name === selectedSector;
      const isHovered = hovered?.sector === node.name;
      const inHighlightedCategory =
        highlightCategory !== null && node.category === highlightCategory;
      const emphasized =
        selected || isHovered || (highlightCategory !== null && inHighlightedCategory);

      const baseRadius = bubbleBaseRadius(node.matchedCount);
      return {
        name: node.name,
        category: node.category,
        automation: node.automation,
        color: getCategoryChartColor(node.category, meta),
        radius: emphasized ? baseRadius * 1.12 : baseRadius,
        opacity:
          selected || isHovered
            ? 1
            : highlightCategory === null
              ? 0.82
              : inHighlightedCategory
                ? 0.95
                : 0.28,
        strokeWidth: selected || isHovered ? 2.5 : inHighlightedCategory ? 1.5 : 1,
        emphasized: selected || isHovered,
      };
    });
  }, [highlightCategory, hovered?.sector, meta, nodes, selectedSector]);

  useEffect(() => {
    const el = chartAreaRef.current;
    if (!el) return;
    const update = () => setChartWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = chartAreaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFrameIndex(0);
          setEntranceComplete(false);
          setIsPlaying(false);
          hoverPausedRef.current = false;
          setEntranceKey((k) => k + 1);
          setIsInView(true);
        } else {
          setIsInView(false);
          setIsPlaying(false);
        }
      },
      { threshold: 0.25, rootMargin: "0px 0px -5% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;
    const fallback = window.setTimeout(() => {
      setEntranceComplete((done) => {
        if (!done) {
          setIsPlaying(true);
          return true;
        }
        return done;
      });
    }, 1500);
    return () => window.clearTimeout(fallback);
  }, [isInView, entranceKey]);

  useEffect(() => {
    if (!isInView || !entranceComplete || !isPlaying || hoverPausedRef.current) return;
    const timer = window.setInterval(() => {
      setFrameIndex((prev) => {
        if (prev >= frames.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, PLAYBACK_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [isInView, entranceComplete, isPlaying, frames.length]);

  const handleEntranceComplete = useCallback(() => {
    setEntranceComplete(true);
    setIsPlaying(true);
  }, []);

  const handleSectorHover = useCallback(
    (sector: string, event: React.MouseEvent<SVGCircleElement>) => {
      const container = containerRef.current;
      if (!container) return;

      if (!hoverPausedRef.current) {
        wasPlayingRef.current = isPlaying;
        hoverPausedRef.current = true;
        setIsPlaying(false);
      }

      const node = nodes.find((n) => n.name === sector);
      if (!node) return;

      const index = sectorIndexAtMonth(node, currentMonth);
      const rect = container.getBoundingClientRect();
      const { left, top, transform } = clampHoverCardPosition(
        event.clientX - rect.left,
        event.clientY - rect.top,
        rect.width,
        rect.height
      );

      setHovered({
        sector,
        category: node.category,
        month: currentMonth,
        index,
        automation: node.automation,
        x: left,
        y: top,
        transform,
      });
    },
    [currentMonth, isPlaying, nodes]
  );

  const handleSectorUnhover = useCallback(() => {
    setHovered(null);
    if (hoverPausedRef.current) {
      hoverPausedRef.current = false;
      if (wasPlayingRef.current) setIsPlaying(true);
    }
  }, []);

  const handleScrub = (value: number) => {
    setFrameIndex(value);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (frameIndex >= frames.length - 1) {
      setFrameIndex(0);
    }
    setIsPlaying((prev) => !prev);
  };

  const hoverCard = hovered ? (
    <PlotHoverCard
      title={hovered.sector}
      subtitle={hovered.category}
      rows={[
        { label: "Year", value: hovered.month.slice(0, 4) },
        { label: "Snapshot", value: formatMonth(hovered.month) },
        {
          label: "Posting index",
          value: hovered.index.toFixed(1),
          tone: hovered.index >= 100 ? "up" : "down",
        },
        {
          label: "Automation",
          value: `${hovered.automation} / 100`,
          tone: hovered.automation >= 50 ? "down" : "neutral",
        },
        {
          label: "Quadrant",
          value: quadrantLabel(hovered.index, hovered.automation),
        },
      ]}
      footnote={`${pctVsBaseline(hovered.index)} · ${automationExposureLabel(hovered.automation)}`}
      style={{
        left: hovered.x,
        top: hovered.y,
        transform: hovered.transform,
      }}
    />
  ) : null;

  return (
    <section id="automation" className="section-shell">
      <SectionTitle number="5" title="High Automation Doesn't Mean Fewer Jobs — Yet" />
      <NarrativeIntro>
        Each bubble is a sector, sized by occupation breadth. Position uses year-end job
        posting index (horizontal) and a fixed automation exposure score (vertical). The matrix
        divides at the Feb 2020 baseline (100) and the midpoint of the automation scale (50) —
        patterns worth watching, not proof that AI caused change.
      </NarrativeIntro>
      <ChartContainer className="overflow-visible">
        <div className="mb-4 flex flex-wrap gap-3" role="tablist" aria-label="Sector categories">
          {CATEGORIES.map((cat) => {
            const active = cat === highlightCategory;
            const color = getCategoryChartColor(cat, meta);
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  if (highlightCategory === cat) {
                    setHighlightCategory(null);
                  } else {
                    setHighlightCategory(cat);
                    setSelectedCategory(cat);
                  }
                }}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition-colors",
                  active
                    ? CAT_TAB_ACTIVE[cat]
                    : "border-border-subtle bg-surface text-secondary hover:border-border"
                )}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {cat}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="rounded-xl border border-border-subtle bg-surface p-4 lg:order-first">
            <h3 className="font-serif text-lg font-normal text-foreground">Worth watching</h3>
            <p className="mt-1 text-xs text-muted">
              Sectors in the top-left quadrant this year — high automation, below baseline.
            </p>
            <ul className="mt-3 max-h-[420px] space-y-2 overflow-y-auto">
              {worthWatching.length === 0 ? (
                <li className="text-sm text-muted">None this year.</li>
              ) : (
                worthWatching.map((node) => {
                  const index = sectorIndexAtMonth(node, currentMonth);
                  const color = getCategoryChartColor(node.category, meta);
                  return (
                    <li key={node.name}>
                      <button
                        type="button"
                        onClick={() => setSelectedSector(node.name, { scroll: false })}
                        className={cn(
                          "flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-surface-muted",
                          selectedSector === node.name && "bg-pale-lavender/30"
                        )}
                      >
                        <span
                          className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: color }}
                          aria-hidden
                        />
                        <span>
                          <span className="block font-medium text-foreground">{node.name}</span>
                          <span className="text-xs text-muted">
                            Index {index.toFixed(1)} · Auto {node.automation}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </aside>

          <AutomationChartFrame containerRef={containerRef}>
            <div ref={chartAreaRef}>
              <AutomationScatterD3
                width={chartWidth}
                xDomain={xDomain}
                nodes={nodes}
                meta={meta}
                month={currentMonth}
                frameIndex={frameIndex}
                entranceKey={entranceKey}
                entranceComplete={entranceComplete}
                visuals={visuals}
                onEntranceComplete={handleEntranceComplete}
                onSectorClick={(sector) => setSelectedSector(sector, { scroll: false })}
                onSectorHover={handleSectorHover}
                onSectorUnhover={handleSectorUnhover}
              />
            </div>
            {hoverCard}

            <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border-subtle pt-3">
              <button
                type="button"
                onClick={togglePlay}
                className="inline-flex h-9 min-w-[72px] items-center justify-center rounded-md border border-border bg-surface px-3 text-sm font-medium text-foreground hover:bg-surface-muted"
                aria-label={isPlaying ? "Pause animation" : "Play animation"}
              >
                {isPlaying ? "Pause" : "Play"}
              </button>
              <span className="min-w-[48px] text-sm tabular-nums text-secondary">
                {currentFrame.year}
              </span>
              <input
                type="range"
                min={0}
                max={frames.length - 1}
                value={frameIndex}
                onChange={(e) => handleScrub(Number(e.target.value))}
                className="h-1.5 min-w-[140px] flex-1 cursor-pointer accent-charcoal"
                aria-label="Scrub through years"
              />
              <span className="text-xs text-muted">Bubble size = occupation breadth</span>
            </div>
          </AutomationChartFrame>
        </div>
      </ChartContainer>
    </section>
  );
}
