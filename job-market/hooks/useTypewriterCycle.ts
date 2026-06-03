"use client";

import { useEffect, useState } from "react";

type Phase = "typing" | "deleting";

export function useTypewriterCycle(
  facts: string[],
  options?: {
    typeMs?: number;
    deleteMs?: number;
    pauseMs?: number;
  }
) {
  const typeMs = options?.typeMs ?? 42;
  const deleteMs = options?.deleteMs ?? 28;
  const pauseMs = options?.pauseMs ?? 2200;

  const [factIndex, setFactIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");
  const [cursorOn, setCursorOn] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!facts.length) return;
    if (reducedMotion) {
      setDisplayed(facts[0]);
      return;
    }

    const full = facts[factIndex % facts.length] ?? "";

    if (phase === "typing") {
      if (displayed.length < full.length) {
        const t = window.setTimeout(
          () => setDisplayed(full.slice(0, displayed.length + 1)),
          typeMs
        );
        return () => clearTimeout(t);
      }
      const t = window.setTimeout(() => setPhase("deleting"), pauseMs);
      return () => clearTimeout(t);
    }

    if (displayed.length > 0) {
      const t = window.setTimeout(
        () => setDisplayed(displayed.slice(0, -1)),
        deleteMs
      );
      return () => clearTimeout(t);
    }

    setFactIndex((i) => (i + 1) % facts.length);
    setPhase("typing");
  }, [facts, factIndex, displayed, phase, typeMs, deleteMs, pauseMs, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => setCursorOn((c) => !c), 530);
    return () => clearInterval(id);
  }, [reducedMotion]);

  return { displayed, cursorOn: reducedMotion || cursorOn };
}
