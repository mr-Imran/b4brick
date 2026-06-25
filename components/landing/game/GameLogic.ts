"use client";

import type Matter from "matter-js";

export type PressResultTier = "perfect" | "great" | "good" | "broken";
export type BrickFinish = "raw-clay" | "kiln-red" | "obsidian" | "sandstone" | "graphite";

export interface PressRound {
  id: number;
  targetPressure: number;
}

export interface PressEvaluation {
  diff: number;
  tier: PressResultTier;
  xp: number;
  label: string;
  success: boolean;
}

export interface ProgressState {
  xp: number;
  successfulPresses: number;
  perfectPresses: number;
  level: number;
  finishIndex: number;
}

export const PRESS_FINISHES: Array<{
  id: BrickFinish;
  label: string;
  machineTint: string;
  brickGlow: string;
}> = [
  { id: "raw-clay", label: "Raw Clay", machineTint: "#b43a28", brickGlow: "rgba(180,58,40,0.28)" },
  { id: "kiln-red", label: "Kiln Red", machineTint: "#d66a3d", brickGlow: "rgba(214,106,61,0.3)" },
  { id: "obsidian", label: "Obsidian", machineTint: "#6a6f78", brickGlow: "rgba(120,128,145,0.22)" },
  { id: "sandstone", label: "Sandstone Gold", machineTint: "#ffd28a", brickGlow: "rgba(255,210,138,0.3)" },
  { id: "graphite", label: "Graphite Black", machineTint: "#8f959d", brickGlow: "rgba(143,149,157,0.22)" },
];

export const PRESS_STORAGE_KEY = "brik-press-progress";

export const PRESS_TARGET_MIN = 36;
export const PRESS_TARGET_MAX = 88;

export function createRound(id: number): PressRound {
  return {
    id,
    targetPressure: Math.round(PRESS_TARGET_MIN + Math.random() * (PRESS_TARGET_MAX - PRESS_TARGET_MIN)),
  };
}

export function evaluatePress(targetPressure: number, currentPressure: number): PressEvaluation {
  const diff = Math.abs(targetPressure - currentPressure);

  if (diff <= 2) {
    return { diff, tier: "perfect", xp: 100, label: "PERFECT PRESS", success: true };
  }
  if (diff <= 5) {
    return { diff, tier: "great", xp: 70, label: "GREAT", success: true };
  }
  if (diff <= 10) {
    return { diff, tier: "good", xp: 40, label: "GOOD", success: true };
  }
  return { diff, tier: "broken", xp: 0, label: "BRICK CRACKED", success: false };
}

export function getLevel(xp: number): number {
  return Math.max(1, Math.floor(xp / 250) + 1);
}

export function applyEvaluation(
  prev: ProgressState,
  evaluation: PressEvaluation,
): { next: ProgressState; unlockedFinish: string | null } {
  const successfulPresses = prev.successfulPresses + (evaluation.success ? 1 : 0);
  const perfectPresses = prev.perfectPresses + (evaluation.tier === "perfect" ? 1 : 0);
  const xp = prev.xp + evaluation.xp;
  const finishIndex = Math.min(
    PRESS_FINISHES.length - 1,
    Math.floor(successfulPresses / 5),
  );
  const unlockedFinish = finishIndex > prev.finishIndex ? PRESS_FINISHES[finishIndex]?.label ?? null : null;

  return {
    next: {
      xp,
      successfulPresses,
      perfectPresses,
      finishIndex,
      level: getLevel(xp),
    },
    unlockedFinish,
  };
}

export function defaultProgress(): ProgressState {
  return {
    xp: 0,
    successfulPresses: 0,
    perfectPresses: 0,
    level: 1,
    finishIndex: 0,
  };
}

export function loadProgress(): ProgressState {
  if (typeof window === "undefined") return defaultProgress();

  try {
    const raw = window.localStorage.getItem(PRESS_STORAGE_KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    const xp = Number(parsed.xp ?? 0);
    const successfulPresses = Number(parsed.successfulPresses ?? 0);
    const perfectPresses = Number(parsed.perfectPresses ?? 0);
    const finishIndex = Math.max(0, Math.min(PRESS_FINISHES.length - 1, Number(parsed.finishIndex ?? 0)));
    return {
      xp,
      successfulPresses,
      perfectPresses,
      finishIndex,
      level: getLevel(xp),
    };
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(progress: ProgressState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PRESS_STORAGE_KEY, JSON.stringify(progress));
}

export function createPhysicsEngine(MatterLib: typeof Matter) {
  const { Engine, Bodies, Runner, Body } = MatterLib;
  const engine = Engine.create({ gravity: { x: 0, y: 1.2, scale: 0.0015 } });
  const runner = Runner.create();
  const pressHead = Bodies.rectangle(0, 0, 260, 36, { frictionAir: 0.08, inertia: Infinity });
  const brick = Bodies.rectangle(0, 90, 180, 56, { frictionAir: 0.04, restitution: 0.06, inertia: Infinity });
  Runner.run(runner, engine);
  engine.world.gravity.y = 0;
  Engine.update(engine, 16);
  Body.setPosition(pressHead, { x: 0, y: 0 });
  Body.setPosition(brick, { x: 0, y: 90 });

  return {
    engine,
    runner,
    pressHead,
    brick,
    setPress(progress: number) {
      Body.setPosition(pressHead, { x: 0, y: progress * 86 });
      const squash = progress > 0.85 ? (progress - 0.85) / 0.15 : 0;
      Body.scale(brick, 1 + squash * 0.015, 1 - squash * 0.02);
    },
    destroy() {
      MatterLib.Runner.stop(runner);
      MatterLib.Engine.clear(engine);
    },
  };
}
