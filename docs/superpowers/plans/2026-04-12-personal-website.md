# Personal Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Saboor Siddiqui's personal website — a single `index.html` with premium antigravity particle physics, Apple-style scroll animations, and real content from GitHub/LinkedIn.

**Architecture:** One self-contained `index.html` file with embedded `<style>` and `<script>`. Canvas 2D for all 3D/particle visuals. No frameworks, no libraries, no build step.

**Tech Stack:** HTML5, CSS3 (custom properties, grid, animations), Vanilla JS (Canvas 2D, IntersectionObserver, requestAnimationFrame)

**Reference spec:** `docs/superpowers/specs/2026-04-12-personal-website-design.md`

---

## File Map

| File | Responsibility |
|------|---------------|
| `index.html` | Entire site — HTML structure, embedded CSS, embedded JS |

That's it. One file.

---

## Physics Constants (used throughout)

```js
const PARTICLE_COUNT  = 130;
const REPEL_DIST      = 140;     // px — antigravity zone radius
const REPEL_STRENGTH  = 14000;   // push force when too close
const GRAVITY_PULL    = 10000;   // attraction force when far
const HOME_SPRING     = 0.018;   // spring coefficient back to home pos
const DAMPING         = 0.955;   // velocity damping per frame
const CONNECT_DIST_SQ = 9025;    // 95² — max distance² for connection lines
```

---

## Task 1: HTML Skeleton + Base CSS + Nav

**Files:**
- Create: `index.html`

- [ ] **Step 1: Create `index.html` with full skeleton**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Saboor Siddiqui — Data Engineer & Cloud Solutions Architect at American Express. Building AI agents and data systems that scale.">
  <title>Saboor Siddiqui</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    /* ── Reset ─────────────────────────────────────────── */
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      background: #060608;
      color: #fff;
      font-family: 'Inter', -apple-system, 'SF Pro Display', sans-serif;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }
    img, canvas { display: block; }

    /* ── Nav ────────────────────────────────────────────── */
    #nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      display: flex; align-items: center; justify-content: space-between;
      padding: 30px 60px;
      transition: background 0.5s cubic-bezier(0.16,1,0.3,1),
                  padding   0.5s cubic-bezier(0.16,1,0.3,1),
                  border-color 0.5s;
      border-bottom: 1px solid transparent;
    }
    #nav.scrolled {
      background: rgba(6,6,8,0.88);
      border-color: rgba(255,255,255,0.05);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      padding: 20px 60px;
    }
    .nav-logo {
      font-size: 12px; font-weight: 600;
      letter-spacing: 5px; text-transform: uppercase;
      color: rgba(255,255,255,0.65);
      text-decoration: none;
    }
    .nav-links { display: flex; gap: 44px; }
    .nav-links a {
      position: relative;
      font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
      color: rgba(255,255,255,0.28); text-decoration: none;
      transition: color 0.2s;
    }
    .nav-links a::after {
      content: '';
      position: absolute; bottom: -2px; left: 50%; right: 50%;
      height: 1px; background: rgba(255,255,255,0.5);
      transition: left 0.3s cubic-bezier(0.16,1,0.3,1),
                  right 0.3s cubic-bezier(0.16,1,0.3,1);
    }
    .nav-links a:hover { color: rgba(255,255,255,0.8); }
    .nav-links a:hover::after { left: 0; right: 0; }
  </style>
</head>
<body>

  <!-- NAV -->
  <nav id="nav">
    <a href="#" class="nav-logo">Saboor</a>
    <div class="nav-links">
      <a href="#work">Work</a>
      <a href="#about">About</a>
      <a href="https://github.com/saboor-siddiqui" target="_blank" rel="noopener">GitHub</a>
      <a href="#contact">Contact</a>
    </div>
  </nav>

  <script>
    // Nav scroll state
    window.addEventListener('scroll', () => {
      document.getElementById('nav').classList.toggle('scrolled', scrollY > 30);
    }, { passive: true });
  </script>
</body>
</html>
```

- [ ] **Step 2: Open in browser, verify nav is visible, fixed, and collapses on scroll**

Open `index.html` in Chrome. Scroll down (add `<div style="height:200vh"></div>` temporarily to test). Nav should get background + blur after 30px. Remove the temp div after testing.

- [ ] **Step 3: Commit**

```bash
cd /Users/saboor/Documents/Projects/Codes/personal-website
git init
git add index.html
git commit -m "feat: html skeleton, base CSS reset, fixed nav with scroll state"
```

---

## Task 2: Custom Cursor

**Files:**
- Modify: `index.html` — add cursor HTML, CSS, JS

- [ ] **Step 1: Add cursor HTML (inside `<body>`, before nav)**

```html
<!-- CURSOR -->
<div id="cur-dot"></div>
<div id="cur-ring"></div>
```

- [ ] **Step 2: Add cursor CSS (inside `<style>`)**

```css
/* ── Cursor ─────────────────────────────────────────── */
#cur-dot, #cur-ring {
  position: fixed;
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
}
#cur-dot {
  width: 8px; height: 8px;
  background: #fff;
  transition: width 0.3s cubic-bezier(0.16,1,0.3,1),
              height 0.3s cubic-bezier(0.16,1,0.3,1),
              opacity 0.3s;
  mix-blend-mode: difference;
}
#cur-ring {
  width: 40px; height: 40px;
  border: 1px solid rgba(255,255,255,0.35);
  transition: width 0.4s cubic-bezier(0.16,1,0.3,1),
              height 0.4s cubic-bezier(0.16,1,0.3,1),
              opacity 0.3s;
  mix-blend-mode: difference;
}
body { cursor: none; }
@media (pointer: coarse) {
  #cur-dot, #cur-ring { display: none; }
  body { cursor: auto; }
}
```

- [ ] **Step 3: Add cursor JS (inside `<script>`, before nav scroll code)**

```js
// ── Custom Cursor ──────────────────────────────────────
const curDot  = document.getElementById('cur-dot');
const curRing = document.getElementById('cur-ring');
let curRingX = innerWidth / 2, curRingY = innerHeight / 2;
let curMouseX = curRingX,      curMouseY = curRingY;

