"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealTrigger = "scroll" | "mount";
type RevealVariant = "fade-up" | "fade-in";

type RevealSectionProps = {
  children: ReactNode;
  trigger?: RevealTrigger;
  variant?: RevealVariant;
  delay?: number;
  className?: string;
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

export function RevealSection({
  children,
  trigger = "scroll",
  variant = "fade-up",
  delay,
  className,
}: RevealSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(trigger === "mount");
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (trigger !== "scroll" || reducedMotion) {
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => setVisible(true));
          });
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [trigger, reducedMotion]);

  if (trigger === "mount") {
    const mountClass =
      variant === "fade-in" ? "animate-fade-in" : "animate-fade-up";
    return (
      <div
        className={cn(reducedMotion ? undefined : mountClass, className)}
        style={delay != null && !reducedMotion ? { animationDelay: `${delay}ms` } : undefined}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        reducedMotion ? undefined : visible ? "reveal-visible" : "reveal-pending",
        className,
      )}
      style={delay != null && visible && !reducedMotion ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
