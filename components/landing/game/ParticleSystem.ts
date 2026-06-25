export interface ParticleSpec {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  gravity: number;
}

export interface ParticleBurstOptions {
  count: number;
  originX: number;
  originY: number;
  spread?: number;
  speedMin?: number;
  speedMax?: number;
  sizeMin?: number;
  sizeMax?: number;
  color: string;
  gravity?: number;
  lifeMin?: number;
  lifeMax?: number;
}

export function createBurst(options: ParticleBurstOptions): ParticleSpec[] {
  const {
    count,
    originX,
    originY,
    spread = Math.PI,
    speedMin = 20,
    speedMax = 120,
    sizeMin = 1,
    sizeMax = 4,
    gravity = 140,
    lifeMin = 0.45,
    lifeMax = 0.9,
    color,
  } = options;

  return Array.from({ length: count }, () => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * spread;
    const speed = speedMin + Math.random() * (speedMax - speedMin);
    return {
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: sizeMin + Math.random() * (sizeMax - sizeMin),
      life: lifeMin + Math.random() * (lifeMax - lifeMin),
      maxLife: lifeMin + Math.random() * (lifeMax - lifeMin),
      color,
      gravity,
    };
  });
}

export function stepParticles(particles: ParticleSpec[], dt: number): ParticleSpec[] {
  return particles
    .map((particle) => {
      const nextLife = particle.life - dt;
      const vx = particle.vx * 0.985;
      const vy = particle.vy + particle.gravity * dt;
      return {
        ...particle,
        x: particle.x + vx * dt,
        y: particle.y + vy * dt,
        vx,
        vy,
        life: nextLife,
      };
    })
    .filter((particle) => particle.life > 0);
}