document.addEventListener('mousemove', e => {
  curMouseX = e.clientX;
  curMouseY = e.clientY;
  curDot.style.left = e.clientX + 'px';
  curDot.style.top  = e.clientY + 'px';
});

(function tickCursor() {
  curRingX += (curMouseX - curRingX) * 0.1;
  curRingY += (curMouseY - curRingY) * 0.1;
  curRing.style.left = curRingX + 'px';
  curRing.style.top  = curRingY + 'px';
  requestAnimationFrame(tickCursor);
})();

// Expand ring on interactive elements
document.querySelectorAll('a, button, .btn-w, .btn-g').forEach(el => {
  el.addEventListener('mouseenter', () => {
    curRing.style.width = curRing.style.height = '64px';
    curDot.style.width  = curDot.style.height  = '4px';
  });
  el.addEventListener('mouseleave', () => {
    curRing.style.width = curRing.style.height = '40px';
    curDot.style.width  = curDot.style.height  = '8px';
  });
});
```

- [ ] **Step 4: Verify cursor in browser**

Open `index.html`. Default cursor should be hidden. A white dot should follow mouse instantly. A larger ring should lag behind. Hovering any link should expand the ring.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: custom cursor — dot + lagging ring, expands on hover"
```

---

## Task 3: Hero Section — HTML + CSS (Static)

**Files:**
- Modify: `index.html` — add hero HTML and CSS

- [ ] **Step 1: Add hero CSS (inside `<style>`)**

```css
/* ── Hero ───────────────────────────────────────────── */
.hero {
  position: relative; height: 100vh;
  display: flex; flex-direction: column;
  justify-content: center; align-items: center;
  text-align: center; overflow: hidden;
}
#hero-canvas {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
}
.hero-content {
  position: relative; z-index: 2;
  pointer-events: none;
  will-change: transform;
}
.hero-eyebrow {
  font-size: 10px; font-weight: 400;
  letter-spacing: 6px; text-transform: uppercase;
  color: rgba(255,255,255,0.2);
  margin-bottom: 30px;
}
.hero-name-bold {
  display: block;
  font-size: clamp(76px, 11.5vw, 168px);
  font-weight: 800;
  letter-spacing: -0.05em;
  line-height: 0.86;
  background: linear-gradient(160deg, #ffffff 40%, rgba(255,255,255,0.5) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-name-thin {
  display: block;
  font-size: clamp(76px, 11.5vw, 168px);
  font-weight: 100;
  letter-spacing: -0.05em;
  line-height: 0.86;
  color: rgba(255,255,255,0.1);
}
.hero-tagline {
  margin-top: 36px; margin-bottom: 48px;
  font-size: 13px; font-weight: 400;
  letter-spacing: 3px; text-transform: uppercase;
  color: rgba(255,255,255,0.25);
}
.hero-btns {
  display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;
  pointer-events: all;
}
.btn-w {
  background: #fff; color: #000;
  padding: 14px 38px; border-radius: 100px;
  font-family: inherit; font-size: 13px; font-weight: 600;
  letter-spacing: 0.3px; text-decoration: none;
  border: none; cursor: none;
  transition: background 0.3s cubic-bezier(0.16,1,0.3,1),
              transform  0.3s cubic-bezier(0.16,1,0.3,1);
  will-change: transform;
}
.btn-w:hover { background: rgba(255,255,255,0.85); }
.btn-g {
  background: transparent; color: rgba(255,255,255,0.48);
  padding: 14px 38px; border-radius: 100px;
  font-family: inherit; font-size: 13px; font-weight: 400;
  letter-spacing: 0.3px; text-decoration: none;
  border: 1px solid rgba(255,255,255,0.1); cursor: none;
  transition: color 0.3s, border-color 0.3s, transform 0.3s cubic-bezier(0.16,1,0.3,1);
  will-change: transform;
}
.btn-g:hover { color: #fff; border-color: rgba(255,255,255,0.35); }
.scroll-cue {
  position: absolute; bottom: 38px; left: 50%;
  transform: translateX(-50%); z-index: 2;
  display: flex; flex-direction: column; align-items: center; gap: 10px;
}
.scroll-cue span {
  font-size: 9px; letter-spacing: 4px; text-transform: uppercase;
  color: rgba(255,255,255,0.15);
}
.scroll-line {
  width: 1px; height: 48px;
  background: linear-gradient(to bottom, rgba(255,255,255,0.4), transparent);
}
```

- [ ] **Step 2: Add hero HTML (after `<nav>` block)**

```html
<!-- HERO -->
<section class="hero" id="hero">
  <canvas id="hero-canvas"></canvas>
  <div class="hero-content" id="heroContent">
    <p class="hero-eyebrow">Data Engineer &nbsp;·&nbsp; Cloud Solutions Architect &nbsp;·&nbsp; AI Builder</p>
    <span class="hero-name-bold">SABOOR</span>
    <span class="hero-name-thin">SIDDIQUI</span>
    <p class="hero-tagline">Friendly Neighborhood Engineer</p>
    <div class="hero-btns">
      <a href="#contact" class="btn-w js-magnetic">View Work</a>
      <a href="https://github.com/saboor-siddiqui" class="btn-g js-magnetic" target="_blank" rel="noopener">GitHub ↗</a>
    </div>
  </div>
  <div class="scroll-cue" aria-hidden="true">
    <span>Scroll</span>
    <div class="scroll-line"></div>
  </div>
</section>
```

