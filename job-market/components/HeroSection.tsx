"use client";

import { useRef } from "react";
import { AIChatbox } from "./AIChatbox";
import { HeroCursorReveal } from "./CursorPixelReveal";
import { useStory } from "@/lib/story-context";
import { getHeroFacts } from "@/lib/hero-facts";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { data } = useStory();
  const facts = getHeroFacts(data);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative isolate -mx-6 flex min-h-[calc(100vh-var(--nav-height))] flex-col justify-center overflow-hidden pb-8 md:-mx-8"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <HeroCursorReveal sectionRef={sectionRef} />
      </div>

      <div className="relative z-10 px-6 md:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-10 lg:gap-16">
          <h1
            data-cursor-exclude
            className="font-serif font-normal leading-[1.05] text-foreground text-hero"
          >
            <span className="block">AI and the</span>
            <span className="block">Job Market</span>
          </h1>
          <div data-cursor-exclude className="shrink-0 sm:ml-4">
            <AIChatbox facts={facts} />
          </div>
        </div>
        <p
          data-cursor-exclude
          className="mt-6 max-w-2xl font-sans text-xl leading-snug text-foreground md:mt-8 md:text-2xl"
        >
          How did your sector change? A visual story of U.S. job posting demand from 2020 to 2026.
        </p>
      </div>
    </section>
  );
}
