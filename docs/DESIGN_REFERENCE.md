# Squarespace Design Intelligence — Visual & Architectural Reference Study

> **Document Version:** 1.0.0  
> **Target Reference:** [https://www.squarespace.com/design-intelligence](https://www.squarespace.com/design-intelligence)  
> **Inspection Date:** October 13, 2026  
> **Analyzed Viewports:** Desktop (1440 × 900 px) & Mobile (390 × 844 px)  
> **Purpose:** Blueprint for KestrelCI's presentation layer redesign. Captures composition, motion language, typography, spatial depth, and restraint for reproduction in an editorial CI/CD context.

---

## 1. Executive Summary & Philosophy

Squarespace's *Design Intelligence* page represents a paradigm shift away from cookie-cutter SaaS layouts (no pastel gradients, no glowing orbs, no pill badges, no stacked filled buttons, no template dashboard card under the hero).

Instead, it presents:
1. **An Immersive Cinematic Black Stage:** Full bleed pure black (`#000000`), 100vh viewport height, no light borders or card-on-gray containers.
2. **Modest, Restrained Center Typography:** A light-weight (300/400) statement paragraph of 22–26px at line-height 1.1–1.15, soft off-white (`#F0EFEA`), centered, constrained to ~50% viewport width, paired with an uppercase text link CTA (`START A RUN →`). No giant bold shouting headlines.
3. **WebGL Particle Sphere as Living Core:** Thousands of luminous points assembled on an ethereal spherical shell, breathing through noise shaders and slowly rotating (~0.02 rad/s), casting loose dust particles outward toward peripheral cards.
4. **Perceptual 3D Depth via Floating Tilted UI Cards:** 5–6 elements arranged around the viewport periphery with discrete `rotateX`, `rotateY`, `rotateZ`, and `translateZ` coordinates under `perspective: 1200px`. Every primary card features an **overlapping chip pinned over its corner** to establish tactile physical layering.
5. **Architectural Restraint:** Strictly monochrome chrome. Accent colors are forbidden on UI buttons and borders; color appears exclusively inside card data surfaces and semantic pipeline status badges.

---

## 2. Computed Styles & Token Measurements

### A. Color Palette
- **Stage Black:** `#000000` (Hero stage and closing CTA band are *always* pure black across both light and dark site themes).
- **Dark Surface:** `#07070A` to `#111215` (Used on dark cards and dark theme app views).
- **Light Theme Surface:** Clean paper white `#FDFCFA` with `#F2EFE9` subtle tint.
- **Hairline Dividers:** `rgba(255, 255, 255, 0.12)` (Dark stage) / `rgba(0, 0, 0, 0.10)` (Light stage). 1px crisp width, 0px border radius or 2px micro-chamfer.
- **Text Tones:**
  - Primary Light: `#FFFFFF` and `#F5F5F3`
  - Secondary Light (Byline / Subtitle): `rgba(255, 255, 255, 0.65)`
  - Tertiary / Footnotes: `rgba(255, 255, 255, 0.40)`
- **Accent Philosophy:** Zero orange/blue/indigo accent fills on interactive buttons. Primary buttons are solid inverted rectangular blocks (`#FFFFFF` on dark stage, `#07070A` on light theme). Muted semantic colors (`#34D399` success, `#F87171` failed, `#FBBF24` running amber, `#6B7280` skipped) appear strictly inside status indicators.

### B. Typography Hierarchy
- **Neo-Grotesk Family:** `Instrument Sans` (reproducing `Clarkson`), weights 300 (Light) and 400 (Regular).
- **Editorial Display Serif:** `Instrument Serif` (reproducing `Clarkson Serif`), weight 400 italic and normal, used solely on card titles (e.g., *"Run #412"*) and select statement moments.
- **Monospace Family:** `JetBrains Mono` for commit hashes, timestamps, log output, and duration measurements (`font-variant-numeric: tabular-nums`).
- **Hierarchy Scale:**
  - **Eyebrow / Section Micro-Label:** `11px – 13px`, uppercase, `letter-spacing: 0.08em – 0.12em`, `font-weight: 500`.
  - **Hero Statement:** `22px – 26px`, line-height `1.15`, `letter-spacing: -0.02em`, `font-weight: 300`, centered, max-width `640px`.
  - **Section Statement Titles:** `clamp(40px, 4vw, 56px)`, `font-weight: 300`, `letter-spacing: -0.04em`, line-height `1.05`.
  - **Card Titles:** `18px – 22px`, `font-weight: 400`.
  - **Body Text:** `14px – 15px`, line-height `1.5`, `color: rgba(255,255,255,0.7)`.
  - **Footnotes / Badges:** `11px – 12px`, uppercase, tracked.

### C. Button & Link Specifications
- **Primary Action (CTA):**
  - Shape: Sharp rectangular with `border-radius: 0px` (or `2px`).
  - Fill: Solid pure white (`#FFFFFF`) on dark stage.
  - Text: Solid pure black (`#000000`), uppercase, tracked `0.06em`, font size `12px – 13px`, font weight `500`.
  - Padding: `14px 24px`.
  - Hover Interaction: Label translates `translateX(-4px)` while arrow icon slides in from `-100%` to `0%` over `350ms cubic-bezier(0.16, 1, 0.3, 1)`.
- **Secondary / Text Link:**
  - Text: Uppercase, tracked, font size `12px – 13px`, color `#FFFFFF`.
  - Underline: Animated hairline underline drawing from left to right on hover.
  - Suffix: Arrow glyph `→` with `margin-left: 6px`.

### D. Spacing & Grid System
- 12-column symmetrical layout grid with `8px` baseline rhythm.
- Section vertical padding: `140px – 180px` on desktop, `80px – 100px` on mobile.
- Gutter width: `24px – 32px`.

---

## 3. The Hero Layered Scene Architecture

The hero is constructed as a 4-layer composition within a pinned 100vh viewport (`perspective: 1200px`):

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: Header & Announcement Bar (Fixed / Transparent)    │
├─────────────────────────────────────────────────────────────┤
│ Layer 3: Central Statement & CTA Link (Line-by-line reveal) │
├─────────────────────────────────────────────────────────────┤
│ Layer 2: 3D Floating Tilted UI Cards (6 peripheral objects) │
├─────────────────────────────────────────────────────────────┤
│ Layer 1: WebGL Particle Sphere & Dust Streams (Three.js)    │
├─────────────────────────────────────────────────────────────┤
│ Layer 0: Pure Black Stage (#000000)                         │
└─────────────────────────────────────────────────────────────┘
```

### Layer 1: WebGL Particle Sphere (Core Engine)
- **Geometry:** 42,000 vertices distributed across a Fibonacci sphere shell (radius: ~2.8 units). Desktop capped at 45,000; Mobile scaled to 9,000 points.
- **Shader Dynamics:** Vertex shader applies 3D Perlin simplex noise displacement to vertex radii, creating a pulsating "breathing" membrane.
- **Rotation:** Constant gentle yaw of `0.018 rad/s`.
- **Point Attributes:** Particle size 1.2px – 2.0px with distance attenuation and soft depth-of-field alpha fading.
- **Dust Streams:** Secondary emitter generating ~180 loose dust motes drifting outward toward the peripheral floating cards with subtle warm amber tinting (`#F59E0B` at 15% opacity).
- **Lifecycle Optimization:** Automatically pauses animation loop when tab is hidden or element scrolls off-screen; clamps DPR to 2.0; gracefully falls back to static pre-rendered SVG/Canvas poster on `prefers-reduced-motion`.

### Layer 2: Floating 3D Cards (Peripheral Matrix)
Six distinct elements placed in 3D perspective space around the center text:

| Card # | Semantic Role | 3D Coordinates (Translate & Rotate) | Visual Construction |
|---|---|---|---|
| **Card 1** (Top Left) | Pipeline Stage Monitor | `translate3d(-420px, -210px, 40px)`<br>`rotateX(12deg) rotateY(16deg) rotateZ(-6deg)` | Dark tablet panel (`#0E1015`) showing 7 pipeline stage ticks (`checkout` → `deploy`) with Stage 03 pulsing amber. Overlapping chip: pinned `"RUNNING"` badge in top-right corner. |
| **Card 2** (Top Right) | Execution Log Excerpt | `translate3d(430px, -190px, -20px)`<br>`rotateX(10deg) rotateY(-18deg) rotateZ(5deg)` | Light cream paper card (`#F5F4EE`) displaying clean monospace log timestamps, a test pass line, and a duration meter (`1,420ms`). Overlapping chip: `"STDOUT"` pinned tag. |
| **Card 3** (Mid Right) | Failure & Recovery Slab | `translate3d(460px, 90px, 60px)`<br>`rotateX(-8deg) rotateY(-20deg) rotateZ(3deg)` | Translucent dark glass slab (`rgba(14,16,21,0.85)`) with serif headline *"Run #412"*, error report *"Failed at stage 05 — 3 skipped"*, and an overlapping circular SVG progress indicator. Overlapping chip: `"EXIT 1"` red chip. |
| **Card 4** (Bottom Left) | Environment Deployment | `translate3d(-440px, 160px, -10px)`<br>`rotateX(-12deg) rotateY(14deg) rotateZ(-4deg)` | Multi-swatch card with environment targets (`dev`, `staging`, `prod`) resting on a procedural SVG grain noise plate. Overlapping chip: `"PROV_OK"` chip. |
| **Card 5** (Bottom Right) | Status Capsule Trio | `translate3d(320px, 280px, 80px)`<br>`rotateX(-6deg) rotateY(-12deg) rotateZ(8deg)` | Three frosted translucent pills grouped at varying angles: `"Success"`, `"Skipped"`, `"Failed"`, with dust motes settling on their glass surface. |
| **Card 6** (Bottom Center-Left) | Commit Identity Badge | `translate3d(-260px, 290px, 50px)`<br>`rotateX(-14deg) rotateY(8deg) rotateZ(-3deg)` | Compact dark slab displaying commit SHA `c8f1e09`, branch `main`, and monotonic run `#413`. Overlapping chip: `"SIMULATED"` micro-badge. |

- **Physics & Motion:**
  - Float cycle: Independent smooth sinusoidal oscillation (periods between 7.5s and 11s, amplitudes 8px – 14px).
  - Cursor Parallax: Pointer movement generates subtle perspective shifts (max 12px translation, 2.5deg rotation) proportional to each card's Z-depth.
  - Depth of Field: Cards with negative Z-coordinates receive `filter: blur(1.5px)` and opacity `0.78` to simulate lens focus.

### Layer 3: Central Statement & Typography
- **Welcome Line:** Light italic serif / tracked uppercase subtitle: *"Autonomous Verification"*.
- **The Core Statement:** 
  > *"Every pipeline run is an experiment in resilience. KestrelCI simulates seven sequential delivery stages with deterministic failure injection, realistic telemetry, and non-blocking background orchestration."*
- **Action Link:** Solid white uppercase link: `START A RUN →` with arrow slide animation.
- **Honesty Rule Tagline:** Small mono caption: `SIMULATION RUNNER • ZERO REMOTE INFRASTRUCTURE`.

### Layer 4: Header & Announcement Bar
- **Announcement Bar:** Slim pure black bar at top edge with 1px border. Centered message: `SIMULATED ENGINE V1.0 • DETERMINISTIC STAGE TESTING`. Small code chip `pipe_core_main` with copy button, dismiss icon.
- **Header:** Full bleed, transparent background. Left: Kestrel glyph + all-caps tracked `KESTREL CI`. Center: Small uppercase tracked navigation with chevrons (`PLATFORM ▾`, `DOCUMENTATION ▾`, `ARCHITECTURE ▾`). Right: `API KEY` indicator, `Cmd+K` search pill, and white square `LAUNCH RUN` button.

---

## 4. Below-Hero Section Sequence & Rhythm

Following the reference's editorial cadence, the page flows through high-contrast, asymmetric moments:

### 1. Statement Section ("Resilience by Design")
- Full-width dark background transitioning into the active theme.
- One oversized, light-weight (weight 300) thesis statement:
  > *"Software delivery fails at the edges. True confidence comes from knowing exactly how your deployment pipeline responds when stage five collapses."*
- Minimalist text link CTA with animated underline: `EXPLORE RUN ARCHITECTURE →`.

### 2. Five Asymmetric Feature Blocks
Rather than repetitive 3-column card grids, each feature pairs a **live, fully interactive miniature component** in a perspective-tilted container with editorial copy:
1. **The 7-Stage Conduit:** Live horizontal pipeline flow showing active state transitions and failure propagation.
2. **Terminal Telemetry:** Live monospace log stream viewer with timestamp formatting, severity colors, and copy-line interactions.
3. **Deterministic Fault Injection:** The `failAt` and `failureRate` configuration modal showing pre-flight injection.
4. **Resumption Engine:** Smart retry demonstration showing preservation of stages 1–4 and resumption at stage 5.
5. **Observability Metrics:** High-density summary cards displaying monotonic run numbers, pass rates, and duration histograms.

### 3. "Everything In One Place" Architecture Strip
A crisp, hairline-drawn SVG schematic visualizing the separation between Client SPA, Express API v1, Background Engine, and SQLite repository isolation, animating line strokes into view on scroll.

### 4. Editorial FAQ Disclosure
Large light-weight question titles (`22px – 28px`), 1px hairline dividers, accessible `aria-expanded` toggle with smooth rotating `+` glyph and height transitions.

### 5. Closing CTA Band (Always Pure Black)
A return to the immersive black stage: the WebGL particle sphere reappears at reduced scale behind a focused call to action: *"Deploy your first simulated pipeline"*, accompanied by the white square CTA button.

### 6. Architectural Footer (Always Pure Black)
Multi-column layout (Platform, Architecture, Documentation, Legal), system status beacon (`ENGINE ONLINE :4000`), shared `LAST_UPDATED` constant, and skip-to-contact form trigger.

---

## 5. Accessibility & Motion Governance

- **WCAG 2.2.2 Compliance:** A visible, accessible "Pause Motion" button is pinned in the announcement bar / hero overlay to halt particle shaders and card floating loops immediately.
- **Prefers-Reduced-Motion:** Detects OS accessibility settings. When active, WebGL particle shaders halt, CSS 3D transforms flatten to static layout positions, and blur filters are removed.
- **Focus Indicators:** Explicit 2px high-contrast focus rings (`outline: 2px solid #FFFFFF; outline-offset: 3px;`) on all interactive buttons, links, and disclosure controls.
- **Contrast Integrity:** Text overlays against dark stage maintain a minimum contrast ratio of `12.5:1` (exceeding WCAG AAA).

---

## 6. Implementation Checklist & Mapping

- [x] Phase 0: Design Reference Document compiled from direct reference analysis.
- [ ] Phase 1: Overhaul design tokens in `client/src/styles/tokens.css` (Pure black stage, `Instrument Sans`, `Instrument Serif`, square buttons, hairline borders).
- [ ] Phase 2: Implement WebGL particle sphere with Three.js vertex shaders + 6 tilted floating 3D cards + layered DOM hero.
- [ ] Phase 3: Rebuild Landing Page sections (Statement, 5 Asymmetric Feature blocks with live components, Architecture strip, FAQ, Closing band).
- [ ] Phase 4: Restyle header, announcement bar, navigation mega-menu, and app views to match the new language.
- [ ] Phase 5: Verify all 13 required features (Search, theme toggle, modals, cookie banner, copy buttons, etc.) in both light and dark modes.
