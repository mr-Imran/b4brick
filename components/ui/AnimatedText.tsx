"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

interface SplitHeadlineProps {
  text: string;
  className?: string;
  highlight?: string;
}

/** Word-by-word blur reveal for cinematic headlines */
export function SplitHeadline({ text, className = "", highlight }: SplitHeadlineProps) {
  const words = text.split(" ");

  return (
    <h1 className={className}>
      {words.map((word, i) => {
        const isHighlight = highlight && word.replace(/[.,!?]/g, "") === highlight.replace(/[.,!?]/g, "");
        return (
          <motion.span
            key={`${word}-${i}`}
            initial={{ opacity: 0, y: 36, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.85, delay: 0.08 * i, ease }}
            className={`mr-[0.28em] inline-block last:mr-0 ${isHighlight ? "text-gradient-animated" : ""}`}
          >
            {word}
          </motion.span>
        );
      })}
    </h1>
  );
}

interface ShimmerTextProps {
  children: React.ReactNode;
  className?: string;
}

/** Logo text with slow shimmer sweep */
export function ShimmerText({ children, className = "" }: ShimmerTextProps) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      <span className="text-shimmer absolute inset-0 z-20" aria-hidden="true">
        {children}
      </span>
    </span>
  );
}
