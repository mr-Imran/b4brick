"use client";

import { memo } from "react";
import { motion } from "framer-motion";

interface PressureGaugeProps {
  target: number;
  current: number;
}

export const PressureGauge = memo(function PressureGauge({ target, current }: PressureGaugeProps) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const currentOffset = circumference * (1 - current / 100);
  const targetOffset = circumference * (1 - target / 100);

  return (
    <div className="glass-strong relative flex items-center gap-4 rounded-2xl px-4 py-3">
      <svg width="126" height="126" viewBox="0 0 126 126" className="shrink-0">
        <circle cx="63" cy="63" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle
          cx="63"
          cy="63"
          r={radius}
          fill="none"
          stroke="rgba(255,210,138,0.38)"
          strokeWidth="10"
          strokeDasharray={`${circumference * 0.06} ${circumference}`}
          strokeDashoffset={targetOffset}
          strokeLinecap="round"
          transform="rotate(-90 63 63)"
        />
        <motion.circle
          cx="63"
          cy="63"
          r={radius}
          fill="none"
          stroke="url(#pressureGaugeGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: currentOffset }}
          transition={{ duration: 0.08, ease: "linear" }}
          transform="rotate(-90 63 63)"
        />
        <defs>
          <linearGradient id="pressureGaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b43a28" />
            <stop offset="60%" stopColor="#d66a3d" />
            <stop offset="100%" stopColor="#ffd28a" />
          </linearGradient>
        </defs>
        <text x="63" y="57" textAnchor="middle" fill="#bdbdbd" fontSize="10" letterSpacing="3">CURRENT</text>
        <text x="63" y="77" textAnchor="middle" fill="#ffffff" fontSize="24" fontWeight="700">{Math.round(current)}%</text>
      </svg>

      <div className="min-w-[120px]">
        <p className="text-[10px] tracking-[0.32em] text-[#bdbdbd]/60 uppercase">Target</p>
        <p className="mt-1 text-3xl font-bold text-[#ffd28a]">{target}%</p>
        <p className="mt-2 text-xs leading-relaxed text-[#bdbdbd]">Release inside the gold zone for a perfect press.</p>
      </div>
    </div>
  );
});
