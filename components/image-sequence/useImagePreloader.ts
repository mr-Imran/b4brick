"use client";

import { useEffect, useState } from "react";
import type { PreloadState } from "./types";

const initialState: PreloadState = {
  isLoading: true,
  isReady: false,
  progress: 0,
  error: null,
};

/**
 * Preloads an array of image URLs into HTMLImageElement objects.
 * Depends on a stable `urls` reference — use ALL_FRAME_PATHS from lib/frames.
 */
export function useImagePreloader(urls: readonly string[]) {
  const [state, setState] = useState<PreloadState>(initialState);
  const [images, setImages] = useState<HTMLImageElement[]>([]);

  // String key avoids re-running when callers pass equivalent arrays
  const urlsKey = urls.join("|");

  useEffect(() => {
    const urlList = urlsKey.split("|").filter(Boolean);
    if (urlList.length === 0) return;

    const controller = new AbortController();

    setState({ isLoading: true, isReady: false, progress: 0, error: null });
    setImages([]);

    const loaded: HTMLImageElement[] = new Array(urlList.length);
    let completed = 0;

    const loadOne = (src: string, index: number): Promise<void> =>
      new Promise((resolve, reject) => {
        if (controller.signal.aborted) {
          reject(new DOMException("Aborted", "AbortError"));
          return;
        }

        const img = new Image();
        img.decoding = "async";

        let settled = false;

        const finish = () => {
          if (settled) return;
          settled = true;
          loaded[index] = img;
          completed += 1;
          setState((prev) => ({
            ...prev,
            progress: completed / urlList.length,
          }));
          resolve();
        };

        img.onload = finish;
        img.onerror = () => {
          if (!settled) {
            settled = true;
            reject(new Error(`Failed to load image: ${src}`));
          }
        };
        img.src = src;

        if (img.complete && img.naturalWidth > 0) finish();
      });

    void (async () => {
      try {
        await Promise.all(urlList.map((src, i) => loadOne(src, i)));

        if (controller.signal.aborted) return;

        setImages(loaded);
        setState({
          isLoading: false,
          isReady: true,
          progress: 1,
          error: null,
        });
      } catch (err) {
        if (controller.signal.aborted) return;

        const message =
          err instanceof Error ? err.message : "Failed to preload images";
        setState({
          isLoading: false,
          isReady: false,
          progress: completed / urlList.length,
          error: message,
        });
      }
    })();

    return () => controller.abort();
  }, [urlsKey]);

  return {
    ...state,
    images,
  };
}
