"use client";

/** Pre-generated ember positions */
const EMBERS = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  left: `${8 + ((i * 23) % 84)}%`,
  delay: (i % 8) * 0.35,
  duration: 2.5 + (i % 4) * 0.6,
  size: 2 + (i % 3),
}));

interface FlameEffectProps {
  className?: string;
  /** subtle = intro hero, intense = landing hero */
  intensity?: "subtle" | "intense";
}

/**
 * CSS flame tongues + rising embers. No canvas — 60 FPS friendly.
 */
export function FlameEffect({
  className = "",
  intensity = "subtle",
}: FlameEffectProps) {
  const isIntense = intensity === "intense";

  return (
    <div
      className={`pointer-events-none absolute right-0 bottom-0 left-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Kiln floor glow */}
      <div
        className={`flame-floor-glow absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full blur-3xl ${
          isIntense ? "h-40 w-[90%]" : "h-28 w-[70%]"
        }`}
      />

      {/* Flame tongues */}
      <div className={`flame-group absolute bottom-0 left-1/2 -translate-x-1/2 ${isIntense ? "h-56 w-full max-w-3xl" : "h-36 w-full max-w-xl"}`}>
        <div className="flame-tongue flame-tongue-1" />
        <div className="flame-tongue flame-tongue-2" />
        <div className="flame-tongue flame-tongue-3" />
        {isIntense && <div className="flame-tongue flame-tongue-4" />}
      </div>

      {/* Rising embers */}
      <div className={`absolute bottom-8 left-0 w-full ${isIntense ? "h-48" : "h-32"}`}>
        {EMBERS.map((e) => (
          <span
            key={e.id}
            className="ember absolute bottom-0 rounded-full"
            style={{
              left: e.left,
              width: e.size,
              height: e.size,
              animationDelay: `${e.delay}s`,
              animationDuration: `${e.duration}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
