"use client";

import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getFramePath, FRAME_COUNT } from "@/lib/frames";
import { BRICK_ELEMENTS, type BrickElement } from "@/components/landing/brick-elements";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ease = [0.22, 1, 0.36, 1] as const;

interface ConnectorLine {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function buildCurvePath(line: ConnectorLine): string {
  const { x1, y1, x2, y2 } = line;
  const dx = x2 - x1;
  const c1x = x1 + dx * 0.45;
  const c2x = x2 - dx * 0.25;
  return `M ${x1} ${y1} C ${c1x} ${y1}, ${c2x} ${y2}, ${x2} ${y2}`;
}

function linesEqual(a: ConnectorLine[], b: ConnectorLine[]): boolean {
  if (a.length !== b.length) return false;
  return a.every(
    (line, i) =>
      line.x1 === b[i].x1 &&
      line.y1 === b[i].y1 &&
      line.x2 === b[i].x2 &&
      line.y2 === b[i].y2,
  );
}

/**
 * Elegant clay brick product display — glass panel, animated connector lines,
 * pulsing hotspots. Lines are measured from live DOM positions.
 */
export function BrickProductDisplay() {
  const containerRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<SVGSVGElement>(null);
  const rowRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const hotspotRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const brickSrc = getFramePath(FRAME_COUNT - 1);

  const [activeId, setActiveId] = useState(BRICK_ELEMENTS[0].id);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [lines, setLines] = useState<ConnectorLine[]>([]);
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });
  const cycleRef = useRef(0);
  const measureRafRef = useRef(0);

  const activeElement =
    BRICK_ELEMENTS.find((e) => e.id === activeId) ?? BRICK_ELEMENTS[0];

  const measureLines = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const cr = container.getBoundingClientRect();
    if (cr.width < 1 || cr.height < 1) return;

    const next: ConnectorLine[] = [];
    for (const el of BRICK_ELEMENTS) {
      const row = rowRefs.current.get(el.id);
      const hotspot = hotspotRefs.current.get(el.id);
      if (!row || !hotspot) continue;

      const rr = row.getBoundingClientRect();
      const hr = hotspot.getBoundingClientRect();

      next.push({
        id: el.id,
        x1: Math.round(rr.left + 14 - cr.left),
        y1: Math.round(rr.top + rr.height / 2 - cr.top),
        x2: Math.round(hr.left + hr.width / 2 - cr.left),
        y2: Math.round(hr.top + hr.height / 2 - cr.top),
      });
    }

    if (next.length === 0) return;

    setSvgSize((prev) =>
      prev.w === cr.width && prev.h === cr.height ? prev : { w: cr.width, h: cr.height },
    );
    setLines((prev) => (linesEqual(prev, next) ? prev : next));
  }, []);

  const scheduleMeasure = useCallback(() => {
    if (measureRafRef.current) return;
    measureRafRef.current = requestAnimationFrame(() => {
      measureRafRef.current = 0;
      measureLines();
    });
  }, [measureLines]);

  useLayoutEffect(() => {
    scheduleMeasure();
  }, [scheduleMeasure]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(() => scheduleMeasure());
    ro.observe(container);

    window.addEventListener("resize", scheduleMeasure);
    window.addEventListener("scroll", scheduleMeasure, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("scroll", scheduleMeasure);
    };
  }, [scheduleMeasure]);

  useGSAP(
    () => {
      const svg = linesRef.current;
      if (!svg || lines.length === 0) return;

      const paths = svg.querySelectorAll<SVGPathElement>(".connector-path");
      paths.forEach((path) => {
        const len = path.getTotalLength();
        path.style.strokeDasharray = String(len);
        path.style.strokeDashoffset = String(len);
      });

      gsap.to(paths, {
        strokeDashoffset: 0,
        duration: 1.2,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
        onComplete: () => setHasAnimated(true),
      });
    },
    { scope: containerRef, dependencies: [lines.length] },
  );

  useEffect(() => {
    if (!hasAnimated) return;
    const id = setInterval(() => {
      cycleRef.current = (cycleRef.current + 1) % BRICK_ELEMENTS.length;
      setActiveId(BRICK_ELEMENTS[cycleRef.current].id);
    }, 3500);
    return () => clearInterval(id);
  }, [hasAnimated]);

  const handleHover = useCallback((id: string) => {
    setActiveId(id);
    const idx = BRICK_ELEMENTS.findIndex((e) => e.id === id);
    if (idx >= 0) cycleRef.current = idx;
  }, []);

  const setRowRef = useCallback((id: string, el: HTMLButtonElement | null) => {
    if (el) rowRefs.current.set(id, el);
    else rowRefs.current.delete(id);
  }, []);

  const setHotspotRef = useCallback((id: string, el: HTMLButtonElement | null) => {
    if (el) hotspotRefs.current.set(id, el);
    else hotspotRefs.current.delete(id);
  }, []);

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-6xl">
      <div
        className="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,210,138,0.12) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative grid min-h-[480px] items-center gap-8 lg:grid-cols-[minmax(280px,340px)_1fr] lg:gap-4">
        {svgSize.w > 0 && lines.length > 0 && (
          <svg
            ref={linesRef}
            className="pointer-events-none absolute inset-0 z-10 hidden h-full w-full lg:block"
            width={svgSize.w}
            height={svgSize.h}
            viewBox={`0 0 ${svgSize.w} ${svgSize.h}`}
            aria-hidden="true"
          >
            {lines.map((line) => (
              <path
                key={line.id}
                className="connector-path"
                d={buildCurvePath(line)}
                fill="none"
                stroke={
                  activeId === line.id
                    ? "rgba(255,210,138,0.9)"
                    : "rgba(255,210,138,0.22)"
                }
                strokeWidth={1.5}
                style={{ transition: "stroke 0.4s" }}
              />
            ))}
          </svg>
        )}

        <motion.div
          initial={{ opacity: 0, x: -40, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease }}
          onAnimationComplete={scheduleMeasure}
          className="relative z-20 rounded-2xl border border-[#FFD28A]/15 p-6 md:p-8"
          style={{
            background: "rgba(12,12,14,0.75)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow:
              "0 0 40px rgba(255,210,138,0.06), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <h3 className="font-display text-lg font-semibold tracking-wide text-white">
            Elements Name
          </h3>
          <div className="mt-6 space-y-1">
            {BRICK_ELEMENTS.map((el, i) => (
              <ElementRow
                key={el.id}
                ref={(node) => setRowRef(el.id, node)}
                element={el}
                index={i}
                isActive={activeId === el.id}
                onHover={() => handleHover(el.id)}
              />
            ))}
          </div>
        </motion.div>

        <div className="relative flex min-h-[360px] items-end justify-center pb-4 lg:min-h-[420px]">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.2, ease }}
            onAnimationComplete={scheduleMeasure}
            className="relative z-0 flex w-full max-w-lg flex-col items-center"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              onUpdate={scheduleMeasure}
              className="relative z-10 mb-[-18px]"
            >
              <div
                className="pointer-events-none absolute -inset-8 rounded-full blur-3xl"
                style={{ background: "rgba(255,95,0,0.15)" }}
                aria-hidden="true"
              />
              <Image
                src={brickSrc}
                alt="BRIK luxury clay brick"
                width={420}
                height={280}
                onLoad={scheduleMeasure}
                className="relative h-auto w-full max-w-md object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.7)]"
                priority
              />

              {BRICK_ELEMENTS.map((el) => (
                <Hotspot
                  key={el.id}
                  ref={(node) => setHotspotRef(el.id, node)}
                  element={el}
                  isActive={activeId === el.id}
                  onHover={() => handleHover(el.id)}
                />
              ))}
            </motion.div>

            <div className="relative w-[85%] max-w-sm">
              <div
                className="h-5 rounded-sm"
                style={{
                  background:
                    "linear-gradient(180deg, #1a1a1c 0%, #0a0a0a 100%)",
                  boxShadow:
                    "0 4px 30px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08)",
                }}
              />
              <div
                className="absolute -bottom-1 left-1/2 h-8 w-[90%] -translate-x-1/2 rounded-full blur-xl"
                style={{ background: "rgba(255,95,0,0.12)" }}
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute top-full left-1/2 mt-1 h-16 w-[70%] -translate-x-1/2 opacity-20"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(180,58,40,0.3) 0%, transparent 100%)",
                  transform: "translateX(-50%) scaleY(-0.4)",
                  filter: "blur(4px)",
                }}
                aria-hidden="true"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeId}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="mt-6 rounded-xl border border-white/5 bg-white/[0.03] px-5 py-4 text-center lg:hidden"
        >
          <p className="text-sm font-medium text-[#FFD28A]">{activeElement.title}</p>
          <p className="mt-1 text-xs text-[#BDBDBD]">{activeElement.description}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const ElementRow = forwardRef<
  HTMLButtonElement,
  {
    element: BrickElement;
    index: number;
    isActive: boolean;
    onHover: () => void;
  }
