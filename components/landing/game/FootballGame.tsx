"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { motion, AnimatePresence } from "framer-motion";
import {
  BRICK_H,
  BRICK_W,
  FIELD_H,
  FIELD_W,
  GOAL_CROSSBAR_Y,
  GOAL_LINE_Y,
  GOAL_NET_DEPTH,
  GOAL_POST_W,
  GOAL_WIDTH,
  MILESTONE_COPY,
  MILESTONE_GOALS,
  ROUND_TIME_SEC,
  SHOTS_PER_ROUND,
  clamp,
  getGoalBounds,
  getGoalGeometry,
  isInsideGoalMouth,
  loadHighScore,
  saveHighScore,
  scoreShot,
  type GamePhase,
  type ShotResult,
} from "./footballGameLogic";

const { Engine, Bodies, Body, Composite, Events } = Matter;

const KICKOFF_Y = FIELD_H - 70;
const TRAIL_LEN = 10;
const WINDUP_MS = 100;
const MIN_DRAG = 8;
const MAX_DRAG = 72;
const AIM_PREVIEW_SCALE = 1.25;

function launchVelocity(power: number, nx: number, ny: number) {
  const t = clamp((power - MIN_DRAG) / (MAX_DRAG - MIN_DRAG), 0, 1);
  const speed = 14 + t * 20;
  return { x: nx * speed * 0.72, y: ny * speed };
}

interface AimState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

interface ThrowAnim {
  t0: number;
  pullNx: number;
  pullNy: number;
  launchNx: number;
  launchNy: number;
  power: number;
  angularVel: number;
  launched: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

interface TrailPoint {
  x: number;
  y: number;
  angle: number;
}

/**
 * BRIK STRIKE — drag back and release to kick the brick into the goal.
 */
export function FootballGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const ballRef = useRef<Matter.Body | null>(null);
  const keeperRef = useRef<Matter.Body | null>(null);
  const rafRef = useRef(0);
  const scaleRef = useRef(1);
  const aimRef = useRef<AimState | null>(null);
  const phaseRef = useRef<GamePhase>("ready");
  const keeperDirRef = useRef(1);
  const brickImgRef = useRef<HTMLImageElement | null>(null);
  const throwAnimRef = useRef<ThrowAnim | null>(null);
  const trailRef = useRef<TrailPoint[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const aimTiltRef = useRef(0);
  const scoredShotRef = useRef(false);
  const flightStartRef = useRef(0);

  const [phase, setPhase] = useState<GamePhase>("ready");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [shotsLeft, setShotsLeft] = useState(SHOTS_PER_ROUND);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME_SEC);
  const [highScore, setHighScore] = useState(0);
  const [lastResult, setLastResult] = useState<ShotResult | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [goalsScored, setGoalsScored] = useState(0);
  const [showMilestone, setShowMilestone] = useState(false);

