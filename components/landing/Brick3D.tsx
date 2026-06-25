"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { getFramePath, FRAME_COUNT } from "@/lib/frames";

interface Brick3DProps {
  className?: string;
  size?: "sm" | "lg";
  autoRotate?: boolean;
}

/**
 * Pseudo-3D brick with mouse parallax, kiln glow, and flame pulse.
 */
export function Brick3D({
  className = "",
  size = "lg",
  autoRotate = true,
}: Brick3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const brickSrc = getFramePath(FRAME_COUNT - 1);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 80, damping: 20 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-14, 14]), springConfig);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    const onLeave = () => {
      mouseX.set(0);
      mouseY.set(0);
    };

    container.addEventListener("mousemove", onMove);
    container.addEventListener("mouseleave", onLeave);
    return () => {
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseleave", onLeave);
    };
  }, [mouseX, mouseY]);

  const dimensions = size === "lg" ? "w-72 h-72 sm:w-96 sm:h-96" : "w-48 h-48 sm:w-64 sm:h-64";

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center ${dimensions} ${className}`}
      style={{ perspective: 1200 }}
    >
      {/* Spotlight from above */}
      <motion.div
        className="pointer-events-none absolute -top-1/4 left-1/2 h-[200%] w-[150%] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse 40% 30% at 50% 20%, rgba(255,255,255,0.14) 0%, transparent 60%)",
        }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />

      {/* Animated kiln glow beneath brick */}
      <div
        className="kiln-glow-animated pointer-events-none absolute bottom-0 left-1/2 h-36 w-72 -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,95,0,0.35) 0%, rgba(214,106,61,0.2) 40%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Warm flame base */}
      <div
        className="kiln-glow-animated pointer-events-none absolute bottom-0 left-1/2 h-20 w-56 -translate-x-1/2 rounded-full blur-2xl"
        style={{
          background:
            "radial-gradient(ellipse, rgba(255,95,0,0.4) 0%, rgba(214,106,61,0.15) 50%, transparent 75%)",
        }}
        aria-hidden="true"
      />

      <motion.div
        className="brick-float relative will-change-transform"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        animate={autoRotate ? { rotateZ: [0, 2, 0, -2, 0] } : undefined}
        transition={
          autoRotate ? { duration: 8, repeat: Infinity, ease: "easeInOut" } : undefined
        }
      >
        <Image
          src={brickSrc}
          alt="BRIK luxury brick"
          width={400}
          height={400}
          className="relative z-10 h-full w-full object-contain drop-shadow-[0_30px_60px_rgba(180,58,40,0.4)]"
          priority
        />
      </motion.div>
    </div>
  );
}
