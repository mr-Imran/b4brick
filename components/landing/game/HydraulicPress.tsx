"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface HydraulicPressProps {
  pressProgress: number;
  active: boolean;
  vibration: number;
}

export function HydraulicPress({ pressProgress, active, vibration }: HydraulicPressProps) {
  return (
    <motion.div
      animate={active ? { x: [-vibration, vibration, -vibration * 0.5, 0], y: [0, 1, -1, 0] } : { x: 0, y: 0 }}
      transition={active ? { duration: 0.18, repeat: Infinity, ease: "linear" } : { duration: 0.3 }}
      className="relative mx-auto w-full max-w-[560px]"
    >
      <Image
        src="/gameasset/watermarked_img_4870786673617299386.png"
        alt="Hydraulic press machine"
        width={655}
        height={655}
        className="h-auto w-full object-contain opacity-95"
        priority
      />

      <motion.div
        className="pointer-events-none absolute left-1/2 top-[24%] z-20 h-[36%] w-[27%] -translate-x-1/2"
        animate={{ y: pressProgress * 86 }}
        transition={{ type: "spring", stiffness: 160, damping: 24, mass: 0.6 }}
      >
        <div className="relative mx-auto h-full w-full">
          <div className="absolute left-1/2 top-0 h-[58%] w-[16%] -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,#d4d9df_0%,#7c8791_55%,#c3c9cf_100%)] shadow-[inset_0_0_10px_rgba(255,255,255,0.25)]" />
          <div className="absolute bottom-0 left-1/2 h-[42%] w-[86%] -translate-x-1/2 rounded-md bg-[linear-gradient(180deg,#adb5be_0%,#757e87_50%,#5f6770_100%)] shadow-[0_10px_24px_rgba(0,0,0,0.35)]" />
        </div>
      </motion.div>

      <motion.div
        className="pointer-events-none absolute left-1/2 top-[20%] z-10 h-8 w-40 -translate-x-1/2 rounded-full blur-2xl"
        animate={{ opacity: active ? 0.75 : 0.35, scale: active ? 1.08 : 1 }}
        transition={{ duration: 0.2 }}
        style={{ background: "rgba(255,95,0,0.18)" }}
      />
    </motion.div>
  );
}