  const setPhaseSafe = useCallback((p: GamePhase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const resetBall = useCallback(() => {
    const ball = ballRef.current;
    if (!ball) return;
    throwAnimRef.current = null;
    trailRef.current = [];
    aimTiltRef.current = 0;
    scoredShotRef.current = false;
    Body.setPosition(ball, { x: FIELD_W / 2, y: KICKOFF_Y });
    Body.setVelocity(ball, { x: 0, y: 0 });
    Body.setAngularVelocity(ball, 0);
    Body.setAngle(ball, 0);
  }, []);

  const spawnLaunchParticles = useCallback((x: number, y: number, nx: number, ny: number) => {
    const parts: Particle[] = [];
    for (let i = 0; i < 14; i++) {
      const spread = (Math.random() - 0.5) * 1.4;
      parts.push({
        x,
        y,
        vx: nx * (2 + Math.random() * 3) + spread,
        vy: ny * (2 + Math.random() * 3) + spread,
        life: 1,
        maxLife: 0.35 + Math.random() * 0.35,
        size: 2 + Math.random() * 4,
      });
    }
    particlesRef.current = parts;
  }, []);

  const initPhysics = useCallback(() => {
    const engine = Engine.create({ gravity: { x: 0, y: 1, scale: 0.001 } });
    engineRef.current = engine;

    const wallOpts = { isStatic: true, restitution: 0.35, friction: 0.03 };
    const ground = Bodies.rectangle(FIELD_W / 2, FIELD_H + 20, FIELD_W + 100, 40, wallOpts);
    const left = Bodies.rectangle(-20, FIELD_H / 2, 40, FIELD_H + 100, wallOpts);
    const right = Bodies.rectangle(FIELD_W + 20, FIELD_H / 2, 40, FIELD_H + 100, wallOpts);

    const g = getGoalGeometry(FIELD_W);
    const postH = GOAL_LINE_Y - GOAL_CROSSBAR_Y + 8;
    const postCY = GOAL_CROSSBAR_Y + postH / 2 + 2;

    const postL = Bodies.rectangle(g.left + GOAL_POST_W / 2, postCY, GOAL_POST_W, postH, {
      ...wallOpts,
      label: "post",
      chamfer: { radius: 2 },
    });
    const postR = Bodies.rectangle(g.right - GOAL_POST_W / 2, postCY, GOAL_POST_W, postH, {
      ...wallOpts,
      label: "post",
      chamfer: { radius: 2 },
    });
    const crossbar = Bodies.rectangle(g.cx, GOAL_CROSSBAR_Y, GOAL_WIDTH, 8, {
      ...wallOpts,
      label: "crossbar",
      chamfer: { radius: 2 },
    });

    const mouth = getGoalBounds(FIELD_W);
    const sensorH = GOAL_LINE_Y - mouth.top + 6;
    const goalSensor = Bodies.rectangle(g.cx, mouth.top + sensorH / 2, mouth.right - mouth.left, sensorH, {
      isStatic: true,
      isSensor: true,
      label: "goalSensor",
    });

    const netBackY = g.netBackY;
    const netBack = Bodies.rectangle(g.cx, netBackY, GOAL_WIDTH - GOAL_POST_W, 10, {
      isStatic: true,
      restitution: 0.15,
      friction: 0.4,
      label: "net",
    });
    const netL = Bodies.rectangle(mouth.left + 4, (mouth.top + netBackY) / 2, 6, mouth.top - netBackY + 20, {
      isStatic: true,
      restitution: 0.2,
      friction: 0.3,
      label: "net",
    });
    const netR = Bodies.rectangle(mouth.right - 4, (mouth.top + netBackY) / 2, 6, mouth.top - netBackY + 20, {
      isStatic: true,
      restitution: 0.2,
      friction: 0.3,
      label: "net",
    });

    const ball = Bodies.rectangle(FIELD_W / 2, KICKOFF_Y, BRICK_W, BRICK_H, {
      chamfer: { radius: 4 },
      restitution: 0.38,
      friction: 0.02,
      frictionAir: 0.006,
      density: 0.0025,
      label: "ball",
    });
    ballRef.current = ball;

    const keeper = Bodies.rectangle(g.cx, GOAL_LINE_Y + 6, 58, 12, {
      isStatic: true,
      label: "keeper",
      friction: 0,
      restitution: 0.2,
    });
    keeperRef.current = keeper;

    Composite.add(engine.world, [
      ground,
      left,
      right,
      postL,
      postR,
      crossbar,
      goalSensor,
      netBack,
      netL,
      netR,
      ball,
      keeper,
    ]);

    Events.on(engine, "collisionStart", (e) => {
      if (phaseRef.current !== "flying" && phaseRef.current !== "goal") return;
      for (const pair of e.pairs) {
        const labels = [pair.bodyA.label, pair.bodyB.label];
        const hasBall = labels.includes("ball");
        if (!hasBall) continue;

        if (labels.includes("keeper") && phaseRef.current === "flying" && !scoredShotRef.current) {
          handleMissRef.current?.();
        }
        if (labels.includes("goalSensor") && !scoredShotRef.current) {
          const b = ballRef.current;
          if (b && isInsideGoalMouth(b.position.x, b.position.y, FIELD_W)) {
            scoredShotRef.current = true;
            handleGoalRef.current?.(scoreShot(b.position.x, FIELD_W));
          }
        }
      }
    });

    return () => {
      Engine.clear(engine);
    };
  }, []);

  const handleMissRef = useRef<() => void>(() => {});
  const handleGoalRef = useRef<(result: ShotResult) => void>(() => {});

  const handleMiss = useCallback(() => {
    if (phaseRef.current !== "flying") return;
    setStreak(0);
    setLastResult({ scored: false, points: 0, label: "SAVED!" });
    setPhaseSafe("miss");
    setTimeout(() => {
      resetBall();
      setPhaseSafe("aiming");
    }, 900);
  }, [resetBall, setPhaseSafe]);

  const handleGoal = useCallback(
    (result: ShotResult) => {
      if (phaseRef.current !== "flying") return;
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 600);
      setLastResult(result);
      setScore((s) => {
        const next = s + result.points;
        saveHighScore(next);
        setHighScore((h) => Math.max(h, next));
        return next;
      });
      setStreak((st) => st + 1);
      setGoalsScored((g) => {
        const next = g + 1;
        if (next >= MILESTONE_GOALS) {
          setShowMilestone(true);
          setTimeout(() => setShowMilestone(false), 4000);
        }
        return next;
      });
      setPhaseSafe("goal");
      setTimeout(() => {
        resetBall();
        setPhaseSafe("aiming");
      }, 1600);
    },
    [resetBall, setPhaseSafe],
  );

  useEffect(() => {
    handleMissRef.current = handleMiss;
    handleGoalRef.current = handleGoal;
  }, [handleMiss, handleGoal]);

  useEffect(() => {
    setHighScore(loadHighScore());
    const img = new Image();
    img.src = "/brick.webp";
    img.onload = () => {
      brickImgRef.current = img;
    };
    return initPhysics();
  }, [initPhysics]);

  const startRound = useCallback(() => {
    setScore(0);
    setStreak(0);
    setGoalsScored(0);
    setShowMilestone(false);
    setShotsLeft(SHOTS_PER_ROUND);
    setTimeLeft(ROUND_TIME_SEC);
    setLastResult(null);
    resetBall();
    setPhaseSafe("aiming");
  }, [resetBall, setPhaseSafe]);

  useEffect(() => {
    if (phase !== "aiming" && phase !== "flying" && phase !== "winding" && phase !== "goal") return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          setPhaseSafe("roundOver");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, setPhaseSafe]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      scaleRef.current = rect.width / FIELD_W;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const s = scaleRef.current;
      const w = FIELD_W * s;
      const h = FIELD_H * s;
      const engine = engineRef.current;
      const ball = ballRef.current;
      const keeper = keeperRef.current;

      if (keeper && (phaseRef.current === "aiming" || phaseRef.current === "winding" || phaseRef.current === "flying")) {
        const speed = 1.6 + Math.min(score / 10, 2);
        let nx = keeper.position.x + keeperDirRef.current * speed;
        const mouth = getGoalBounds(FIELD_W);
        const minX = mouth.left + 22;
        const maxX = mouth.right - 22;
        if (nx < minX || nx > maxX) keeperDirRef.current *= -1;
        Body.setPosition(keeper, { x: clamp(nx, minX, maxX), y: GOAL_LINE_Y + 6 });
      }

      if (ball && phaseRef.current === "aiming") {
        Body.setPosition(ball, { x: FIELD_W / 2, y: KICKOFF_Y });
        Body.setVelocity(ball, { x: 0, y: 0 });
        Body.setAngularVelocity(ball, 0);
      }

      const throwAnim = throwAnimRef.current;
      if (ball && throwAnim && phaseRef.current === "winding") {
        const elapsed = performance.now() - throwAnim.t0;
        const t = clamp(elapsed / WINDUP_MS, 0, 1);

        if (t < 0.5) {
          const ease = (t / 0.5) ** 2;
          const pull = 12 * ease;
          Body.setPosition(ball, {
            x: FIELD_W / 2 - throwAnim.pullNx * pull,
            y: KICKOFF_Y - throwAnim.pullNy * pull,
          });
          Body.setVelocity(ball, { x: 0, y: 0 });
          aimTiltRef.current = Math.atan2(throwAnim.pullNy, throwAnim.pullNx) * 0.45 * ease;
        } else if (!throwAnim.launched) {
          throwAnim.launched = true;
          Body.setPosition(ball, { x: FIELD_W / 2, y: KICKOFF_Y });
          const vel = launchVelocity(throwAnim.power, throwAnim.launchNx, throwAnim.launchNy);
          Body.setVelocity(ball, vel);
          Body.setAngularVelocity(ball, throwAnim.angularVel);
          spawnLaunchParticles(FIELD_W / 2, KICKOFF_Y, throwAnim.launchNx, throwAnim.launchNy);
          trailRef.current = [];
          throwAnimRef.current = null;
          flightStartRef.current = performance.now();
          setPhaseSafe("flying");
        }
      } else if (engine && (phaseRef.current === "flying" || phaseRef.current === "goal")) {
        Engine.update(engine, 1000 / 60);
      }

      if (ball && phaseRef.current === "flying") {
        const trail = trailRef.current;
        trail.push({ x: ball.position.x, y: ball.position.y, angle: ball.angle });
        if (trail.length > TRAIL_LEN) trail.shift();

        if (
          !scoredShotRef.current &&
          isInsideGoalMouth(ball.position.x, ball.position.y, FIELD_W) &&
          ball.velocity.y < 0
        ) {
          scoredShotRef.current = true;
          handleGoalRef.current?.(scoreShot(ball.position.x, FIELD_W));
        }

        const outOfPlay =
          ball.position.y > FIELD_H - 55 ||
          ball.position.x < -10 ||
          ball.position.x > FIELD_W + 10;
        const stalled =
          performance.now() - flightStartRef.current > 700 &&
          Math.hypot(ball.velocity.x, ball.velocity.y) < 0.4 &&
          ball.position.y > GOAL_LINE_Y + 30;

        if ((outOfPlay || stalled) && !scoredShotRef.current) {
          setStreak(0);
          setLastResult({ scored: false, points: 0, label: "MISS" });
          setPhaseSafe("miss");
          setTimeout(() => {
            resetBall();
            setPhaseSafe("aiming");
          }, 800);
        }
      }

      if (ball && phaseRef.current === "goal") {
        const trail = trailRef.current;
        trail.push({ x: ball.position.x, y: ball.position.y, angle: ball.angle });
        if (trail.length > TRAIL_LEN) trail.shift();
      }

      particlesRef.current = particlesRef.current
        .map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.12,
          life: p.life - 0.045,
        }))
        .filter((p) => p.life > 0);

      ctx.clearRect(0, 0, w, h);

      const grd = ctx.createLinearGradient(0, 0, 0, h);
      grd.addColorStop(0, "#0a1f12");
      grd.addColorStop(0.4, "#0d2818");
      grd.addColorStop(1, "#071510");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 2 * s;
      ctx.strokeRect(16 * s, 16 * s, w - 32 * s, h - 32 * s);
      ctx.beginPath();
      ctx.moveTo(w / 2, 16 * s);
      ctx.lineTo(w / 2, h - 16 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 50 * s, 0, Math.PI * 2);
      ctx.stroke();

      const g = getGoalGeometry(FIELD_W);
      const mouth = getGoalBounds(FIELD_W);
      const gx = g.cx * s;
      const gl = g.left * s;
      const gr = g.right * s;
      const postTop = GOAL_CROSSBAR_Y * s;
      const postBot = GOAL_LINE_Y * s;

      ctx.strokeStyle = "rgba(255,210,138,0.85)";
      ctx.lineWidth = 5 * s;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(gl, postTop);
      ctx.lineTo(gl, postBot);
      ctx.moveTo(gr, postTop);
      ctx.lineTo(gr, postBot);
      ctx.moveTo(gl, postTop);
      ctx.lineTo(gr, postTop);
      ctx.stroke();

      const netTop = g.netBackY * s;
      ctx.strokeStyle = "rgba(255,255,255,0.14)";
      ctx.lineWidth = 1 * s;
      for (let i = 0; i <= 7; i++) {
        const t = i / 7;
        const x = (mouth.left + (mouth.right - mouth.left) * t) * s;
        ctx.beginPath();
        ctx.moveTo(x, postTop + 4 * s);
        ctx.lineTo(g.cx * s + (x - gx) * 0.15, netTop);
        ctx.stroke();
      }
      for (let j = 0; j <= 4; j++) {
        const y = postTop + ((netTop - postTop) * j) / 4;
        ctx.beginPath();
        ctx.moveTo(mouth.left * s, y);
        ctx.lineTo(mouth.right * s, y);
        ctx.stroke();
      }

      ctx.fillStyle = "rgba(255,210,138,0.06)";
      ctx.fillRect(mouth.left * s, postTop, (mouth.right - mouth.left) * s, postBot - postTop);

      if (keeper) {
        const kx = keeper.position.x * s;
        const ky = keeper.position.y * s;
        ctx.fillStyle = "#ffd28a";
        ctx.shadowColor = "#ff5f00";
        ctx.shadowBlur = 12;
        ctx.fillRect(kx - 28 * s, ky - 7 * s, 56 * s, 14 * s);
        ctx.shadowBlur = 0;
      }

      for (const p of particlesRef.current) {
        const alpha = p.life / p.maxLife;
        ctx.fillStyle = `rgba(255,${140 + Math.floor(alpha * 70)},${60 + Math.floor(alpha * 40)},${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x * s, p.y * s, p.size * s * alpha, 0, Math.PI * 2);
        ctx.fill();
      }

      if (ball && (phaseRef.current === "flying" || phaseRef.current === "goal")) {
        const trail = trailRef.current;
        for (let i = 0; i < trail.length - 1; i++) {
          const pt = trail[i];
          const alpha = (i + 1) / trail.length * 0.35;
          drawBrickSprite(ctx, pt.x * s, pt.y * s, pt.angle, s, brickImgRef.current, {
            alpha,
            stretch: 1,
          });
        }
      }

      if (ball) {
        const bx = ball.position.x;
        const by = ball.position.y;
        const speed = Math.hypot(ball.velocity.x, ball.velocity.y);
        const stretch =
          phaseRef.current === "flying" || phaseRef.current === "goal"
            ? 1 + clamp(speed * 0.04, 0, 0.35)
            : 1;
        const extraTilt =
          phaseRef.current === "aiming" || phaseRef.current === "winding" ? aimTiltRef.current : 0;
        const drawAngle = ball.angle + extraTilt;
        const glowing =
          phaseRef.current === "winding" ||
          ((phaseRef.current === "flying" || phaseRef.current === "goal") && speed > 4);

        drawBrickSprite(ctx, bx * s, by * s, drawAngle, s, brickImgRef.current, {
          stretch,
          glow: glowing,
        });
      }

      const aim = aimRef.current;
      if (aim && phaseRef.current === "aiming") {
        const bx = FIELD_W / 2;
        const by = KICKOFF_Y;
        const dx = aim.startX - aim.currentX;
        const dy = aim.startY - aim.currentY;
        const power = clamp(Math.hypot(dx, dy), 0, MAX_DRAG);
        const nx = dx / (power || 1);
        const ny = dy / (power || 1);
        const targetTilt = Math.atan2(dy, dx) * 0.35 * (power / MAX_DRAG);
        aimTiltRef.current += (targetTilt - aimTiltRef.current) * 0.2;

        ctx.strokeStyle = `rgba(255,210,138,${0.35 + power / 160})`;
        ctx.lineWidth = 3 * s;
        ctx.setLineDash([6 * s, 6 * s]);
        ctx.beginPath();
        ctx.moveTo(bx * s, by * s);
        ctx.lineTo((bx + nx * power * AIM_PREVIEW_SCALE) * s, (by + ny * power * AIM_PREVIEW_SCALE) * s);
        ctx.stroke();
        ctx.setLineDash([]);

        const arcSteps = 6;
        for (let i = 1; i <= arcSteps; i++) {
          const f = i / arcSteps;
          const ax = bx + nx * power * AIM_PREVIEW_SCALE * f;
          const ay = by + ny * power * AIM_PREVIEW_SCALE * f - 18 * f * f;
          ctx.fillStyle = `rgba(255,210,138,${0.08 + f * 0.12})`;
          ctx.beginPath();
          ctx.arc(ax * s, ay * s, (3 + f * 2) * s, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = "rgba(255,95,0,0.55)";
        ctx.beginPath();
        ctx.arc(aim.currentX * s, aim.currentY * s, 8 * s, 0, Math.PI * 2);
        ctx.fill();
      } else if (phaseRef.current === "aiming") {
        aimTiltRef.current *= 0.85;
      }

      if (celebrate) {
        ctx.fillStyle = "rgba(255,210,138,0.15)";
        ctx.fillRect(0, 0, w, h);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [celebrate, resetBall, score, setPhaseSafe, spawnLaunchParticles]);

  const pointerToField = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: FIELD_W / 2, y: KICKOFF_Y };
    const rect = canvas.getBoundingClientRect();
    const s = scaleRef.current;
    return {
      x: clamp((clientX - rect.left) / s, 40, FIELD_W - 40),
      y: clamp((clientY - rect.top) / s, 40, FIELD_H - 40),
    };
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (phaseRef.current !== "aiming") return;
      const p = pointerToField(e.clientX, e.clientY);
      const aim = {
        startX: FIELD_W / 2,
        startY: KICKOFF_Y,
        currentX: p.x,
        currentY: p.y,
      };
      aimRef.current = aim;
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [pointerToField],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!aimRef.current || phaseRef.current !== "aiming") return;
      const p = pointerToField(e.clientX, e.clientY);
      aimRef.current = { ...aimRef.current, currentX: p.x, currentY: p.y };
    },
    [pointerToField],
  );

  const onPointerUp = useCallback(() => {
    const aim = aimRef.current;
    if (!aim || phaseRef.current !== "aiming") return;
    aimRef.current = null;

    const dx = aim.startX - aim.currentX;
    const dy = aim.startY - aim.currentY;
    const power = clamp(Math.hypot(dx, dy), MIN_DRAG, MAX_DRAG);
    if (power < MIN_DRAG) return;

    const ball = ballRef.current;
    if (!ball) return;

    const nx = dx / power;
    const ny = dy / power;

    throwAnimRef.current = {
      t0: performance.now(),
      pullNx: nx,
      pullNy: ny,
      launchNx: nx,
      launchNy: ny,
      power,
      angularVel: nx * 0.38 + (Math.random() - 0.5) * 0.1,
      launched: false,
    };

    setShotsLeft((s) => Math.max(0, s - 1));
    setPhaseSafe("winding");
  }, [setPhaseSafe]);

  return (
    <div className="overflow-hidden rounded-[calc(2rem-2px)] bg-[#050505] select-none">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 px-4 py-3 md:px-6">
        <div className="flex gap-6 md:gap-10">
          <Stat label="Score" value={String(score)} accent />
          <Stat label="Goals" value={`${goalsScored}/${MILESTONE_GOALS}`} highlight={goalsScored >= 3} />
          <Stat label="Streak" value={`×${streak}`} highlight={streak >= 2} />
          <Stat label="Shots" value={String(shotsLeft)} />
          <Stat label="Time" value={`${timeLeft}s`} warn={timeLeft <= 10 && phase !== "ready"} />
        </div>
        <Stat label="Best" value={String(highScore)} />
      </div>

      <div className="relative px-4 py-4 md:px-6 md:py-6">
        <p className="text-xs tracking-[0.36em] text-[#d66a3d] uppercase">BRIK Strike</p>
        <h3 className="font-display mt-2 text-2xl font-bold text-white md:text-3xl">
          Kick the Brick. Score the Goal.
        </h3>
        <p className="mt-2 text-sm text-[#bdbdbd]">
          Short drag back from the brick, then release. A small pull is enough to shoot.
        </p>

        <div
          ref={containerRef}
          className="relative mt-6 aspect-[720/520] w-full overflow-hidden rounded-2xl border border-white/10 touch-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <canvas ref={canvasRef} className="block h-full w-full cursor-crosshair" />
        </div>

        <AnimatePresence>
          {showMilestone && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-black/70 px-6 backdrop-blur-md"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.88, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -12 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-md rounded-3xl border border-[#ffd28a]/30 bg-[#0a0a0a]/90 px-8 py-10 text-center shadow-[0_0_80px_rgba(255,210,138,0.12)]"
              >
                <p className="text-[10px] tracking-[0.45em] text-[#d66a3d] uppercase">
                  {MILESTONE_COPY.eyebrow}
                </p>
                <h4 className="font-display mt-4 text-4xl font-bold tracking-tight text-[#ffd28a] md:text-5xl">
                  {MILESTONE_COPY.headline}
                </h4>
                <p className="mt-5 text-base leading-relaxed text-white/90 md:text-lg">
                  {MILESTONE_COPY.body}
                </p>
                <p className="mt-4 text-sm tracking-wide text-[#bdbdbd]/80">
                  {MILESTONE_COPY.tagline}
                </p>
                <div className="mx-auto mt-6 h-px w-16 bg-gradient-to-r from-transparent via-[#b43a28] to-transparent" />
                <p className="mt-4 font-display text-sm tracking-[0.5em] text-white/50 uppercase">
                  BRIK
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {lastResult && (phase === "goal" || phase === "miss") && !showMilestone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-2xl border px-8 py-4 text-center backdrop-blur-md ${
                lastResult.scored
                  ? "border-[#ffd28a]/40 bg-black/80"
                  : "border-red-400/30 bg-black/80"
              }`}
            >
              <p
                className={`font-display text-3xl font-bold md:text-4xl ${
                  lastResult.scored ? "text-[#ffd28a]" : "text-red-300"
                }`}
              >
                {lastResult.label}
              </p>
              {lastResult.points > 0 && (
                <p className="mt-1 font-mono text-white">+{lastResult.points} pts</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {(phase === "ready" || phase === "roundOver") && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm">
            <p className="game-feature-badge inline-flex items-center gap-2 rounded-full border border-[#ffd28a]/30 bg-[#ffd28a]/10 px-4 py-1.5 text-[10px] tracking-[0.38em] text-[#ffd28a] uppercase">
              <span className="game-live-dot h-1.5 w-1.5 rounded-full bg-[#ff5f00]" />
              Featured Mini-Game
            </p>
            <h4 className="font-display mt-5 text-3xl font-bold text-white md:text-4xl">
              {phase === "roundOver" ? "Time!" : "BRIK Strike"}
            </h4>
            {phase === "roundOver" && (
              <p className="mt-4 font-mono text-2xl text-[#ffd28a]">{score} points</p>
            )}
            <p className="mt-4 max-w-sm text-center text-sm text-[#bdbdbd]">
              {ROUND_TIME_SEC}s · {SHOTS_PER_ROUND} shots · Center goals = 3 pts
            </p>
            {highScore > 0 && (
              <p className="mt-2 text-sm text-[#bdbdbd]/70">High score: {highScore}</p>
            )}
            <button
              type="button"
              onClick={startRound}
              className="btn-glow-animated mt-8 rounded-full bg-[#b43a28] px-10 py-4 text-sm font-semibold tracking-widest text-white uppercase"
            >
              {phase === "roundOver" ? "Play Again" : "Kick Off"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function drawBrickSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  scale: number,
  img: HTMLImageElement | null,
  opts?: { alpha?: number; stretch?: number; glow?: boolean },
) {
  const bw = BRICK_W * scale;
  const bh = BRICK_H * scale;
  const stretch = opts?.stretch ?? 1;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalAlpha = opts?.alpha ?? 1;

  if (opts?.glow) {
    ctx.shadowColor = "rgba(255,95,0,0.65)";
    ctx.shadowBlur = 20 * scale;
  }

  ctx.scale(stretch, 1 / stretch);

  if (img?.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, -bw / 2, -bh / 2, bw, bh);
  } else {
    ctx.fillStyle = "#b43a28";
    ctx.beginPath();
    ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 4 * scale);
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.font = `bold ${10 * scale}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("BRIK", 0, 4 * scale);
  }

  ctx.restore();
}

function Stat({
  label,
  value,
  accent,
  highlight,
  warn,
}: {
  label: string;
  value: string;
  accent?: boolean;
  highlight?: boolean;
  warn?: boolean;
}) {
  return (
    <div>
      <p className="text-[9px] tracking-widest text-[#bdbdbd]/50 uppercase">{label}</p>
      <p
        className={`font-mono text-sm font-bold md:text-base ${
          warn ? "text-red-400" : highlight ? "text-[#ff5f00]" : accent ? "text-[#ffd28a]" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