- [ ] **Step 3: Verify static layout in browser**

Open `index.html`. Hero should fill the viewport. "SABOOR" should be huge with gradient. "SIDDIQUI" should be barely visible below it. Tagline and buttons below. Scroll cue at bottom.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: hero section static HTML and CSS"
```

---

## Task 4: Hero Entrance Animations

**Files:**
- Modify: `index.html` — CSS keyframes + animation properties

- [ ] **Step 1: Add CSS keyframes and animation assignments (inside `<style>`)**

```css
/* ── Entrance animations ─────────────────────────────── */
@keyframes riseIn {
  from { opacity: 0; transform: translateY(32px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes scanLine {
  0%   { opacity: 0; transform: scaleY(0);   transform-origin: top; }
  45%  { opacity: 1; transform: scaleY(1);   transform-origin: top; }
  85%  { opacity: 0; transform: scaleY(1);   transform-origin: bottom; }
  100% { opacity: 0; }
}
.hero-eyebrow  { animation: riseIn 1.4s cubic-bezier(0.16,1,0.3,1) 0.3s  both; }
.hero-name-bold{ animation: riseIn 1.4s cubic-bezier(0.16,1,0.3,1) 0.48s both; }
.hero-name-thin{ animation: riseIn 1.4s cubic-bezier(0.16,1,0.3,1) 0.60s both; }
.hero-tagline  { animation: riseIn 1.4s cubic-bezier(0.16,1,0.3,1) 0.76s both; }
.hero-btns     { animation: riseIn 1.4s cubic-bezier(0.16,1,0.3,1) 0.92s both; }
.scroll-cue    { animation: fadeIn 2s 1.6s both; }
.scroll-line   { animation: scanLine 2.8s ease-in-out infinite; }
```

- [ ] **Step 2: Verify in browser**

Reload `index.html`. Each hero text element should slide up with a staggered spring effect. The scroll line should pulse continuously.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: hero staggered entrance animations with spring cubic-bezier"
```

---

## Task 5: Hero Particle Physics Engine

**Files:**
- Modify: `index.html` — add canvas JS

- [ ] **Step 1: Add particle system JS (inside `<script>`, after cursor code)**

```js
// ── Hero Particle Physics ──────────────────────────────
(function initHeroParticles() {
  const canvas = document.getElementById('hero-canvas');
  const ctx    = canvas.getContext('2d');

  // Physics constants
  const PARTICLE_COUNT  = 130;
  const REPEL_DIST      = 140;
  const REPEL_STRENGTH  = 14000;
  const GRAVITY_PULL    = 10000;
  const HOME_SPRING     = 0.018;
  const DAMPING         = 0.955;
  const CONNECT_DIST_SQ = 9025; // 95²

  let W = 0, H = 0;
  const TYPES = ['dot', 'dot', 'dot', 'ring', 'ring', 'cross', 'tri'];

  function rand(a, b) { return a + Math.random() * (b - a); }

  // Build particle pool
  const particles = Array.from({ length: PARTICLE_COUNT }, () => {
    const z = Math.random();
    return {
      x: 0, y: 0, vx: 0, vy: 0,
      hx: 0, hy: 0,
      z,
      type:      TYPES[Math.floor(Math.random() * TYPES.length)],
      size:      rand(1.5, 4.5) * (0.5 + z * 0.7),
      baseAlpha: 0.06 + z * 0.28,
      angle:     Math.random() * Math.PI * 2,
      angV:      (Math.random() - 0.5) * 0.006,
      mass:      0.4 + z * 0.8,
    };
  });

  function scatter() {
    const cx = W / 2, cy = H / 2;
    const minDim = Math.min(W, H);
    particles.forEach(p => {
      const r   = rand(minDim * 0.08, minDim * 0.44);
      const ang = Math.random() * Math.PI * 2;
      p.hx = cx + Math.cos(ang) * r;
      p.hy = cy + Math.sin(ang) * r;
      p.x  = cx + (Math.random() - 0.5) * W;
      p.y  = cy + (Math.random() - 0.5) * H;
    });
  }

  function resize() {
    W = canvas.width  = canvas.clientWidth;
    H = canvas.height = canvas.clientHeight;
    scatter();
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Smooth mouse state
  let mx = W / 2, my = H / 2, tmx = W / 2, tmy = H / 2;
  document.addEventListener('mousemove', e => { tmx = e.clientX; tmy = e.clientY; }, { passive: true });

  function drawShape(type, x, y, size, angle, alpha) {
    ctx.save();
    ctx.globalAlpha = Math.min(alpha, 1);
    ctx.translate(x, y);
    ctx.rotate(angle);

    if (type === 'dot') {
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();

    } else if (type === 'ring') {
      ctx.beginPath();
      ctx.arc(0, 0, size * 2.8, 0, Math.PI * 2);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth   = 0.75;
      ctx.stroke();

    } else if (type === 'cross') {
      const s = size * 2.2;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth   = 0.8;
      ctx.beginPath(); ctx.moveTo(-s, 0); ctx.lineTo(s, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(0, s); ctx.stroke();

    } else if (type === 'tri') {
      const s = size * 3.0;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth   = 0.75;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.lineTo( s * 0.866,  s * 0.5);
      ctx.lineTo(-s * 0.866,  s * 0.5);
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();
  }

  let lastTs = 0;
  function heroLoop(ts) {
    const dt = Math.min((ts - lastTs) / 16.67, 3);
    lastTs = ts;
    ctx.clearRect(0, 0, W, H);

    // Smooth mouse lerp
    mx += (tmx - mx) * 0.08;
    my += (tmy - my) * 0.08;

    // Update + draw particles
    particles.forEach(p => {
      const dx   = mx - p.x;
      const dy   = my - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      let fx = 0, fy = 0;
      if (dist < REPEL_DIST) {
        const force = REPEL_STRENGTH / (dist * dist);
        fx = -(dx / dist) * force;
        fy = -(dy / dist) * force;
      } else {
        const force = GRAVITY_PULL / (dist * dist + 500);
        fx = (dx / dist) * force;
        fy = (dy / dist) * force;
      }

      // Spring home
      fx += (p.hx - p.x) * HOME_SPRING;
      fy += (p.hy - p.y) * HOME_SPRING;

      p.vx = (p.vx + fx * 0.016 * dt) * DAMPING;
      p.vy = (p.vy + fy * 0.016 * dt) * DAMPING;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.angle += p.angV * dt;

      // Soft wraparound
      const pad = 80;
      if (p.x < -pad) p.x = W + pad;
      if (p.x > W + pad) p.x = -pad;
      if (p.y < -pad) p.y = H + pad;
      if (p.y > H + pad) p.y = -pad;

      const proximity = Math.max(0, 1 - dist / 320);
      drawShape(p.type, p.x, p.y, p.size, p.angle, p.baseAlpha + proximity * 0.45);
    });

    // Connection lines — only iterate pairs once
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < CONNECT_DIST_SQ) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(255,255,255,${(1 - d2 / CONNECT_DIST_SQ) * 0.065})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(heroLoop);
  }
  requestAnimationFrame(heroLoop);
})();
```

- [ ] **Step 2: Verify physics in browser**

Open `index.html`. Particles should float in a loose formation around the viewport centre. Moving mouse: particles within ~140px should scatter away. Particles farther than 140px should drift toward the cursor. On mouse leave, they spring back to home positions. Faint lines should connect nearby particles.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: hero antigravity particle physics — repel/attract/spring/damping"
```

---

## Task 6: Hero Scroll Parallax + Magnetic Buttons

**Files:**
- Modify: `index.html` — scroll JS + magnetic button JS

- [ ] **Step 1: Add scroll parallax + magnetic button JS (inside `<script>`)**

```js
// ── Hero scroll parallax ───────────────────────────────
const heroContent = document.getElementById('heroContent');
window.addEventListener('scroll', () => {
  const y = scrollY;
  if (y < innerHeight) {
    heroContent.style.transform = `translateY(${y * 0.2}px)`;
    heroContent.style.opacity   = String(Math.max(0, 1 - y / (innerHeight * 0.55)));
  }
}, { passive: true });

// ── Magnetic buttons ───────────────────────────────────
// Runs after DOM is fully built — call once at end of script
function initMagnetic() {
  document.querySelectorAll('.js-magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r   = el.getBoundingClientRect();
      const dx  = e.clientX - (r.left + r.width  / 2);
      const dy  = e.clientY - (r.top  + r.height / 2);
      el.style.transform = `translate(${dx * 0.28}px, ${dy * 0.28}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}
```

- [ ] **Step 2: Call `initMagnetic()` at the very end of `<script>` (after all DOM is built)**

Add at the bottom of the script tag, after all other initialization calls:
```js
initMagnetic();
```

- [ ] **Step 3: Verify in browser**

Scroll down — hero text should drift upward and fade. Move mouse over buttons — they should pull slightly toward the cursor. Moving away should spring them back.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: hero scroll parallax + magnetic button pull effect"
```

---

## Task 7: Stats Section

**Files:**
- Modify: `index.html` — stats HTML + CSS

- [ ] **Step 1: Add stats CSS (inside `<style>`)**

```css
/* ── Stats ──────────────────────────────────────────── */
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top:    1px solid rgba(255,255,255,0.04);
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.stat {
  padding: 64px 56px;
  text-align: center;
  border-right: 1px solid rgba(255,255,255,0.04);
}
.stat:last-child { border-right: none; }
.stat-number {
  display: block;
  font-size: 56px; font-weight: 700;
  letter-spacing: -0.04em;
  color: rgba(255,255,255,0.88);
}
.stat-label {
  display: block;
  font-size: 10px; font-weight: 400;
  letter-spacing: 3px; text-transform: uppercase;
  color: rgba(255,255,255,0.2);
  margin-top: 10px;
}
```

- [ ] **Step 2: Add stats HTML (after hero section)**

```html
<!-- STATS -->
<div class="stats" id="about">
  <div class="stat">
    <span class="stat-number">4+</span>
    <span class="stat-label">Years of Engineering</span>
  </div>
  <div class="stat">
    <span class="stat-number">3</span>
    <span class="stat-label">AI Agents Shipped</span>
  </div>
  <div class="stat">
    <span class="stat-number">∞</span>
    <span class="stat-label">Pipelines Debugged</span>
  </div>
</div>
```

- [ ] **Step 3: Verify in browser**

Stats should sit directly below the hero, 3 equal columns, centered numbers, dividers between columns and top/bottom.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: stats row — 4+ years, 3 AI agents, ∞ pipelines"
```

---

## Task 8: Apple-Style Text Scrub Section

**Files:**
- Modify: `index.html` — scrub HTML, CSS, JS

- [ ] **Step 1: Add scrub CSS (inside `<style>`)**

```css
/* ── Text Scrub ─────────────────────────────────────── */
.scrub-section {
  padding: 160px 56px;
  max-width: 1000px;
  margin: 0 auto;
}
.scrub-text {
  font-size: clamp(28px, 4vw, 52px);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.3;
  color: #fff;
}
.scrub-word {
  display: inline-block;
  opacity: 0.08;
  transition: opacity 0.1s;
  margin-right: 0.28em;
}
```

- [ ] **Step 2: Add scrub HTML (after stats section)**

```html
<!-- APPLE TEXT SCRUB -->
<div class="scrub-section" id="scrub-section">
  <p class="scrub-text" id="scrub-text">
    <!-- Words injected by JS below -->
  </p>
</div>
```

- [ ] **Step 3: Add scrub JS (inside `<script>`)**

```js
// ── Apple-style text scrub ────────────────────────────
(function initScrub() {
  const sentence = "I build systems that think, pipelines that heal themselves, and interfaces that feel alive.";
  const container = document.getElementById('scrub-text');
  if (!container) return;

  // Wrap each word in a span
  container.innerHTML = sentence
    .split(' ')
    .map(w => `<span class="scrub-word">${w}</span>`)
    .join(' ');

  const words  = container.querySelectorAll('.scrub-word');
  const section = document.getElementById('scrub-section');

  function updateScrub() {
    const rect     = section.getBoundingClientRect();
    const vh       = innerHeight;
    // 0 = top of section at bottom of screen; 1 = bottom of section at top of screen
    const progress = (vh - rect.top) / (rect.height + vh);

    words.forEach((word, i) => {
      const start = i       / words.length;
      const end   = (i + 1) / words.length;
      // local t within this word's window, stretched 1.8× so overlap feels good
      const t = Math.max(0, Math.min(1, (progress - start) / (end - start) * 1.8));
      word.style.opacity = String(0.08 + t * 0.92);
    });
  }

  window.addEventListener('scroll', updateScrub, { passive: true });
  updateScrub();
})();
```

- [ ] **Step 4: Verify in browser**

Add enough content below to allow scrolling. The scrub sentence should appear dim. As you scroll through it, each word should light up left-to-right. All words fully bright once you've scrolled past.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: apple-style word-by-word text scrub driven by scroll position"
```

---

## Task 9: Sticky Features Section — HTML + CSS

**Files:**
- Modify: `index.html` — features HTML + CSS

- [ ] **Step 1: Add features CSS (inside `<style>`)**

```css
/* ── Sticky Features ────────────────────────────────── */
.features-wrap {
  position: relative;
  height: 280vh;
}
.features-inner {
  position: sticky; top: 0; height: 100vh;
  display: grid; grid-template-columns: 1fr 1fr;
  overflow: hidden;
}
.feat-left {
  position: relative;
  border-right: 1px solid rgba(255,255,255,0.04);
  background: #030304;
  display: flex; align-items: center; justify-content: center;
}
#feat-canvas {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
}
.feat-left-label {
  position: absolute; bottom: 36px; left: 36px;
  font-size: 9px; letter-spacing: 4px; text-transform: uppercase;
  color: rgba(255,255,255,0.1);
  pointer-events: none;
}
.feat-right {
  display: flex; flex-direction: column; justify-content: center;
  padding: 80px 72px;
  overflow: hidden;
}
.feat-panel {
  padding: 52px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  opacity: 0.15;
  transform: translateY(12px);
  transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1),
              transform 0.8s cubic-bezier(0.16,1,0.3,1);
}
.feat-panel:last-child { border-bottom: none; }
.feat-panel.active { opacity: 1; transform: translateY(0); }
.feat-panel-num {
  font-size: 9px; letter-spacing: 4px; text-transform: uppercase;
  color: rgba(255,255,255,0.18);
  margin-bottom: 18px;
}
.feat-panel-title {
  font-size: 36px; font-weight: 600;
  letter-spacing: -0.025em; line-height: 1.1;
  color: rgba(255,255,255,0.92);
  margin-bottom: 16px;
}
.feat-panel-body {
  font-size: 14px; line-height: 1.8;
  color: rgba(255,255,255,0.32);
  max-width: 380px;
}
.feat-panel-tags {
  display: flex; flex-wrap: wrap; gap: 8px;
  margin-top: 20px;
}
.feat-tag {
  font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
  color: rgba(255,255,255,0.25);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 4px 10px; border-radius: 100px;
}
```

- [ ] **Step 2: Add features HTML (after scrub section)**

```html
<!-- STICKY FEATURES -->
<div class="features-wrap" id="work">
  <div class="features-inner">

    <!-- Left: live particle canvas -->
    <div class="feat-left">
      <canvas id="feat-canvas"></canvas>
      <span class="feat-left-label">Expertise</span>
    </div>

    <!-- Right: 3 scrolling panels -->
    <div class="feat-right" id="feat-right">

      <div class="feat-panel active" data-panel="0">
        <div class="feat-panel-num">01 — AI Engineering</div>
        <div class="feat-panel-title">Systems<br>That Think</div>
        <div class="feat-panel-body">
          Building LLM-powered agents that automate complex engineering workflows.
          RADAR reviews your PRs. FLARE triages Airflow failures before you wake up.
          RAGGY debugs your RAG pipelines. AI that works while you sleep.
        </div>
        <div class="feat-panel-tags">
          <span class="feat-tag">LangGraph</span>
          <span class="feat-tag">Python</span>
          <span class="feat-tag">LLMs</span>
          <span class="feat-tag">RAG</span>
        </div>
      </div>

      <div class="feat-panel" data-panel="1">
        <div class="feat-panel-num">02 — Data Engineering</div>
        <div class="feat-panel-title">Pipelines<br>at Scale</div>
        <div class="feat-panel-body">
          Architecting data infrastructure at American Express.
          Previously earned the "Rising Rockstar" award at Paytm for dramatically
          improving reporting pipeline performance. Spark, BigQuery, Airflow — at enterprise scale.
        </div>
        <div class="feat-panel-tags">
          <span class="feat-tag">Apache Airflow</span>
          <span class="feat-tag">Apache Spark</span>
          <span class="feat-tag">BigQuery</span>
          <span class="feat-tag">Scala</span>
        </div>
      </div>

      <div class="feat-panel" data-panel="2">
        <div class="feat-panel-num">03 — Cloud Architecture</div>
        <div class="feat-panel-title">Built to<br>Last</div>
        <div class="feat-panel-body">
          Designing distributed systems and cloud infrastructure that handles
          real-world load. From lineage extraction to SQL optimization —
          tooling that makes entire engineering teams faster.
        </div>
        <div class="feat-panel-tags">
          <span class="feat-tag">Cloud Architecture</span>
          <span class="feat-tag">Distributed Systems</span>
          <span class="feat-tag">BigQuery</span>
          <span class="feat-tag">Python</span>
        </div>
      </div>

    </div>
  </div>
</div>
```

- [ ] **Step 3: Verify layout in browser**

Scroll into the features section. The left half should be dark with a label. Right half shows 3 panels. First panel should be fully opaque, others dim. The section should be sticky for ~2.8× the viewport height.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: sticky features section layout — 3 panels with tag chips"
```

---

## Task 10: Features Scroll Highlighting + Left Panel Particles

**Files:**
- Modify: `index.html` — features scroll JS + features canvas JS

- [ ] **Step 1: Add features scroll highlight JS (inside `<script>`)**

```js
// ── Features sticky scroll highlight ──────────────────
(function initFeatScroll() {
  const wrap   = document.getElementById('work');
  const panels = document.querySelectorAll('.feat-panel');
  if (!wrap || !panels.length) return;

  window.addEventListener('scroll', () => {
    const rect     = wrap.getBoundingClientRect();
    const progress = (-rect.top) / (rect.height - innerHeight);
    const idx      = Math.max(0, Math.min(panels.length - 1, Math.floor(progress * panels.length)));
    panels.forEach((p, i) => p.classList.toggle('active', i === idx));
  }, { passive: true });
})();
```

- [ ] **Step 2: Add features canvas particle system JS (inside `<script>`)**

```js
// ── Features canvas particles (lighter version) ───────
(function initFeatParticles() {
  const canvas = document.getElementById('feat-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const COUNT = 65;
  function rand(a, b) { return a + Math.random() * (b - a); }

  let FW = 0, FH = 0;
  function resizeFC() {
    const r = canvas.parentElement.getBoundingClientRect();
    FW = canvas.width  = r.width;
    FH = canvas.height = r.height;
  }
  resizeFC();
  new ResizeObserver(resizeFC).observe(canvas.parentElement);

  const fparts = Array.from({ length: COUNT }, () => ({
    x:  rand(0, 800), y: rand(0, 800),
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r:  rand(1.2, 3.5),
    alpha: rand(0.05, 0.22),
  }));

  let fmx = 0, fmy = 0, ftmx = 0, ftmy = 0;
  canvas.parentElement.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    ftmx = e.clientX - r.left;
    ftmy = e.clientY - r.top;
  }, { passive: true });

  const FCONNECT_SQ = 6400; // 80²

  (function featLoop() {
    if (!FW || !FH) { requestAnimationFrame(featLoop); return; }
    ctx.clearRect(0, 0, FW, FH);
    fmx += (ftmx - fmx) * 0.08;
    fmy += (ftmy - fmy) * 0.08;

    fparts.forEach(p => {
      const dx = fmx - p.x, dy = fmy - p.y;
      const d  = Math.sqrt(dx * dx + dy * dy) || 1;

      if (d < 110) {
        // repel from mouse
        p.vx -= (dx / d) * 5 / d;
        p.vy -= (dy / d) * 5 / d;
      } else {
        // drift toward centre of canvas
        p.vx += (FW / 2 - p.x) * 0.0008;
        p.vy += (FH / 2 - p.y) * 0.0008;
      }
      p.vx *= 0.95; p.vy *= 0.95;
      p.x  += p.vx; p.y  += p.vy;

      if (p.x < 0) p.x = FW; if (p.x > FW) p.x = 0;
      if (p.y < 0) p.y = FH; if (p.y > FH) p.y = 0;

      const prox = Math.max(0, 1 - d / 200);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.alpha + prox * 0.3})`;
      ctx.fill();
    });

    // Connections
    for (let i = 0; i < fparts.length; i++) {
      for (let j = i + 1; j < fparts.length; j++) {
        const a = fparts[i], b = fparts[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < FCONNECT_SQ) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(255,255,255,${(1 - d2 / FCONNECT_SQ) * 0.07})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(featLoop);
  })();
})();
```

- [ ] **Step 3: Verify in browser**

Scroll through features section slowly. Panel 1 → 2 → 3 should fade in/out as you progress through the sticky scroll. The left particle canvas should have a lighter field of dots with connections. Hovering the left panel should scatter particles.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: features scroll highlight + interactive particle canvas on left panel"
```

