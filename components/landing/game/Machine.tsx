"use client";

import { memo } from "react";
import { HydraulicPress } from "./HydraulicPress";
import { Brick } from "./Brick";
import { Smoke } from "./Smoke";
import type { PressResultTier } from "./GameLogic";

interface MachineProps {
  pressProgress: number;
  holding: boolean;
  burstKey: number;
  finishIndex: number;
  resultTier: PressResultTier | null;
}

export const Machine = memo(function Machine({
  pressProgress,
  holding,
  burstKey,
  finishIndex,
  resultTier,
}: MachineProps) {
  const vibration = pressProgress > 0.12 ? 1.8 + pressProgress * 2.2 : 0;

  return (
    <div className="relative min-h-[520px] w-full">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04)_0%,transparent_58%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-10 h-80 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_45%)] opacity-30 blur-3xl" />
      <HydraulicPress pressProgress={pressProgress} active={holding} vibration={vibration} />
      <Smoke active={holding || resultTier === "great" || resultTier === "perfect"} burst={burstKey} />

      <div className="absolute inset-x-0 bottom-[15%] z-20 flex justify-center">
        <div className="relative flex flex-col items-center">
          <div className="absolute bottom-3 h-10 w-72 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,95,0,0.22)_0%,rgba(255,95,0,0.08)_36%,transparent_74%)] blur-2xl" />
          <div className="relative h-10 w-[300px] rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,#25282d_0%,#111214_100%)] shadow-[0_18px_40px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.1)]" />
          <div className="absolute bottom-6">
            <Brick finishIndex={finishIndex} pressProgress={pressProgress} bounceKey={burstKey} resultTier={resultTier} />
          </div>
        </div>
      </div>
    </div>
  );
});
