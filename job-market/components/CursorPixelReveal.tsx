"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import { cn } from "@/lib/utils";

const OVERLAY_COLOR = "#ffffff";
const CELL_SIZE = 16;
const BRUSH_RADIUS = 5;
const FADE_MS = 2000;
const STAMP_MIN_MS = 12;
const MAX_REVEAL_FRACTION = 0.2;
const DEFAULT_EXCLUDE_SELECTOR = "[data-cursor-exclude]";

type PixelStamp = { t: number; px: number; py: number; pw: number; ph: number };

function cellKey(col: number, row: number) {
  return `${col},${row}`;
}

function cellPixelRect(col: number, row: number) {
  const x = col * CELL_SIZE;
  const y = row * CELL_SIZE;
  const hash = Math.abs(col * 928371 + row * 689287);
  const inset = hash % 4;
  const size = Math.max(10, CELL_SIZE - inset - 2);
  const jitterX = (hash >> 3) % Math.max(1, CELL_SIZE - size);
  const jitterY = (hash >> 5) % Math.max(1, CELL_SIZE - size);
  return {
    px: x + inset + jitterX,
    py: y + inset + jitterY,
    pw: size,
    ph: size,
  };
}

function pointInRects(
  x: number,
  y: number,
  sectionRect: DOMRect,
  exclusionRects: DOMRect[],
  padding = 14,
) {
  const px = sectionRect.left + x;
  const py = sectionRect.top + y;
  return exclusionRects.some(
    (rect) =>
      px >= rect.left - padding &&
      px <= rect.right + padding &&
      py >= rect.top - padding &&
      py <= rect.bottom + padding,
  );
}

function stampBrush(
  pixels: Map<string, PixelStamp>,
  x: number,
  y: number,
  width: number,
  height: number,
  now: number,
  exclusionRects: DOMRect[],
  sectionRect: DOMRect,
  maxActiveCells: number,
) {
  const centerCol = Math.floor(x / CELL_SIZE);
  const centerRow = Math.floor(y / CELL_SIZE);
  const cols = Math.ceil(width / CELL_SIZE);
  const rows = Math.ceil(height / CELL_SIZE);

  for (let dr = -BRUSH_RADIUS; dr <= BRUSH_RADIUS; dr += 1) {
    for (let dc = -BRUSH_RADIUS; dc <= BRUSH_RADIUS; dc += 1) {
      if (dc * dc + dr * dr > BRUSH_RADIUS * BRUSH_RADIUS) continue;

      const col = centerCol + dc;
      const row = centerRow + dr;
      if (col < 0 || row < 0 || col >= cols || row >= rows) continue;

      const { px, py, pw, ph } = cellPixelRect(col, row);
      const cx = px + pw / 2;
      const cy = py + ph / 2;
      if (pointInRects(cx, cy, sectionRect, exclusionRects)) continue;

      const key = cellKey(col, row);
      if (!pixels.has(key) && pixels.size >= maxActiveCells) continue;

      pixels.set(key, { t: now, px, py, pw, ph });
    }
  }
}

type CursorPixelRevealProps = {
  className?: string;
  sectionRef: RefObject<HTMLElement | null>;
  excludeSelector?: string;
};

export function CursorPixelReveal({
  className,
  sectionRef,
  excludeSelector = DEFAULT_EXCLUDE_SELECTOR,
}: CursorPixelRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    let rafId = 0;
    let cancelled = false;
    const pixels = new Map<string, PixelStamp>();
    let lastStampAt = 0;
    let size = { width: 0, height: 0, cols: 0, rows: 0, maxActiveCells: 0 };

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resizeCanvas = (width: number, height: number) => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const cols = Math.ceil(width / CELL_SIZE);
      const rows = Math.ceil(height / CELL_SIZE);
      size = {
        width,
        height,
        cols,
        rows,
        maxActiveCells: Math.max(1, Math.floor(cols * rows * MAX_REVEAL_FRACTION)),
      };
      pixels.clear();
    };

    const getExclusionRects = () =>
      Array.from(section.querySelectorAll(excludeSelector)).map((el) =>
        el.getBoundingClientRect(),
      );

    const draw = (now: number) => {
      const ctx = canvas.getContext("2d");
      if (!ctx || size.width <= 0 || size.height <= 0) return;

      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size.width, size.height);

      if (reducedMotion) {
        ctx.fillStyle = OVERLAY_COLOR;
        ctx.fillRect(0, 0, size.width, size.height);
        return;
      }

      for (let row = 0; row < size.rows; row += 1) {
        for (let col = 0; col < size.cols; col += 1) {
          const key = cellKey(col, row);
          const stamp = pixels.get(key);
          let overlayAlpha = 1;

          if (stamp) {
            const age = now - stamp.t;
            if (age >= FADE_MS) {
              pixels.delete(key);
            } else {
              overlayAlpha = age / FADE_MS;
            }
          }

          if (overlayAlpha <= 0) continue;

          const { px, py, pw, ph } = cellPixelRect(col, row);
          ctx.fillStyle =
            overlayAlpha >= 1
              ? OVERLAY_COLOR
              : `rgba(255,255,255,${overlayAlpha})`;
          ctx.fillRect(px, py, pw, ph);
        }
      }
    };

    const tick = (now: number) => {
      if (cancelled) return;
      draw(now);
      rafId = window.requestAnimationFrame(tick);
    };

    const stampAtCursor = (clientX: number, clientY: number, now: number) => {
      if (reducedMotion) return;

      const sectionRect = section.getBoundingClientRect();
      const x = clientX - sectionRect.left;
      const y = clientY - sectionRect.top;
      if (x < 0 || y < 0 || x > sectionRect.width || y > sectionRect.height) return;

      stampBrush(
        pixels,
        x,
        y,
        size.width,
        size.height,
        now,
        getExclusionRects(),
        sectionRect,
        size.maxActiveCells,
      );
    };

    const onPointerMove = (event: PointerEvent) => {
      if (reducedMotion || size.width <= 0) return;

      const now = performance.now();
      if (now - lastStampAt < STAMP_MIN_MS) return;
      lastStampAt = now;
      stampAtCursor(event.clientX, event.clientY, now);
    };

    const syncSize = () => {
      const { width, height } = section.getBoundingClientRect();
      if (width <= 0 || height <= 0) return false;
      if (width !== size.width || height !== size.height) {
        resizeCanvas(width, height);
      }
      return true;
    };

    const setup = () => {
      if (!syncSize()) {
        rafId = window.requestAnimationFrame(setup);
        return;
      }
      rafId = window.requestAnimationFrame(tick);
    };

    const resizeObserver = new ResizeObserver(() => {
      syncSize();
    });

    resizeObserver.observe(section);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    setup();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [excludeSelector, sectionRef]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "cursor-pixel-reveal pointer-events-none absolute inset-0 z-[1] block h-full w-full",
        className,
      )}
      aria-hidden
    />
  );
}

export function HeroCursorReveal({
  sectionRef,
  className,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  className?: string;
}) {
  return <CursorPixelReveal sectionRef={sectionRef} className={className} />;
}
