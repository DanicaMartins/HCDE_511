"use client";

import { useRef } from "react";
import { CursorPixelReveal } from "./CursorPixelReveal";
import { InsightCard, SectionTitle } from "./ui";

export function TakeawaysSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const cards = [
    {
      title: "The U.S. market is close to its 2020 baseline.",
      body: "The national index returned near 100 after the 2021–2022 hiring boom — but that average hides sector-level swings.",
    },
    {
      title: "Some sectors boomed, then cooled sharply.",
      body: "Many sectors peaked in 2021–2022 and remain far below their own highs, even when the national total looks calm.",
    },
    {
      title: "AI adds context, not certainty.",
      body: "Model release timing and automation exposure help us see patterns worth watching — not proof of cause.",
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="takeaways"
      className="section-shell relative overflow-hidden"
    >
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/hero-background.png)" }}
        aria-hidden
      />
      <CursorPixelReveal sectionRef={sectionRef} />

      <div className="relative z-10">
        <div data-cursor-exclude>
          <SectionTitle title="What this tells us" />
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {cards.map((c) => (
            <InsightCard key={c.title} title={c.title} data-cursor-exclude>
              <p>{c.body}</p>
            </InsightCard>
          ))}
        </div>
      </div>
    </section>
  );
}
