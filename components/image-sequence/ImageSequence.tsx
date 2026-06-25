"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { drawImageCover } from "./drawImageCover";
import type { ImageSequenceHandle, ImageSequenceProps } from "./types";

/**
 * Canvas-based image sequence renderer.
 *
 * Renders discrete frames on requestAnimationFrame — no cross-fade between
 * frames. Designed for scroll-driven cinematic sequences with minimal
 * React re-renders (opacity and frame changes are imperative).
 */
export const ImageSequence = forwardRef<ImageSequenceHandle, ImageSequenceProps>(
  function ImageSequence(
    {
      frameCount,
      images,
      frameIndex,
      className,
      opacity = 1,
      backgroundColor = "#0a0a0a",
    },
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef<number>(0);
    const pendingFrameRef = useRef<number | null>(null);
    const lastDrawnFrameRef = useRef<number>(-1);
    const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });
    const opacityRef = useRef(opacity);

    const getContext = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      return canvas.getContext("2d", { alpha: false, desynchronized: true });
    }, []);

    const resize = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      sizeRef.current = { width, height, dpr };

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = getContext();
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      // Force redraw after resize
      lastDrawnFrameRef.current = -1;
    }, [getContext]);

    const drawFrame = useCallback(
      (index: number) => {
        const canvas = canvasRef.current;
        const ctx = getContext();
        if (!canvas || !ctx || images.length === 0) return;

        const clamped = Math.max(0, Math.min(frameCount - 1, index));
        const image = images[clamped];
        if (!image) return;

        const { width, height } = sizeRef.current;
        drawImageCover(ctx, image, width, height, backgroundColor);
        lastDrawnFrameRef.current = clamped;
      },
      [backgroundColor, frameCount, getContext, images],
    );

    const scheduleDraw = useCallback(
      (index: number) => {
        pendingFrameRef.current = index;

        if (rafRef.current) return;

        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = 0;
          const frame = pendingFrameRef.current;
          pendingFrameRef.current = null;

          if (frame !== null && frame !== lastDrawnFrameRef.current) {
            drawFrame(frame);
          }
        });
      },
      [drawFrame],
    );

    const setOpacity = useCallback((value: number) => {
      opacityRef.current = value;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.opacity = String(value);
      }
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        setOpacity,
        drawFrame,
        resize,
      }),
      [drawFrame, resize, setOpacity],
    );

    // Initial sizing
    useEffect(() => {
      resize();
      setOpacity(opacityRef.current);

      const onResize = () => {
        resize();
        if (lastDrawnFrameRef.current >= 0) {
          drawFrame(lastDrawnFrameRef.current);
        }
      };

      window.addEventListener("resize", onResize, { passive: true });
      return () => window.removeEventListener("resize", onResize);
    }, [drawFrame, resize, setOpacity]);

    // Draw when frameIndex prop changes (controlled mode)
    useEffect(() => {
      if (images.length === 0) return;
      scheduleDraw(frameIndex);
    }, [frameIndex, images.length, scheduleDraw]);

    // Cleanup RAF on unmount
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
