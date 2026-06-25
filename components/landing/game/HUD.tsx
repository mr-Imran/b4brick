"use client";

import { memo } from "react";

interface HUDProps {
  xp: number;
  perfectPresses: number;
  level: number;
  pressure: number;
  target: number;
}

export const HUD = memo(function HUD({ xp, perfectPresses, level, pressure, target }: HUDProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex flex-wrap items-start justify-between gap-4 p-4 md:p-6">
      <div className="glass-strong pointer-events-auto rounded-2xl px-4 py-3">
        <div className="grid grid-cols-3 gap-6">
          <HudItem label="XP" value={xp.toLocaleString()} accent />
          <HudItem label="Perfect" value={String(perfectPresses)} />
          <HudItem label="Level" value={String(level)} />
        </div>
      </div>

      <div className="glass-strong pointer-events-auto rounded-2xl px-4 py-3">
        <div className="grid grid-cols-2 gap-6">
          <HudItem label="Target" value={`${target}%`} accent />
          <HudItem label="Current" value={`${Math.round(pressure)}%`} />
        </div>
      </div>
    </div>
  );
});

function HudItem({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.28em] text-[#bdbdbd]/60 uppercase">{label}</p>
      <p className={`mt-1 font-mono text-lg font-bold ${accent ? "text-[#ffd28a]" : "text-white"}`}>{value}</p>
    </div>
  );
}
