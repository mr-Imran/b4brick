"use client";

import {
  BOOTSTRAP_FRAME_COUNT,
  FRAME_LOAD_CONCURRENCY,
  getFrameLoadOrder,
} from "@/lib/frames";
import { useEffect, useState } from "react";
import type { PreloadState } from "./types";

const initialState: PreloadState = {
  isLoading: true,
  isReady: false,
  isFullyLoaded: false,
  progress: 0,
  error: null,
};

function isBootstrapComplete(
  loaded: Array<HTMLImageElement | undefined>,
  total: number,
): boolean {
  const bootstrap = Math.min(BOOTSTRAP_FRAME_COUNT, total);
  for (let i = 0; i < bootstrap; i++) {
    const img = loaded[i];
    if (!img?.complete || img.naturalWidth === 0) return false;
  }
  if (total > 1) {
    const last = loaded[total - 1];
    if (!last?.complete || last.naturalWidth === 0) return false;
  }
  return true;
}

/**
 * Preloads frame URLs with priority order + bounded concurrency.
 * `isReady` after bootstrap frames; remaining frames stream in background.
 */
export function useImagePreloader(urls: readonly string[]) {
  const [state, setState] = useState<PreloadState>(initialState);
  const [images, setImages] = useState<HTMLImageElement[]>([]);

  const urlsKey = urls.join("|");

  useEffect(() => {
    const urlList = urlsKey.split("|").filter(Boolean);
    if (urlList.length === 0) return;

    const controller = new AbortController();

    setState({ isLoading: true, isReady: false, isFullyLoaded: false, progress: 0, error: null });
    setImages([]);

    const loaded: Array<HTMLImageElement | undefined> = new Array(urlList.length);
    let completed = 0;
    let bootstrapMarked = false;
    let lastImagePublish = 0;

    const publishImages = (force = false) => {
      const now = performance.now();
      if (!force && now - lastImagePublish < 120) return;
      lastImagePublish = now;
      setImages([...(loaded as HTMLImageElement[])]);
    };

    const publish = () => {
      const progress = completed / urlList.length;
      const bootstrapDone = isBootstrapComplete(loaded, urlList.length);

      publishImages(
        bootstrapDone && !bootstrapMarked,
      );

      if (!bootstrapMarked && bootstrapDone) {
        bootstrapMarked = true;
        setState((prev) => ({
          ...prev,
          isReady: true,
          isLoading: completed < urlList.length,
          progress,
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        progress,
        isLoading: completed < urlList.length,
        isFullyLoaded: completed >= urlList.length,
        isReady: prev.isReady || bootstrapDone,
      }));
    };

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
          publish();
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

    const loadWithPool = async (indices: number[]) => {
      let cursor = 0;

      const worker = async () => {
        while (cursor < indices.length) {
          const slot = cursor;
          cursor += 1;
          const index = indices[slot];
          await loadOne(urlList[index], index);
        }
      };

      const workers = Math.min(
        FRAME_LOAD_CONCURRENCY,
        indices.length,
      );
      await Promise.all(Array.from({ length: workers }, () => worker()));
    };

    void (async () => {
      try {
        const order = getFrameLoadOrder(urlList.length);
        await loadWithPool(order);

        if (controller.signal.aborted) return;

        publishImages(true);
        setState({
          isLoading: false,
          isReady: true,
          isFullyLoaded: true,
          progress: 1,
          error: null,
        });
      } catch (err) {
        if (controller.signal.aborted) return;

        const message =
          err instanceof Error ? err.message : "Failed to preload images";
        setState({
          isLoading: false,
          isReady: isBootstrapComplete(loaded, urlList.length),
          isFullyLoaded: false,
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