---

## Task 11: CTA Section + Footer

**Files:**
- Modify: `index.html` — CTA HTML, CSS, JS

- [ ] **Step 1: Add CTA + footer CSS (inside `<style>`)**

```css
/* ── CTA ────────────────────────────────────────────── */
.cta-section {
  padding: 180px 56px 140px;
  text-align: center;
  position: relative; overflow: hidden;
}
.cta-glow {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 800px; height: 500px;
  background: radial-gradient(ellipse, rgba(255,255,255,0.016) 0%, transparent 65%);
  pointer-events: none;
}
.cta-tag {
  font-size: 9px; letter-spacing: 5px; text-transform: uppercase;
  color: rgba(255,255,255,0.18);
  margin-bottom: 22px;
  opacity: 0; transform: translateY(20px);
  transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1),
              transform 0.8s cubic-bezier(0.16,1,0.3,1);
}
.cta-headline {
  font-size: clamp(44px, 6vw, 86px); font-weight: 700;
  letter-spacing: -0.03em; line-height: 0.98;
  color: rgba(255,255,255,0.92);
  margin-bottom: 16px;
  opacity: 0; transform: translateY(24px);
  transition: opacity 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s,
              transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s;
}
.cta-sub {
  font-size: 15px; color: rgba(255,255,255,0.28);
  margin-bottom: 52px; line-height: 1.7;
  opacity: 0; transform: translateY(20px);
  transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s,
              transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s;
}
.cta-btns {
  display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;
  opacity: 0; transform: translateY(16px);
  transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s,
              transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s;
}
.cta-section.visible .cta-tag,
.cta-section.visible .cta-headline,
.cta-section.visible .cta-sub,
.cta-section.visible .cta-btns {
  opacity: 1; transform: translateY(0);
}
.cta-w {
  padding: 15px 40px; border-radius: 100px;
  background: #fff; color: #000;
  font-family: inherit; font-size: 14px; font-weight: 600;
  text-decoration: none; cursor: none;
  transition: background 0.3s cubic-bezier(0.16,1,0.3,1),
              transform  0.3s cubic-bezier(0.16,1,0.3,1);
  will-change: transform;
}
.cta-w:hover { background: rgba(255,255,255,0.85); }
.cta-b {
  padding: 15px 40px; border-radius: 100px;
  background: transparent; color: rgba(255,255,255,0.42);
  font-family: inherit; font-size: 14px; font-weight: 400;
  text-decoration: none; cursor: none;
  border: 1px solid rgba(255,255,255,0.1);
  transition: color 0.3s, border-color 0.3s,
              transform 0.3s cubic-bezier(0.16,1,0.3,1);
  will-change: transform;
}
.cta-b:hover { color: #fff; border-color: rgba(255,255,255,0.35); }

/* ── Footer ─────────────────────────────────────────── */
footer {
  border-top: 1px solid rgba(255,255,255,0.04);
  padding: 28px 60px;
  display: flex; justify-content: space-between; align-items: center;
}
footer p {
  font-size: 10px; color: rgba(255,255,255,0.15);
  letter-spacing: 1px;
}
```

