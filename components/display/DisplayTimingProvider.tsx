"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_DISPLAY_TIMING,
  getDisplayTiming,
  measureRefreshRate,
  type DisplayTiming,
} from "@/lib/displayTiming";

interface DisplayTimingContextValue {
  timing: DisplayTiming;
  measured: boolean;
}

const DisplayTimingContext = createContext<DisplayTimingContextValue>({
  timing: DEFAULT_DISPLAY_TIMING,
  measured: false,
});

export function DisplayTimingProvider({ children }: { children: ReactNode }) {
  const [timing, setTiming] = useState<DisplayTiming>(DEFAULT_DISPLAY_TIMING);
  const [measured, setMeasured] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void measureRefreshRate().then((hz) => {
      if (cancelled) return;
      setTiming(getDisplayTiming(hz));
      setMeasured(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DisplayTimingContext.Provider value={{ timing, measured }}>
      {children}
    </DisplayTimingContext.Provider>
  );
}

export function useDisplayTiming() {
  return useContext(DisplayTimingContext);
}