>(function ElementRow({ element, index, isActive, onHover }, ref) {
  return (
    <motion.button
      ref={ref}
      type="button"
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.15 + index * 0.08, duration: 0.6, ease }}
      onMouseEnter={onHover}
      onFocus={onHover}
      className={`group flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-all duration-300 ${
        isActive
          ? "bg-[#FFD28A]/8 border border-[#FFD28A]/20"
          : "border border-transparent hover:bg-white/[0.03]"
      }`}
    >
      <span
        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full transition-all duration-300 ${
          isActive
            ? "bg-[#FFD28A] shadow-[0_0_10px_#FFD28A]"
            : "bg-white/30 group-hover:bg-[#D66A3D]"
        }`}
      />
      <div>
        <p
          className={`text-sm font-medium transition-colors ${
            isActive ? "text-[#FFD28A]" : "text-white"
          }`}
        >
          {element.title}
        </p>
        <p className="mt-0.5 hidden text-xs leading-relaxed text-[#BDBDBD]/70 lg:block">
          {element.description}
        </p>
      </div>
    </motion.button>
  );
});

const Hotspot = forwardRef<
  HTMLButtonElement,
  {
    element: BrickElement;
    isActive: boolean;
    onHover: () => void;
  }
>(function Hotspot({ element, isActive, onHover }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={element.title}
      onMouseEnter={onHover}
      onFocus={onHover}
      className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${element.hotspot.x}%`, top: `${element.hotspot.y}%` }}
    >
      <span className="relative flex h-8 w-8 items-center justify-center">
        {isActive && (
          <motion.span
            layoutId="hotspot-ring"
            className="absolute inset-0 rounded-full border border-[#FFD28A]/60"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
        <span
          className={`relative h-3 w-3 rounded-full border-2 transition-all duration-300 ${
            isActive
              ? "border-[#FFD28A] bg-[#FFD28A]/30 shadow-[0_0_16px_#FFD28A]"
              : "border-white/50 bg-white/10 hover:border-[#FFD28A]/70"
          }`}
        />
      </span>
    </button>
  );
});
