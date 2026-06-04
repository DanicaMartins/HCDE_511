"use client";

import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { cn } from "@/lib/utils";

const OVERLAY_COLOR = "#ffffff";
const CELL_SIZE = 16;
const BRUSH_RADIUS = 5;
const FADE_MS = 2000;
const STAMP_MIN_MS = 12;
const MAX_REVEAL_FRACTION = 0.2;
const DEFAULT_EXCLUDE_SELECTOR = "[data-cursor-exclude]";
const DEFAULT_BACKGROUND = "/images/hero-background.png";

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

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  width: number,
  height: number,
) {
  const imgWidth =
    "naturalWidth" in image ? image.naturalWidth : (image as HTMLCanvasElement).width;
  const imgHeight =
    "naturalHeight" in image ? image.naturalHeight : (image as HTMLCanvasElement).height;
  if (!imgWidth || !imgHeight) return;

  const imgRatio = imgWidth / imgHeight;
  const canvasRatio = width / height;

  let sx = 0;
  let sy = 0;
  let sw = imgWidth;
  let sh = imgHeight;

  if (imgRatio > canvasRatio) {
    sw = imgHeight * canvasRatio;
    sx = (imgWidth - sw) / 2;
  } else {
    sh = imgWidth / canvasRatio;
    sy = (imgHeight - sh) / 2;
  }

  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, width, height);
}

type CursorPixelRevealProps = {
  className?: string;
  sectionRef: RefObject<HTMLElement | null>;
  backgroundSrc?: string;
  excludeSelector?: string;
};

export function CursorPixelReveal({
  className,
  sectionRef,
  backgroundSrc = DEFAULT_BACKGROUND,
  excludeSelector = DEFAULT_EXCLUDE_SELECTOR,
}: CursorPixelRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    let rafId = 0;
    let cancelled = false;
    let hasPainted = false;
    let bgReady = false;
    const pixels = new Map<string, PixelStamp>();
    let lastStampAt = 0;
    let size = { width: 0, height: 0, maxActiveCells: 0 };
    let ctx: CanvasRenderingContext2D | null = null;

    const bgImage = new Image();
    bgImage.decoding = "async";
    bgImage.src = backgroundSrc;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resizeCanvas = (width: number, height: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx = canvas.getContext("2d");
      const cellCount = Math.ceil(width / CELL_SIZE) * Math.ceil(height / CELL_SIZE);
      size = {
        width,
        height,
        maxActiveCells: Math.max(1, Math.floor(cellCount * MAX_REVEAL_FRACTION)),
      };
      pixels.clear();
    };

    const getExclusionRects = () =>
      Array.from(section.querySelectorAll(excludeSelector)).map((el) =>
        el.getBoundingClientRect(),
      );

    const draw = (now: number) => {
      if (!ctx || !bgReady || size.width <= 0 || size.height <= 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      drawImageCover(ctx, bgImage, size.width, size.height);
      ctx.fillStyle = OVERLAY_COLOR;
      ctx.fillRect(0, 0, size.width, size.height);

      if (!reducedMotion && ctx) {
        const context = ctx;
        Array.from(pixels.entries()).forEach(([key, pixel]) => {
          const age = now - pixel.t;
          if (age >= FADE_MS) {
            pixels.delete(key);
            return;
          }

          const strength = 1 - age / FADE_MS;
          context.save();
          context.beginPath();
          context.rect(pixel.px, pixel.py, pixel.pw, pixel.ph);
          context.clip();
          context.globalAlpha = strength;
          drawImageCover(context, bgImage, size.width, size.height);
          context.restore();
        });
      }

      if (!hasPainted) {
        hasPainted = true;
        setReady(true);
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
      if (reducedMotion || !bgReady || size.width <= 0) return;

      const now = performance.now();
      if (now - lastStampAt < STAMP_MIN_MS) return;
      lastStampAt = now;
      stampAtCursor(event.clientX, event.clientY, now);
    };

    const measure = () => {
      const rect = section.getBoundingClientRect();
      const width = rect.width || section.clientWidth;
      const height = rect.height || section.clientHeight;
      return { width, height };
    };

    const syncSize = () => {
      const { width, height } = measure();
      if (width <= 0 || height <= 0) return false;
      if (width !== size.width || height !== size.height) {
        resizeCanvas(width, height);
      }
      draw(performance.now());
      return true;
    };

    const startLoop = () => {
      if (!syncSize()) {
        rafId = window.requestAnimationFrame(startLoop);
        return;
      }
      rafId = window.requestAnimationFrame(tick);
    };

    const onBgLoad = () => {
      bgReady = true;
      startLoop();
    };

    const resizeObserver = new ResizeObserver(() => {
      syncSize();
    });

    resizeObserver.observe(section);
    section.addEventListener("pointermove", onPointerMove, { capture: true, passive: true });

    if (bgImage.complete && bgImage.naturalWidth > 0) {
      onBgLoad();
    } else {
      bgImage.onload = onBgLoad;
      bgImage.onerror = () => {
        bgReady = true;
        startLoop();
      };
    }

    return () => {
      cancelled = true;
      setReady(false);
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      section.removeEventListener("pointermove", onPointerMove, { capture: true });
      bgImage.onload = null;
      bgImage.onerror = null;
    };
  }, [backgroundSrc, excludeSelector, sectionRef]);

  return (
    <>
      {!ready && (
        <div
          className="pointer-events-none absolute inset-0 bg-white"
          style={{ zIndex: 1 }}
          aria-hidden
        />
      )}
      <canvas
        ref={canvasRef}
        className={cn("cursor-pixel-reveal pointer-events-none block h-full w-full", className)}
        style={{ position: "absolute", inset: 0, zIndex: 1 }}
        aria-hidden
      />
    </>
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