- [ ] **Step 2: Add CTA HTML (after features section)**

```html
<!-- CTA -->
<section class="cta-section" id="contact">
  <div class="cta-glow"></div>
  <p class="cta-tag">Let's connect</p>
  <h2 class="cta-headline">Ready to build<br>something great?</h2>
  <p class="cta-sub">
    Open to new opportunities, collaborations,<br>and interesting problems.
  </p>
  <div class="cta-btns">
    <a href="https://www.linkedin.com/in/saboor-siddiqui-6a0659188/"
       class="cta-w js-magnetic" target="_blank" rel="noopener">
      Connect on LinkedIn
    </a>
    <a href="https://github.com/saboor-siddiqui"
       class="cta-b js-magnetic" target="_blank" rel="noopener">
      GitHub ↗
    </a>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <p>© 2025 Saboor Siddiqui</p>
  <p style="font-size:9px;color:rgba(255,255,255,0.08);letter-spacing:2px">CRAFTED WITH OBSESSION</p>
</footer>
```

- [ ] **Step 3: Add CTA IntersectionObserver JS (inside `<script>`)**

```js
// ── CTA entrance animation ────────────────────────────
(function initCTA() {
  const cta = document.querySelector('.cta-section');
  if (!cta) return;
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      cta.classList.add('visible');
      obs.disconnect();
    }
  }, { threshold: 0.2 });
  obs.observe(cta);
})();
```

