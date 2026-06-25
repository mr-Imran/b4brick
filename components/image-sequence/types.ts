export interface ImageSequenceProps {
  /** Number of frames in the sequence. */
  frameCount: number;
  /** Preloaded HTMLImageElement array, indexed 0..frameCount-1. */
  images: HTMLImageElement[];
  /** Current frame index to render (0-based). */
  frameIndex: number;
  /** Optional className for the canvas element. */
  className?: string;
  /** Canvas opacity (0–1), controlled imperatively to avoid re-renders. */
  opacity?: number;
  /** Background fill color behind the image. */
  backgroundColor?: string;
}

export interface ImageSequenceHandle {
  /** Imperatively set canvas opacity without triggering a React re-render. */
  setOpacity: (opacity: number) => void;
  /** Draw a specific frame immediately. */
  drawFrame: (index: number) => void;
  /** Draw blended frames — immediate paint (synced to GSAP ticker). */
  drawFrameBlend: (position: number) => void;
  /** Resize canvas to match viewport (call on window resize). */
  resize: () => void;
}

export interface PreloadState {
  isLoading: boolean;
  /** Bootstrap frames loaded — scroll animation can start. */
  isReady: boolean;
  /** All frames loaded. */
  isFullyLoaded: boolean;
  progress: number;
  error: string | null;
}
