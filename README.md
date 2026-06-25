# BRIK

**The World's Most Luxurious Brick** — a cinematic product experience built as a single-page luxury launch site.

Crafted from earth. Refined through fire. Built to inspire.

---

## Overview

BRIK is not a static brochure. It is an immersive scroll-driven story that turns sand into brick, then hands off to a premium landing page with manufacturing craft, interactive product detail, specs, and a playable mini-game.

**Target:** Sell emotion first, proof second — Apple/Tesla-style product storytelling for an everyday material elevated to luxury.

---

## Features

### Cinematic hero
- Pinned full-viewport scroll sequence with **102 AI-generated frames** (sand → brick transformation)
- Three phases: brand intro → transformation film → brick landing reveal
- Canvas image sequence with preloading and progress indicator
- Camera zoom and fade-from-black cinematic intro

### Luxury landing page
- **Hero** — brand statement and scroll cues
- **Manufacturing** — four-step craft journey with animated reveals
- **Showcase** — glass-panel product display with live connector lines and hotspots
- **Specifications** — product specs and magnetic CTAs
- **BRIK Strike** — football-style mini-game (drag, aim, shoot the brick into the goal)
- **Why BRIK**, **Reviews**, and **CTA** sections

### BRIK Strike mini-game
- Matter.js physics on canvas
- Drag-to-aim throw mechanics with wind-up animation
- Moving goalkeeper, goal-post collisions, and net physics
- Score, streak, and high-score tracking
- **Milestone at 5 goals:** *"Strong Brick."* brand message

### Polish & UX
- Lenis smooth scrolling
- GSAP ScrollTrigger animations
- Framer Motion UI transitions
- Cursor spotlight, scroll reveals, flame/gradient effects
- Dark luxury palette (`#050505`, `#B43A28`, `#FFD28A`)

---

## Tech stack

| Layer | Tools |
|--------|--------|
| Framework | [Next.js 16](https://nextjs.org) (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Scroll & motion | GSAP + ScrollTrigger, Lenis, Framer Motion |
| Game physics | Matter.js (canvas) |
| 3D (optional) | React Three Fiber, Drei, Rapier |

---

## Getting started

### Prerequisites
- **Node.js** 20+
- **npm** (or pnpm / yarn)

### Install

```bash
git clone <your-repo-url>
cd b4brick
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

---

## Project structure

```
b4brick/
├── app/                    # Next.js App Router (layout, page, globals)
├── components/
│   ├── hero/               # CinematicHero, intro, landing reveal
│   ├── landing/            # Landing sections + BrickProductDisplay
│   │   ├── game/           # BRIK Strike (FootballGame, physics logic)
│   │   └── sections/       # Hero, Manufacturing, Showcase, etc.
│   ├── image-sequence/     # Canvas frame player + preloader
│   ├── smooth-scroll/      # Lenis provider
│   └── ui/                 # Shared UI (LoadingIndicator, ScrollReveal, …)
├── lib/
│   ├── frames.ts           # Frame paths, scroll distance, index mapping
│   └── brand.ts            # Colors, copy, specs, manufacturing steps
└── public/
    ├── frames/             # 102 PNG transformation frames
    ├── brick.png           # Product brick asset
    └── gameasset/          # Game-related images
```

---

## Configuration

### Frame sequence (`lib/frames.ts`)

| Constant | Description |
|----------|-------------|
| `FRAME_COUNT` | Total frames (102) |
| `FRAME_BASENAME` | PNG filename stem in `/public/frames/` |
| `STORY_SCROLL_DISTANCE` | Pixels of scroll for full sequence (lower = faster) |
| `progressToFrameIndex()` | Maps scroll progress 0–1 → frame index |

### Scroll tuning (`components/hero/CinematicHero.tsx`)

- `INTRO_SCROLL` — hero intro length before transformation
- `REVEAL_SCROLL` — fade into final brick landing
- `scrub` — ScrollTrigger smoothness (lower = snappier)

---

## Assets

Frame files must follow this naming pattern:

```
public/frames/Create_an_ultra_realistic_cin_gwr_video_mvp_000.png
public/frames/Create_an_ultra_realistic_cin_gwr_video_mvp_001.png
…
public/frames/Create_an_ultra_realistic_cin_gwr_video_mvp_101.png
```

All **102 frames** are preloaded on first visit. Expect a short loading screen on slower connections.

---

## Page flow

```
┌─────────────────────┐
│  Cinematic Hero     │  Scroll: intro → 102-frame film → brick reveal
│  (pinned section)   │
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  Landing Page       │  Manufacturing → Showcase → Specs → Game → CTA
│  (smooth scroll)    │
└─────────────────────┘
```

---

## Development notes

- Hero and landing use **dynamic imports** with `ssr: false` for canvas/GSAP compatibility.
- `BrickProductDisplay` connector lines are measured from live DOM positions (resize-safe).
- Mini-game high scores persist in `localStorage` under `brik-football-high-score`.
- See `AGENTS.md` for Next.js 16 conventions used in this repo.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | Run ESLint |

---

## License

Private competition project. All rights reserved unless otherwise specified by the competition organizers.

---

**BRIK** — *Forged under pressure. Built to endure generations.*
