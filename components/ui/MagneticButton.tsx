"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";
import { motion } from "framer-motion";

interface MagneticButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "ghost";
}

/**
 * CTA button with magnetic hover pull and soft glow.
 */
export function MagneticButton({
  children,
  href,
  onClick,
  className = "",
  variant = "primary",
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);

  const handleMouseMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.25;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "translate(0, 0)";
  };

  const base =
    "relative inline-flex items-center justify-center rounded-full px-8 py-4 text-sm font-medium tracking-wide transition-[box-shadow,background] duration-500 will-change-transform";
  const variants = {
    primary:
      "glass-strong text-white glow-primary hover:bg-white/10 hover:border-[#FF5F00]/20",
    ghost:
      "border border-white/15 text-white/80 hover:border-[#FFD28A]/30 hover:text-white hover:shadow-[0_0_30px_rgba(255,95,0,0.1)]",
  };

  const combined = `${base} ${variants[variant]} ${className}`;

  const inner = (
    <>
      <span className="relative z-10">{children}</span>
      {variant === "primary" && (
        <span
          className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(255,210,138,0.15), transparent 70%)",
          }}
        />
      )}
    </>
  );

  if (href) {
    return (
      <motion.a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        className={`group ${combined}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
      >
        {inner}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type="button"
      onClick={onClick}
      className={`group ${combined}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
    >
      {inner}
    </motion.button>
  );
}
