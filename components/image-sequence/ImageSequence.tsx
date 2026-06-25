"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";
import { drawImageCover } from "./drawImageCover";
import type { ImageSequenceHandle, ImageSequenceProps } from "./types";
import { isMobileDevice } from "@/lib/device";

function getMaxDpr() {
  return isMobileDevice() ? 1 : 1.5;
}

function getMaxCache() {
  return isMobileDevice() ? 12 : 48;
}

/**
 * Canvas image sequence with LRU cache + crossfade between adjacent frames.
 */
export const ImageSequence = forwardRef<ImageSequenceHandle, ImageSequenceProps>(
  function ImageSequence(
    {
      frameCount,
      images,
      frameIndex,
      className,
      opacity = 1,
      backgroundColor = "#0c0c0e",
    },
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef(0);
    const pendingPositionRef = useRef<number | null>(null);
    const lastPaintedRef = useRef(-1);
    const sizeRef = useRef({ width: 0, height: 0, dpr: 1, key: "" });
    const opacityRef = useRef(opacity);
    const frameCacheRef = useRef<Map<number, HTMLCanvasElement>>(new Map());

    const getContext = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      return canvas.getContext("2d", { alpha: false });
    }, []);

    const clearFrameCache = useCallback(() => {
      frameCacheRef.current.clear();
      lastPaintedRef.current = -1;
    }, []);

    const ensureSize = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return false;

      const dpr = Math.min(window.devicePixelRatio || 1, getMaxDpr());
      const width = window.innerWidth;
      const height = window.innerHeight;
      const key = `${width}x${height}@${dpr}`;

      if (key === sizeRef.current.key && canvas.width > 0) {
        return width > 0 && height > 0;
      }

      sizeRef.current = { width, height, dpr, key };

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = getContext();
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = isMobileDevice() ? "medium" : "high";
      }

      clearFrameCache();
      return width > 0 && height > 0;
    }, [clearFrameCache, getContext]);

    const buildCachedFrame = useCallback(
      (index: number): HTMLCanvasElement | null => {
        const image = images[index];
        if (!image?.complete || image.naturalWidth === 0) return null;

        const { width, height, dpr } = sizeRef.current;
        if (width < 1 || height < 1) return null;

        const pixelW = Math.floor(width * dpr);
        const pixelH = Math.floor(height * dpr);
        if (pixelW < 1 || pixelH < 1) return null;

        const off = document.createElement("canvas");
        off.width = pixelW;
        off.height = pixelH;

        const octx = off.getContext("2d", { alpha: false });
        if (!octx) return null;

        octx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawImageCover(octx, image, width, height, backgroundColor);

        const cache = frameCacheRef.current;
        const maxCache = getMaxCache();
        if (cache.size >= maxCache) {
          const oldest = cache.keys().next().value;
          if (oldest !== undefined) cache.delete(oldest);
        }
        cache.set(index, off);
        return off;
      },
      [backgroundColor, images],
    );

    const getCachedFrame = useCallback(
      (index: number): HTMLCanvasElement | null => {
        const cache = frameCacheRef.current;
        const hit = cache.get(index);
        const { width, dpr } = sizeRef.current;
        const pixelW = Math.floor(width * dpr);

        if (hit && hit.width === pixelW) {
          cache.delete(index);
          cache.set(index, hit);
          return hit;
        }

        if (hit) cache.delete(index);
        return buildCachedFrame(index);
      },
      [buildCachedFrame],
    );

    const resolveLoadedIndex = useCallback(
      (index: number): number => {
        const img = images[index];
        if (img?.complete && img.naturalWidth > 0) return index;

        for (let d = 1; d < frameCount; d++) {
          const prev = images[index - d];
          if (prev?.complete && prev.naturalWidth > 0) return index - d;
          const next = images[index + d];
          if (next?.complete && next.naturalWidth > 0) return index + d;
        }

        return index;
      },
      [frameCount, images],
    );

    const blitFrame = useCallback(
      (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, index: number) => {
        const resolved = resolveLoadedIndex(index);
        const cached = getCachedFrame(resolved);
        if (cached) {
          ctx.drawImage(cached, 0, 0, canvas.width, canvas.height);
          return true;
        }
        const image = images[resolved];
        if (!image?.complete || image.naturalWidth === 0) return false;
        const { width, height } = sizeRef.current;
        drawImageCover(ctx, image, width, height, backgroundColor);
        return true;
      },
      [backgroundColor, getCachedFrame, images, resolveLoadedIndex],
    );

    const resize = useCallback(() => {
      ensureSize();
    }, [ensureSize]);

    const paintBlend = useCallback(
      (position: number) => {
        if (!ensureSize()) return;

        const canvas = canvasRef.current;
        const ctx = getContext();
        if (!canvas || !ctx || images.length === 0) return;

        const max = frameCount - 1;
        const clamped = Math.max(0, Math.min(max, position));
        if (Math.abs(clamped - lastPaintedRef.current) < 0.0001) return;

        const { width, height } = sizeRef.current;
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);

        const i0 = Math.floor(clamped);
        const i1 = Math.min(max, i0 + 1);
        const blend = clamped - i0;
        const mobile = isMobileDevice();

        if (mobile || i0 === i1) {
          const snap = mobile && i0 !== i1 ? (blend >= 0.5 ? i1 : i0) : i0;
          blitFrame(ctx, canvas, snap);
        } else {
          blitFrame(ctx, canvas, i0);
          ctx.globalAlpha = blend;
          blitFrame(ctx, canvas, i1);
          ctx.globalAlpha = 1;
        }

        lastPaintedRef.current = clamped;

        if (!mobile) {
          if (i0 > 0 && !frameCacheRef.current.has(i0 - 1)) {
            requestAnimationFrame(() => buildCachedFrame(i0 - 1));
          }
          if (i1 < max && !frameCacheRef.current.has(i1 + 1)) {
            requestAnimationFrame(() => buildCachedFrame(i1 + 1));
          }
        }
      },
      [blitFrame, buildCachedFrame, ensureSize, backgroundColor, frameCount, getContext, images.length],
    );

    const scheduleBlend = useCallback(
      (position: number, force = false) => {
        if (force) {
          lastPaintedRef.current = -1;
          paintBlend(position);
          return;
        }

        pendingPositionRef.current = position;
        if (rafRef.current) return;

        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = 0;
          const pos = pendingPositionRef.current;
          pendingPositionRef.current = null;
          if (pos !== null) paintBlend(pos);
        });
      },
      [paintBlend],
    );

    const drawFrame = useCallback(
      (index: number) => scheduleBlend(index, true),
      [scheduleBlend],
    );

    const drawFrameBlend = useCallback(
      (position: number) => {
        paintBlend(position);
      },
      [paintBlend],
    );

    const setOpacity = useCallback((value: number) => {
      opacityRef.current = value;
      const canvas = canvasRef.current;
      if (canvas) canvas.style.opacity = String(value);
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        setOpacity,
        drawFrame,
        drawFrameBlend,
        resize,
      }),
      [drawFrame, drawFrameBlend, resize, setOpacity],
    );

    useLayoutEffect(() => {
      setOpacity(opacityRef.current);
      ensureSize();
    }, [ensureSize, setOpacity]);

    useEffect(() => {
      const onResize = () => {
        ensureSize();
        if (lastPaintedRef.current >= 0) {
          scheduleBlend(lastPaintedRef.current, true);
        }
      };

      window.addEventListener("resize", onResize, { passive: true });
      return () => window.removeEventListener("resize", onResize);
    }, [ensureSize, scheduleBlend]);

    useLayoutEffect(() => {
      if (images.length === 0) return;
      ensureSize();
      scheduleBlend(frameIndex, true);
    }, [frameIndex, images, ensureSize, scheduleBlend]);

    useEffect(() => {
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        className={className}
        aria-hidden="true"
        style={{ opacity }}
      />
    );
  },
);
