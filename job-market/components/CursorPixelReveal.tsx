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
  containerRect: DOMRect,
  exclusionRects: DOMRect[],
  padding = 14,
) {
  const px = containerRect.left + x;
  const py = containerRect.top + y;
  return exclusionRects.some(
    (rect) =>
      px >= rect.left - padding &&
      px <= rect.right + padding &&
      py >= rect.top - padding &&
      py <= rect.bottom + padding,
  );
}

function evictOldestStamp(pixels: Map<string, PixelStamp>) {
  let oldestKey: string | null = null;
  let oldestTime = Infinity;
  pixels.forEach((stamp, key) => {
    if (stamp.t < oldestTime) {
      oldestTime = stamp.t;
      oldestKey = key;
    }
  });
  if (oldestKey) pixels.delete(oldestKey);
}

function stampBrush(
  pixels: Map<string, PixelStamp>,
  x: number,
  y: number,
  width: number,
  height: number,
  now: number,
  exclusionRects: DOMRect[],
  containerRect: DOMRect,
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
      if (pointInRects(cx, cy, containerRect, exclusionRects)) continue;

      const key = cellKey(col, row);
      if (!pixels.has(key) && pixels.size >= maxActiveCells) {
        evictOldestStamp(pixels);
      }

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

function isInsideRect(x: number, y: number, rect: DOMRect) {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
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
  const containerRef = useRef<HTMLDivElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    const bgCanvas = bgCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!section || !container || !bgCanvas || !overlayCanvas) return;

    let rafId = 0;
    let cancelled = false;
    let hasPainted = false;
    let bgReady = false;
    const pixels = new Map<string, PixelStamp>();
    let lastStampAt = 0;
    let size = { width: 0, height: 0, maxActiveCells: 0 };
    let bgCtx: CanvasRenderingContext2D | null = null;
    let overlayCtx: CanvasRenderingContext2D | null = null;

    const bgImage = new Image();
    bgImage.decoding = "async";
    bgImage.src = backgroundSrc;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resizeCanvases = (width: number, height: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      for (const canvas of [bgCanvas, overlayCanvas]) {
        canvas.width = Math.max(1, Math.floor(width * dpr));
        canvas.height = Math.max(1, Math.floor(height * dpr));
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }

      bgCtx = bgCanvas.getContext("2d");
      overlayCtx = overlayCanvas.getContext("2d", { alpha: true });

      const cellCount = Math.ceil(width / CELL_SIZE) * Math.ceil(height / CELL_SIZE);
      size = {
        width,
        height,
        maxActiveCells: Math.max(1, Math.floor(cellCount * MAX_REVEAL_FRACTION)),
      };
      pixels.clear();
    };

    const drawBackground = () => {
      if (!bgCtx || !bgReady || size.width <= 0 || size.height <= 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bgCtx.clearRect(0, 0, size.width, size.height);
      drawImageCover(bgCtx, bgImage, size.width, size.height);
    };

    const drawOverlay = (now: number) => {
      if (!overlayCtx || !bgReady || size.width <= 0 || size.height <= 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      overlayCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      overlayCtx.globalCompositeOperation = "source-over";
      overlayCtx.globalAlpha = 1;
      overlayCtx.fillStyle = OVERLAY_COLOR;
      overlayCtx.fillRect(0, 0, size.width, size.height);

      if (!reducedMotion) {
        overlayCtx.globalCompositeOperation = "destination-out";
        Array.from(pixels.entries()).forEach(([key, pixel]) => {
          const age = now - pixel.t;
          if (age >= FADE_MS) {
            pixels.delete(key);
            return;
          }

          const strength = 1 - age / FADE_MS;
          overlayCtx!.fillStyle = `rgba(0,0,0,${strength})`;
          overlayCtx!.fillRect(pixel.px, pixel.py, pixel.pw, pixel.ph);
        });
        overlayCtx.globalCompositeOperation = "source-over";
      }

      if (!hasPainted) {
        hasPainted = true;
        setReady(true);
      }
    };

    const draw = (now: number) => {
      drawBackground();
      drawOverlay(now);
    };

    const tick = (now: number) => {
      if (cancelled) return;
      drawOverlay(now);
      rafId = window.requestAnimationFrame(tick);
    };

    const getExclusionRects = () =>
      Array.from(section.querySelectorAll(excludeSelector)).map((el) =>
        el.getBoundingClientRect(),
      );

    const stampAtPointer = (clientX: number, clientY: number, now: number) => {
      if (reducedMotion || !bgReady || size.width <= 0) return;

      const containerRect = container.getBoundingClientRect();
      if (!isInsideRect(clientX, clientY, containerRect)) return;

      const x = clientX - containerRect.left;
      const y = clientY - containerRect.top;

      stampBrush(
        pixels,
        x,
        y,
        size.width,
        size.height,
        now,
        getExclusionRects(),
        containerRect,
        size.maxActiveCells,
      );
    };

    const onPointer = (event: PointerEvent) => {
      if (reducedMotion || !bgReady || size.width <= 0) return;

      const now = performance.now();
      if (event.type === "pointermove" && now - lastStampAt < STAMP_MIN_MS) return;
      lastStampAt = now;
      stampAtPointer(event.clientX, event.clientY, now);
    };

    const measure = () => {
      const rect = container.getBoundingClientRect();
      const width = rect.width || container.clientWidth;
      const height = rect.height || container.clientHeight;
      return { width, height };
    };

    const syncSize = () => {
      const { width, height } = measure();
      if (width <= 0 || height <= 0) return false;
      if (width !== size.width || height !== size.height) {
        resizeCanvases(width, height);
        drawBackground();
      }
      drawOverlay(performance.now());
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

    resizeObserver.observe(container);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });

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
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      bgImage.onload = null;
      bgImage.onerror = null;
    };
  }, [backgroundSrc, excludeSelector, sectionRef]);

  return (
    <div ref={containerRef} className={cn("absolute inset-0 z-0", className)} aria-hidden>
      {!ready && <div className="absolute inset-0 z-[2] bg-white" aria-hidden />}
      <canvas
        ref={bgCanvasRef}
        className="pointer-events-none absolute inset-0 block h-full w-full"
        style={{ zIndex: 0 }}
        aria-hidden
      />
      <canvas
        ref={overlayCanvasRef}
        className="cursor-pixel-reveal pointer-events-none absolute inset-0 block h-full w-full"
        style={{ zIndex: 1 }}
        aria-hidden
      />
    </div>
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
