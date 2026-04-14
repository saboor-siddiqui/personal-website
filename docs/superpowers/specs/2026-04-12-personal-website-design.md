# Saboor Siddiqui — Personal Website Design Spec
**Date:** 2026-04-12  
**Status:** Approved by user

---

## 1. Overview

A single-page personal website for Saboor Siddiqui — Data Engineer & Cloud Solutions Architect at American Express. The site is a premium product-launch-grade page inspired by [antigravity.google](https://antigravity.google/) and [Apple iPad Pro](https://www.apple.com/in/ipad-pro/). It uses only HTML, CSS, and vanilla JavaScript — no frameworks, no libraries.

**Vibe:** Cinematic dark, physically reactive, premium without being cold.

---

## 2. Real Content (from GitHub + LinkedIn)

### Identity
- **Name:** Saboor Siddiqui
- **Tagline:** "Friendly Neighborhood Engineer"
- **Role:** Data Engineer · Cloud Solutions Architect
- **Company:** American Express (current)
- **Previous:** Paytm — "Rising Rockstar" award for optimizing reporting pipelines
- **Location:** Gurugram, Haryana, India
- **Education:** Babu Banarasi Das Engineering College (2018–2022, GPA 8.2)

### GitHub
- [github.com/saboor-siddiqui](https://github.com/saboor-siddiqui)

### LinkedIn
- [linkedin.com/in/saboor-siddiqui-6a0659188](https://www.linkedin.com/in/saboor-siddiqui-6a0659188/)

### Key Projects (for features/work section)
| Project | What it does | Stack |
|---------|-------------|-------|
| **RADAR** | LangGraph-powered AI agent that automatically reviews GitHub PRs | Python, LangGraph |
| **FLARE** | AI triage agent for Airflow pipeline failures — self-hosted, lightweight | Python, Airflow |
| **RAGGY** | Debugging framework for RAG pipelines | Python, LLMs |
| **spark_2_sql** | Converts Spark DataFrame API code to SQL | Python, Spark |
| **BQ-SQL-Optimizer** | BigQuery SQL optimization tooling | Python, BigQuery |
| **ScalaLineageParser** | Data lineage extraction from Scala code | Scala |

### Features Section Content (3 panels)
1. **AI Agent Engineering** — Building LLM-powered systems that automate complex engineering workflows. RADAR, FLARE, RAGGY.
2. **Data Engineering at Scale** — Architecting pipelines at American Express. "Rising Rockstar" at Paytm for dramatically improving reporting pipeline performance.
3. **Cloud & Architecture** — Cloud solutions architecture: distributed systems, BigQuery, Spark, scalable data infrastructure.

---

## 3. Visual Design

### Palette
- Background: `#060608` (near-black with a faint blue cast)
- Text primary: `#ffffff`
- Text secondary: `rgba(255,255,255,0.25–0.45)`
- Borders/dividers: `rgba(255,255,255,0.04–0.06)`
- Accent: none — pure monochrome. Depth through luminance, not hue.
- Particles/shapes: white at varying opacities

### Typography
- Font: `-apple-system, 'Inter', 'SF Pro Display', sans-serif`
- Hero name first line: 800 weight, `clamp(80px, 11.5vw, 168px)`, tight tracking (`-0.05em`)
- Hero name second line: 100 weight, same size, `rgba(255,255,255,0.1)` — whisper of the surname
- Eyebrow labels: `10–11px`, `letter-spacing: 5–6px`, `text-transform: uppercase`
- Body: `14–15px`, `line-height: 1.75–1.8`, `rgba(255,255,255,0.32)`

### Sections
1. **Hero** — full viewport, antigravity particle field, name + tagline + CTAs
2. **Stats row** — 3-column grid: `4+` Years of Engineering · `3` AI Agents Shipped · `∞` Pipelines Debugged
3. **Sticky scroll features** — left: live particle canvas; right: 3 feature panels scroll-highlighted
4. **CTA** — centered, white button to LinkedIn, ghost button to GitHub
5. **Footer** — minimal, single line

---

## 4. Animation System

### Hero: Gravity Field Particles
- **Count:** 110–140 particles
- **Types:** dots, rings (circle outlines), crosses (+), wireframe triangles
- **Depth layers:** 3 layers (z=0 far/dim, z=0.5 mid, z=1 near/bright)
- **Physics:**
  - Each particle has `(x, y, vx, vy, mass, z, homeX, homeY)`
  - **Repulsion zone:** `dist < 140px` → antigravity: push away hard
  - **Attraction zone:** `dist 140–500px` → gentle gravity pull toward mouse
  - **Dead zone:** `dist > 500px` → soft spring return to home position
  - **Damping:** `0.955` per frame (smooth deceleration)
  - **Angular velocity:** particles rotate slowly as they move
- **Connections:** faint lines between particles `< 95px` apart, opacity proportional to closeness
- **More reactive than mockup:** increase `GRAVITY_PULL` to `10000`, `REPEL_STRENGTH` to `14000`, `REPEL_DIST` to `140`

### Text Entrance (on load)
- Staggered `fadeUp` animation: `cubic-bezier(0.16, 1, 0.3, 1)`, 1.4s duration
- Delays: eyebrow 0.3s, first name 0.5s, last name 0.65s, tagline 0.8s, buttons 1.0s

### Scroll-Driven Hero Parallax
- Hero content: `translateY(scrollY * 0.2)` + fade out by `scrollY / (vh * 0.55)`
- Particle field: moves at 0.6× scroll speed (background parallax)

### Sticky Features
- Section height: `280vh` sticky container
- Progress = `(-rect.top) / (rect.height - innerHeight)`
- Active panel index = `Math.floor(progress * 3)`
- Active panel: `opacity: 1`, `translateY(0)` | Inactive: `opacity: 0.15`, `translateY(10px)`
- Left panel: mini gravity particle field (same physics, lighter — 60 particles)

### Apple-Style Text Scrub (between features and CTA)
- A standalone section with a large statement: _"I build systems that think, pipelines that heal themselves, and interfaces that feel alive."_
- Each word wrapped in `<span class="scrub-word">`, `opacity: 0.08` baseline
- On scroll: `scrollY` mapped linearly to each word's position in the sentence → word opacity animates `0.08 → 1` as it enters the scrub window
- Implemented with `requestAnimationFrame` + scroll position math (no IntersectionObserver for this — needs continuous scroll position)

### CTA Section
- Entrance: `IntersectionObserver` triggers fade + slide-up when section enters viewport
- Staggered: tag → headline → sub → buttons, 150ms apart

### Hover Microinteractions
- Buttons: magnetic pull — `mousemove` on button adjusts `transform: translate(dx, dy)` within ±8px
- Nav links: underline grows from center on hover via `transform: scaleX(0 → 1)` on `::after` pseudo-element

### Custom Cursor
- Inner dot: `12px` white circle, instant tracking
- Outer ring: `44px` outlined circle, lagging `0.08` lerp, `mix-blend-mode: difference`
- On button hover: ring expands to `64px`, dot shrinks
- Hidden on mobile

---

## 5. Performance Rules

- All animations: `transform` and `opacity` only — no layout triggers
- `will-change: transform` on hero-content and cursor only
- `requestAnimationFrame` for all JS animation loops
- Canvas: render at `Math.min(devicePixelRatio, 1.5)` max — no retina overdraw
- `{passive: true}` on all scroll listeners
- `prefers-reduced-motion`: all particle physics stop, CSS animations use `transition: none`
- Particle connection line loop: skip if `PARTICLE_COUNT²/2 > 8000` iterations (cap at 120 particles)

---

## 6. File Structure

```
personal-website/
├── index.html          # entire site (single file)
├── style.css           # (optional split-out, or embedded)
└── main.js             # (optional split-out, or embedded)
```

Single `index.html` for simplicity. All CSS and JS embedded. No build step.

---

## 7. Responsive Behavior

- Mobile (`< 768px`): nav links hidden, single-column stats, sticky section stacks vertically (canvas top 40vh, panels below), cursor hidden
- Tablet (`768–1024px`): reduced font sizes, particle count halved
- Desktop: full experience as specified

---

## 8. Browser Support

- Modern Chrome, Safari, Firefox (2023+)
- Canvas 2D required (universal)
- No WebGL dependency (removed for performance)
- `IntersectionObserver` required (universal modern)

---

## 9. CTAs

- Primary: **Connect on LinkedIn** → `https://www.linkedin.com/in/saboor-siddiqui-6a0659188/`
- Secondary: **GitHub ↗** → `https://github.com/saboor-siddiqui`
- Nav: Work, About, GitHub, Contact (anchor links within page)
