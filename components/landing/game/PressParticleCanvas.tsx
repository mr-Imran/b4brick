"use client";

import { useEffect, useRef } from "react";
import { createBurst, stepParticles, type ParticleSpec } from "./ParticleSystem";

interface PressParticleCanvasProps {
  holding: boolean;
  successBurstKey: number;
  resultTier: "perfect" | "great" | "good" | "broken" | null;
}

export function PressParticleCanvas({ holding, successBurstKey, resultTier }: PressParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<ParticleSpec[]>([]);
  const rafRef = useRef(0);
  const lastRef = useRef(0);
  const holdSpawnRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const tick = (time: number) => {
      const last = lastRef.current || time;
      const dt = Math.min(0.032, (time - last) / 1000);
      lastRef.current = time;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      if (holding && time - holdSpawnRef.current > 85) {
        holdSpawnRef.current = time;
        particlesRef.current.push(
          ...createBurst({
            count: Math.random() > 0.72 ? 3 : 1,
            originX: width * 0.5 + (Math.random() - 0.5) * 60,
            originY: height * 0.64,
            speedMin: 10,
            speedMax: 70,
            color: Math.random() > 0.5 ? "#ff5f00" : "#ffd28a",
            gravity: 80,
            lifeMin: 0.3,
            lifeMax: 0.65,
            spread: Math.PI * 0.6,
          }),
        );
      }

      particlesRef.current = stepParticles(particlesRef.current, dt);

      ctx.clearRect(0, 0, width, height);
      for (const particle of particlesRef.current) {
        const alpha = Math.max(0, particle.life / particle.maxLife);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [holding]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || successBurstKey === 0) return;
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width * 0.5;
    const centerY = rect.height * 0.62;
    const color = resultTier === "broken" ? "#ff5f5f" : resultTier === "perfect" ? "#ffd28a" : "#d66a3d";
    const count = resultTier === "perfect" ? 120 : resultTier === "great" ? 90 : resultTier === "good" ? 80 : 60;

    particlesRef.current.push(
      ...createBurst({
        count,
        originX: centerX,
        originY: centerY,
        speedMin: 20,
        speedMax: resultTier === "broken" ? 140 : 180,
        color,
        gravity: resultTier === "broken" ? 220 : 180,
        lifeMin: 0.45,
        lifeMax: 1.1,
        spread: Math.PI * 1.2,
        sizeMin: 1,
        sizeMax: resultTier === "perfect" ? 4.5 : 3.5,
      }),
    );
  }, [resultTier, successBurstKey]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-40 h-full w-full" aria-hidden="true" />;
}
