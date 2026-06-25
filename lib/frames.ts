/** Total frames in the sand-to-brick transformation sequence. */
export const FRAME_COUNT = 102;

/** Base path for frame assets in /public. */
export const FRAMES_BASE_PATH = "/frames";

/** Image file extension for frame assets. */
export const FRAME_EXTENSION = "png";

/** Filename stem for frame assets (e.g. …_000.png). */
export const FRAME_BASENAME = "Create_an_ultra_realistic_cin_gwr_video_mvp";

/**
 * Returns the public URL for a frame by index (0-based).
 * frame 0 → …_000.png, frame 101 → …_101.png
 */
export function getFramePath(index: number): string {
  const clamped = Math.max(0, Math.min(FRAME_COUNT - 1, index));
  const filename = `${FRAME_BASENAME}_${String(clamped).padStart(3, "0")}.${FRAME_EXTENSION}`;
  return `${FRAMES_BASE_PATH}/${filename}`;
}

/** All frame URLs for preloading (stable module-level reference). */
export const ALL_FRAME_PATHS: readonly string[] = Array.from(
  { length: FRAME_COUNT },
  (_, i) => getFramePath(i),
);

/** @deprecated Use ALL_FRAME_PATHS for a stable reference. */
export function getAllFramePaths(): readonly string[] {
  return ALL_FRAME_PATHS;
}

/**
 * Maps scroll progress (0–1) to a frame index (0–101).
 * Slight ease-out so frames advance quickly at the start of the story scroll.
 */
export function progressToFrameIndex(progress: number): number {
  const clamped = Math.max(0, Math.min(1, progress));
  const eased = clamped ** 0.82;
  return Math.round(eased * (FRAME_COUNT - 1));
}

/** Pinned scroll distance (px) for the full frame sequence — lower = faster frame advance. */
export const STORY_SCROLL_DISTANCE = Math.round(36 * FRAME_COUNT);
