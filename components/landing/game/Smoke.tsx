"use client";

import { memo } from "react";
import { motion } from "framer-motion";

interface SmokeProps {
  active: boolean;
  burst: number;
}

export const Smoke = memo(function Smoke({ active, burst }: SmokeProps) {
  const puffs = [0, 1, 2, 3, 4, 5];

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-28 z-20 flex justify-center" aria-hidden="true">
      {puffs.map((index) => (
        <motion.span
          key={`${burst}-${index}`}
          initial={{ opacity: 0, y: 12, x: (index - 2.5) * 10, scale: 0.3 }}
          animate={
            active
              ? {
                  opacity: [0, 0.34, 0],
                  y: [-6 - index * 3, -48 - index * 8],
                  x: [(index - 2.5) * 10, (index - 2.5) * 18],
                  scale: [0.3, 0.9 + index * 0.06, 1.3 + index * 0.1],
                }
              : { opacity: 0 }
          }
          transition={{ duration: 1.2 + index * 0.08, ease: "easeOut", repeat: active ? Infinity : 0, repeatDelay: 0.18 }}
          className="absolute h-10 w-10 rounded-full blur-xl"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.1) 40%, transparent 72%)",
          }}
        />
      ))}
    </div>
  );
});
