"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface CursorSpotlightProps {
  children: ReactNode;
}

/**
 * Subtle cursor-following spotlight on desktop.
 * Disabled on touch devices for performance.
 */
export function CursorSpotlight({ children }: CursorSpotlightProps) {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    const spot = spotlightRef.current;
    if (!spot) return;

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = 0;
          pos.current.x += (target.current.x - pos.current.x) * 0.12;
          pos.current.y += (target.current.y - pos.current.y) * 0.12;
          spot.style.transform = `translate(${pos.current.x - 300}px, ${pos.current.y - 300}px)`;
        });
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div
        ref={spotlightRef}
        className="pointer-events-none fixed top-0 left-0 z-[1] hidden h-[600px] w-[600px] rounded-full opacity-40 md:block"
        style={{
          background:
            "radial-gradient(circle, rgba(255,210,138,0.08) 0%, rgba(255,95,0,0.04) 35%, rgba(180,58,40,0.02) 55%, transparent 70%)",
          willChange: "transform",
        }}
        aria-hidden="true"
      />
      <div className="relative z-[2]">{children}</div>
    </>
  );
}
