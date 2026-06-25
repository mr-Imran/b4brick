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

/** Frames required before scroll animation can start (~5MB vs full ~29MB). */
export const BOOTSTRAP_FRAME_COUNT = 20;

/** Max parallel frame downloads — avoids browser connection queue stalls. */
export const FRAME_LOAD_CONCURRENCY = 10;

/**
 * Priority load order: early story frames + final frame, then the rest.
 */
export function getFrameLoadOrder(frameCount: number = FRAME_COUNT): number[] {
  const order: number[] = [];
  const bootstrap = Math.min(BOOTSTRAP_FRAME_COUNT, frameCount);

  for (let i = 0; i < bootstrap; i++) order.push(i);
  if (frameCount > 1) order.push(frameCount - 1);
  for (let i = bootstrap; i < frameCount - 1; i++) order.push(i);

  return order;
}

/** First N frames to hint in document preload. */
export const FRAME_PRELOAD_HINTS = 4;
export const PIXELS_PER_FRAME = 36;
export const STORY_SCROLL_DISTANCE = PIXELS_PER_FRAME * FRAME_COUNT;

/**
 * Linear scroll → frame position (GTA VI style: 1:1 film scrub).
 * Easing belongs on opacity fades, not frame index.
 */
export function storyFramePosition(
  progress: number,
  frameCount: number = FRAME_COUNT,
): number {
  const t = Math.max(0, Math.min(1, progress));
  return t * (frameCount - 1);
}

/**
 * @deprecated Use storyFramePosition + crossfade for smooth playback.
 */
export function storyFrameIndex(progress: number, frameCount: number = FRAME_COUNT): number {
  return Math.round(storyFramePosition(progress, frameCount));
}

/** Smooth fade curve for end-of-sequence transitions */
export function easeOutSmooth(t: number, power = 2.2): number {
  const clamped = Math.max(0, Math.min(1, t));
  return 1 - (1 - clamped) ** power;
}