- [ ] **Step 4: Verify in browser**

Scroll to the bottom. CTA should animate in as it enters the viewport (tag → headline → sub → buttons, staggered). Footer should be minimal below it.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: CTA section with intersection-observer entrance + footer"
```

---

## Task 12: prefers-reduced-motion + Mobile Responsive

**Files:**
- Modify: `index.html` — media queries + reduced motion CSS + JS guard

- [ ] **Step 1: Add reduced motion CSS (inside `<style>`, at the very end)**

```css
/* ── Reduced motion ──────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  .hero-canvas { display: none; }
}

/* ── Mobile ──────────────────────────────────────────── */
@media (max-width: 768px) {
  #nav { padding: 24px 28px; }
  #nav.scrolled { padding: 16px 28px; }
  .nav-links { display: none; }
  #cur-dot, #cur-ring { display: none; }
  body { cursor: auto; }

  .hero-eyebrow { font-size: 9px; letter-spacing: 4px; }
  .hero-tagline { font-size: 11px; }
  .hero-btns { flex-direction: column; align-items: center; }

  .stats { grid-template-columns: 1fr; }
  .stat { border-right: none; padding: 40px 28px; }

  .scrub-section { padding: 80px 28px; }
  .scrub-text { font-size: clamp(20px, 6vw, 32px); }

  .features-wrap { height: auto; }
  .features-inner {
    position: relative;
    grid-template-columns: 1fr;
    grid-template-rows: 45vh auto;
    height: auto;
  }
  .feat-left { height: 45vh; }
  .feat-right { padding: 48px 28px; }
  .feat-panel { opacity: 1; transform: none; }
  .feat-panel-title { font-size: 28px; }

  .cta-section { padding: 100px 28px 80px; }
  .cta-btns { flex-direction: column; align-items: center; }

  footer { padding: 24px 28px; flex-direction: column; gap: 8px; text-align: center; }
}

