"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { STORY_DATA } from "./data";
import type { StoryData } from "./types";

export const MAX_COMPARISON_SECTORS = 5;

type StoryContextValue = {
  data: StoryData;
  selectedSector: string;
  comparisonSectors: string[];
  selectedCategory: string;
  hoveredSector: string | null;
  sectorDetailRef: React.RefObject<HTMLElement>;
  setSelectedSector: (sector: string, options?: { scroll?: boolean }) => void;
  toggleComparisonSector: (sector: string) => boolean;
  clearComparisonSectors: () => void;
  setHoveredSector: (sector: string | null) => void;
  setSelectedCategory: (cat: string) => void;
};

const StoryContext = createContext<StoryContextValue | null>(null);

export function StoryProvider({ children }: { children: ReactNode }) {
  const meta = STORY_DATA.story_meta;
  const sectorDetailRef = useRef<HTMLElement>(null!);

  const initialSector = useMemo(() => {
    if (typeof window === "undefined") return meta.defaultSector;
    const p = new URLSearchParams(window.location.search).get("sector");
    if (p && STORY_DATA.sectors[p]) return p;
    return meta.defaultSector;
  }, [meta.defaultSector]);

  const [selectedSector, setSelectedSectorState] = useState(initialSector);
  const [comparisonSectors, setComparisonSectorsState] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(
    meta.sectorToCategory[initialSector] ?? meta.defaultCategory
  );
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);

  const setSelectedSector = useCallback(
    (sector: string, options?: { scroll?: boolean }) => {
      if (!STORY_DATA.sectors[sector]) return;
      const cat = meta.sectorToCategory[sector] ?? selectedCategory;
      setSelectedSectorState(sector);
      setSelectedCategory(cat);
      setComparisonSectorsState((prev) => prev.filter((s) => s !== sector));
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("sector", sector);
        window.history.replaceState({}, "", url.pathname + url.search);
      }
      if (options?.scroll) {
        requestAnimationFrame(() => {
          sectorDetailRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
      }
    },
    [meta.sectorToCategory, selectedCategory]
  );

  const toggleComparisonSector = useCallback(
    (sector: string): boolean => {
      if (!sector || sector === selectedSector || !STORY_DATA.sectors[sector]) {
        return false;
      }
      let added = false;
      setComparisonSectorsState((prev) => {
        if (prev.includes(sector)) {
          return prev.filter((s) => s !== sector);
        }
        if (prev.length >= MAX_COMPARISON_SECTORS) {
          return prev;
        }
        added = true;
        return [...prev, sector];
      });
      return added;
    },
    [selectedSector]
  );

  const clearComparisonSectors = useCallback(() => {
    setComparisonSectorsState([]);
  }, []);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("sector");
    if (p && STORY_DATA.sectors[p] && p !== selectedSector) {
      setSelectedSector(p, { scroll: false });
    }
  }, [selectedSector, setSelectedSector]);

  const value: StoryContextValue = {
    data: STORY_DATA,
    selectedSector,
    comparisonSectors,
    selectedCategory,
    hoveredSector,
    sectorDetailRef,
    setSelectedSector,
    toggleComparisonSector,
    clearComparisonSectors,
    setHoveredSector,
    setSelectedCategory,
  };

  return <StoryContext.Provider value={value}>{children}</StoryContext.Provider>;
}

export function useStory() {
  const ctx = useContext(StoryContext);
  if (!ctx) throw new Error("useStory must be used within StoryProvider");
  return ctx;
}
