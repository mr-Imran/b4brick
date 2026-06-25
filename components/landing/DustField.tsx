"use client";

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${((i * 41 + 9) % 96) + 2}%`,
  top: `${((i * 29 + 17) % 90) + 5}%`,
  size: 1 + (i % 2) * 0.5,
  delay: (i % 6) * 0.7,
  duration: 12 + (i % 4) * 3,
  opacity: 0.1 + (i % 3) * 0.06,
}));

export function DustField() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {PARTICLES.map((p) => (
        <span
          key={p.id}
          className="dust-particle absolute rounded-full bg-white"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
