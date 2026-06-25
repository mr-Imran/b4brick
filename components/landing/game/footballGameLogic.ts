/** Football mini-game constants and scoring */

export const FIELD_W = 720;
export const FIELD_H = 520;
export const BRICK_W = 54;
export const BRICK_H = 28;
/** @deprecated use BRICK_W */
export const BALL_RADIUS = BRICK_W / 2;

export const GOAL_WIDTH = 158;
export const GOAL_POST_W = 10;
export const GOAL_CROSSBAR_Y = 22;
export const GOAL_LINE_Y = 82;
export const GOAL_NET_DEPTH = 48;

export const SHOTS_PER_ROUND = 5;
export const ROUND_TIME_SEC = 45;
export const MILESTONE_GOALS = 5;

/** Shown when the player scores 5 goals in a round */
export const MILESTONE_COPY = {
  eyebrow: "Milestone Unlocked",
  headline: "Strong Brick.",
  body: "Forged under pressure. Built to endure generations.",
  tagline: "This is what 150+ years of durability feels like.",
} as const;

export const STORAGE_KEY = "brik-football-high-score";

export type GamePhase = "ready" | "aiming" | "winding" | "flying" | "goal" | "miss" | "roundOver";

export interface ShotResult {
  scored: boolean;
  points: number;
  label: string;
}

export interface GoalGeometry {
  cx: number;
  left: number;
  right: number;
  mouthTop: number;
  mouthBottom: number;
  netBackY: number;
}

export function getGoalGeometry(fieldW: number = FIELD_W): GoalGeometry {
  const cx = fieldW / 2;
  const half = GOAL_WIDTH / 2;
  return {
    cx,
    left: cx - half,
    right: cx + half,
    mouthTop: GOAL_CROSSBAR_Y + 6,
    mouthBottom: GOAL_LINE_Y,
    netBackY: GOAL_CROSSBAR_Y - GOAL_NET_DEPTH + 8,
  };
}

/** Inner scoring zone (between the posts, under the bar) */
export function getGoalBounds(fieldW: number) {
  const g = getGoalGeometry(fieldW);
  const inset = GOAL_POST_W + 4;
  return {
    left: g.left + inset,
    right: g.right - inset,
    top: g.mouthTop,
    bottom: g.mouthBottom,
  };
}

export function isInsideGoalMouth(x: number, y: number, fieldW: number = FIELD_W): boolean {
  const b = getGoalBounds(fieldW);
  return x > b.left && x < b.right && y > b.top && y < b.bottom;
}

/** Points by how centered the shot enters the goal */
export function scoreShot(ballX: number, fieldW: number): ShotResult {
  const cx = fieldW / 2;
  const offset = Math.abs(ballX - cx);
  const half = (GOAL_WIDTH - GOAL_POST_W * 2) / 2;

  if (offset < half * 0.2) {
    return { scored: true, points: 3, label: "TOP CORNER!" };
  }
  if (offset < half * 0.45) {
    return { scored: true, points: 2, label: "GOAL!" };
  }
  if (offset < half) {
    return { scored: true, points: 1, label: "SCORED" };
  }
  return { scored: false, points: 0, label: "MISS" };
}

export function loadHighScore(): number {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(STORAGE_KEY) ?? 0);
}

export function saveHighScore(score: number): void {
  if (typeof window === "undefined") return;
  const prev = loadHighScore();
  if (score > prev) localStorage.setItem(STORAGE_KEY, String(score));
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
