"use client";

import { useMemo } from "react";
import { useTypewriterCycle } from "@/hooks/useTypewriterCycle";

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l1.4 4.6L18 8l-4.6 1.4L12 14l-1.4-4.6L6 8l4.6-1.4L12 2zm0 10l1 3.2L16 16l-3.2 1-1 3.2-1-3.2L8 16l3.2-1 1-3.2z" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 14a3 3 0 003-3V6a3 3 0 00-6 0v5a3 3 0 003 3z" />
      <path d="M6 11a6 6 0 0012 0M12 17v3" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M5 12h12M13 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const textClass =
  "font-sans text-base leading-snug text-foreground md:text-lg";

export function AIChatbox({ facts }: { facts: string[] }) {
  const { displayed, cursorOn } = useTypewriterCycle(facts);

  const reserveFact = useMemo(
    () =>
      facts.reduce(
        (longest, fact) => (fact.length > longest.length ? fact : longest),
        facts[0] ?? " ",
      ),
    [facts],
  );

  return (
    <div
      className="w-full max-w-[520px] shrink-0 rounded-2xl border border-border/60 bg-surface px-6 py-5 shadow-card"
      aria-hidden
    >
      <div className="grid">
        <p
          className={`invisible col-start-1 row-start-1 ${textClass}`}
          aria-hidden
        >
          {reserveFact}
        </p>
        <p
          className={`col-start-1 row-start-1 overflow-hidden ${textClass}`}
        >
          <span>{displayed}</span>
          <span
            className={`ml-0.5 inline-block w-[2px] font-light text-foreground ${cursorOn ? "opacity-100" : "opacity-0"}`}
          >
            |
          </span>
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between pointer-events-none select-none">
        <div className="flex items-center gap-3 text-muted">
          <span className="text-lg leading-none">+</span>
          <span className="flex items-center gap-1.5 text-sm font-medium text-accent-ai">
            <SparkleIcon />
            Quick Facts
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted/70">
          <span className="flex h-8 w-8 items-center justify-center">
            <DocIcon />
          </span>
          <span className="flex h-8 w-8 items-center justify-center">
            <MicIcon />
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8EEF5] text-soft-blue">
            <SendIcon />
          </span>
        </div>
      </div>
    </div>
  );
}
