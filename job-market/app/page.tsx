"use client";

import { useEffect } from "react";
import { StoryProvider } from "@/lib/story-context";
import { StoryNav } from "@/components/StoryNav";
import { HeroSection } from "@/components/HeroSection";
import { NationalSection } from "@/components/NationalSection";
import { SectorDetailSection } from "@/components/SectorDetailSection";
import { SectorHeatmap } from "@/components/SectorHeatmap";
import { AutomationScatter } from "@/components/AutomationScatter";
import { TakeawaysSection } from "@/components/TakeawaysSection";
import { MethodologySection } from "@/components/MethodologySection";
import { StoryDataGuard } from "@/components/StoryDataGuard";
import { RevealSection } from "@/components/ui";

export default function HomePage() {
  useEffect(() => {
    if (window.location.hash) return;
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  return (
    <StoryProvider>
      <StoryDataGuard />
      <div className="page-shell">
        <StoryNav />
        <HeroSection />
        <RevealSection>
          <NationalSection />
        </RevealSection>
        <RevealSection>
          <SectorDetailSection />
        </RevealSection>
        <RevealSection>
          <SectorHeatmap />
        </RevealSection>
        <RevealSection>
          <AutomationScatter />
        </RevealSection>
        <RevealSection>
          <TakeawaysSection />
        </RevealSection>
        <RevealSection>
          <MethodologySection />
        </RevealSection>
        <section id="datasets-used" className="sr-only" aria-hidden>
          Datasets used — link target placeholder
        </section>
        <footer className="mt-16 border-t border-border pt-10 text-xs text-muted">
          Data: Indeed Hiring Lab · O*NET · Epoch AI · Feb 2020 baseline.
        </footer>
      </div>
    </StoryProvider>
  );
}
