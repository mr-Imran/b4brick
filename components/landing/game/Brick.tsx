"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { PRESS_FINISHES, type BrickFinish, type PressResultTier } from "./GameLogic";

interface BrickProps {
  finishIndex: number;
  pressProgress: number;
  bounceKey: number;
  resultTier: PressResultTier | null;
}

export function Brick({ finishIndex, pressProgress, bounceKey, resultTier }: BrickProps) {
  const finish = PRESS_FINISHES[finishIndex] ?? PRESS_FINISHES[0];
  const compressed = pressProgress > 0.86 ? (pressProgress - 0.86) / 0.14 : 0;
  const scaleY = 1 - compressed * 0.18;
  const scaleX = 1 + compressed * 0.03;

  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        key={bounceKey}
        animate={{
          scaleY: [scaleY, Math.max(0.82, scaleY - 0.06), 0.95, 1],
          scaleX: [scaleX, 1.02, 0.99, 1],
          rotate: [0, compressed > 0 ? 0.5 : 0, 0],
          y: [0, compressed > 0 ? 4 : 0, 0],
        }}
        transition={{ duration: compressed > 0 ? 0.8 : 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 origin-bottom"
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-full blur-3xl"
          style={{ background: finish.brickGlow }}
          aria-hidden="true"
        />
        <Image
          src="/brick.png"
          alt="BRIK clay brick"
          width={340}
          height={200}
          className={`relative h-auto w-[240px] max-w-full object-contain drop-shadow-[0_28px_60px_rgba(0,0,0,0.65)] ${
            finish.id === "obsidian"
              ? "contrast-110 grayscale-[0.35] brightness-[0.82]"
              : finish.id === "sandstone"
                ? "brightness-[1.08] sepia-[0.2] saturate-[0.8]"
                : finish.id === "graphite"
                  ? "grayscale-[0.6] brightness-[0.78]"
                  : finish.id === "kiln-red"
                    ? "saturate-[1.1] brightness-[1.03]"
                    : ""
          }`}
          priority
        />
      </motion.div>

      <div className="mt-3 flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] tracking-[0.28em] text-[#bdbdbd] uppercase">
        <span className="h-2 w-2 rounded-full" style={{ background: finish.machineTint, boxShadow: `0 0 12px ${finish.machineTint}` }} />
        {finish.label}
      </div>

      {resultTier === "broken" && (
        <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_center,transparent_48%,rgba(255,80,80,0.16)_70%,transparent_100%)]" />
      )}
    </div>
  );
}
