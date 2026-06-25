"use client";

import { motion } from "framer-motion";

interface LoadingIndicatorProps {
  progress: number;
  /** overlay = legacy fullscreen; bar = non-blocking top strip */
  variant?: "overlay" | "bar";
}

/**
 * Loading progress — slim bar by default so the hero intro shows immediately.
 */
export function LoadingIndicator({
  progress,
  variant = "bar",
}: LoadingIndicatorProps) {
  const percent = Math.round(progress * 100);

  if (variant === "bar") {
    return (
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-50"
        role="status"
        aria-live="polite"
        aria-label={`Loading animation frames, ${percent} percent`}
      >
        <div className="h-[3px] w-full bg-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-[#b43a28] via-[#ff5f00] to-[#ffd28a]"
            initial={{ width: "0%" }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.12, ease: "linear" }}
          />
        </div>
        <p className="sr-only">Loading frames {percent}%</p>
      </div>
    );
  }

  const circumference = 2 * Math.PI * 28;
  const dashOffset = circumference * (1 - progress);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a]"
      role="status"
      aria-live="polite"
      aria-label={`Loading animation frames, ${percent} percent`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-8"
      >
        <div className="relative h-16 w-16">
          <svg
            className="h-full w-full -rotate-90"
            viewBox="0 0 64 64"
            aria-hidden="true"
          >
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="3"
            />
            <motion.circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="#c41e3a"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 0.15, ease: "linear" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium tracking-widest text-white/70">
            {percent}
          </span>
        </div>

        <div className="text-center">
          <p className="text-sm font-medium tracking-[0.35em] text-white/90 uppercase">
            BRIK.
          </p>
          <p className="mt-2 text-xs tracking-widest text-white/40 uppercase">
            Forging greatness
          </p>
        </div>
      </motion.div>
    </div>
  );
}