/* ── Tablet ──────────────────────────────────────────── */
@media (min-width: 769px) and (max-width: 1024px) {
  #nav { padding: 24px 40px; }
  .feat-right { padding: 60px 48px; }
  .feat-panel-title { font-size: 30px; }
  .cta-section { padding: 140px 40px 100px; }
}
```

- [ ] **Step 2: Add reduced motion JS guard (inside `<script>`, at the top of the hero particles IIFE)**

Add this check at the very top of `initHeroParticles`:
```js
// Skip particles if user prefers reduced motion
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
```

And the same at the top of `initFeatParticles`:
```js
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
```

- [ ] **Step 3: Reduce particle count on mobile**

Inside `initHeroParticles`, change the particle count line to:
```js
const isMobile       = window.matchMedia('(max-width: 768px)').matches;
const PARTICLE_COUNT = isMobile ? 60 : 130;
```

- [ ] **Step 4: Verify mobile layout**

Open DevTools → Toggle device toolbar → iPhone 14 (390px wide). Nav links should be hidden. Stats should stack vertically. Features section should not be sticky on mobile. CTA buttons should stack. Cursor should be hidden.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: mobile responsive layout + prefers-reduced-motion support"
```

---

## Task 13: Final Polish Pass

**Files:**
- Modify: `index.html` — polish, performance, accessibility

- [ ] **Step 1: Add `will-change` and performance hints**

In CSS, add to `.hero-content`:
```css
will-change: transform, opacity;
```

Add to `#cur-ring`:
```css
will-change: transform;
```

Remove any `will-change` from elements that don't actually animate (check `.stat`, `.feat-panel-body`, etc.).

- [ ] **Step 2: Add smooth button hover scale via CSS (not JS)**

In the `.btn-w:hover` rule add:
```css
transform: scale(1.04);
```
In `.btn-g:hover` rule add:
```css
transform: translateY(-2px);
```

In `.cta-w:hover` add:
```css
transform: scale(1.03) translateY(-2px);
```
In `.cta-b:hover` add:
```css
transform: translateY(-2px);
```

Note: magnetic button JS overrides `transform`, so these only apply when JS is disabled. The JS magnetic effect handles the transform otherwise.

- [ ] **Step 3: Verify 60fps in Chrome DevTools**

Open DevTools → Performance tab → Record 5 seconds of scrolling. Check:
- No layout/paint in the timeline during scroll (only Composite layers)
- Frame rate stays above 55fps
- Canvas `clearRect` + `drawArrays` should dominate (expected)

If jank appears, open DevTools → Rendering → Paint flashing. Any green flashes outside the canvas are unexpected and must be fixed.

- [ ] **Step 4: Final visual QA checklist**

Check each item manually:
- [ ] Nav collapses cleanly on scroll
- [ ] Hero text enters with stagger on page load
- [ ] Particles float and react to mouse in hero
- [ ] Scroll past hero: text fades and drifts up
- [ ] Stats row renders with dividers
- [ ] Text scrub: words light up word-by-word on scroll
- [ ] Features sticky: section sticks, panel 1→2→3 transitions as you scroll
- [ ] Features left panel: particles interactive
- [ ] CTA: fades in on scroll into view
- [ ] LinkedIn + GitHub links open in new tab correctly
- [ ] Mobile (390px): no horizontal scroll, readable text, no cursor
- [ ] Custom cursor: dot instant, ring lags, expands on hover

- [ ] **Step 5: Final commit**

```bash
git add index.html
git commit -m "feat: final polish — will-change, hover transitions, 60fps verified"
```

---

## Self-Review Against Spec

**Spec coverage check:**

| Spec requirement | Task that covers it |
|-----------------|-------------------|
| Scroll-driven parallax — background + text fade | Task 6 |
| Apple-style text scrub word-by-word | Task 8 |
| Google-style entrance animations with spring cubic-bezier | Task 4 |
| Sticky scroll sequence — one visual, multiple panels | Tasks 9–10 |
| Magnetic button microinteraction | Task 6 |
| Custom cursor dot + lagging ring | Task 2 |
| Antigravity particle physics | Task 5 |
| Connection lines between particles | Task 5 |
| Particle types: dot, ring, cross, triangle | Task 5 |
| Features left panel with mini particle system | Task 10 |
| Real content: AmEx, Paytm Rising Rockstar, RADAR/FLARE/RAGGY | Task 9 |
| Stats: 4+ years, 3 AI agents, ∞ pipelines | Task 7 |
| CTA → LinkedIn + GitHub with correct URLs | Task 11 |
| prefers-reduced-motion | Task 12 |
| Mobile responsive | Task 12 |
| Monochrome palette #060608 background | Task 1 |
| Inter font, tight letter-spacing | Task 1 |
| No layout-triggering animation properties | All tasks (verified Task 13) |
| `{passive: true}` on scroll listeners | Tasks 6, 8, 10 |
| REPEL_STRENGTH 14000, GRAVITY_PULL 10000 | Task 5 |
| Nav link hover underline from center | Task 1 |
| CTA IntersectionObserver entrance | Task 11 |
| Feature tag chips (LangGraph, Spark, etc.) | Task 9 |

**No gaps found.**

**Placeholder scan:** No TBDs, no "similar to Task N", all code blocks complete. ✓

**Type consistency check:**
- `heroContent` → used in Task 6 scroll handler, defined in Task 3 HTML. ✓
- `.js-magnetic` → defined in Task 3 HTML, targeted in Task 6 JS. ✓
- `#feat-canvas` → defined in Task 9 HTML, targeted in Task 10 JS. ✓
- `.feat-panel.active` → defined in Task 9 CSS, toggled in Task 10 JS. ✓
- `.cta-section.visible` → defined in Task 11 CSS, added in Task 11 JS. ✓
- `initMagnetic()` → defined in Task 6, called at end of script. ✓
- `#scrub-section` → defined in Task 8 HTML, targeted in Task 8 JS. ✓
