# KestrelCI Design System Specification

## 1. Architectural Foundation & Inspiration

The visual identity and interaction design of **KestrelCI** are modeled after the cinematic, restrained editorial aesthetic of **Squarespace Design Intelligence** (`https://www.squarespace.com/design-intelligence`).

Rather than adopting generic SaaS conventions (off-white pages, shouting bold headlines, pill badges, orange/purple filled buttons, and stacked dashboard mockups), KestrelCI implements:
1. **Permanent Pure Black Stages**: The hero viewport and closing CTA band remain pure black (`#000000`) across both light and dark themes.
2. **Strictly Monochrome Chrome**: Zero brand accent fills on buttons or containers. Primary buttons are solid high-contrast monochrome rectangles (solid white on dark / solid ink on light).
3. **Restrained Editorial Typography**: Modest headline scales (light-weight neo-grotesk 300/400 sans paired with high-contrast display serif titles), tracked uppercase labels, and monospaced technical figures.
4. **Cinematic 3D Depth**: A WebGL Three.js particle sphere behind floating, perspective-tilted UI cards featuring overlapping pinned chips.
5. **Architectural Asymmetry**: Varied rhythm below the hero pairing live interactive pipeline components with concise technical copy and hairline borders.

---

## 2. Design Token System (`client/src/styles/tokens.css`)

All colors, typography, elevations, and transition curves are governed by CSS custom properties in `client/src/styles/tokens.css`.

### 2.1 Theme Structure & Segregation

- **Hero & Closing CTA**: Always rendered against the `#000000` stage canvas with white typography, regardless of active theme.
- **Light Theme (`:root`)**: Clean paper white (`#FDFCFA`), crisp hairlines (`#E5E5E8`), and deep ink (`#07070A`).
- **Dark Theme (`html.dark`)**: Warm obsidian (`#07070A`), subtle charcoal surfaces (`#0E0E12`), and soft off-white ink (`#F2F2F4`).

### 2.2 Color Tokens

| Token | Light Value | Dark Value | Purpose |
|---|---|---|---|
| `--color-stage-black` | `#000000` | `#000000` | Hero and closing band permanent stage background |
| `--color-bg-base` | `#FDFCFA` | `#07070A` | Primary body background |
| `--color-bg-surface` | `#FFFFFF` | `#0E0E12` | Elevated cards, modals, table rows |
| `--color-bg-subtle` | `#F4F4F6` | `#16161C` | Input wells, code blocks, tab panels |
| `--color-ink-primary` | `#07070A` | `#F2F2F4` | Primary titles, bold copy |
| `--color-ink-muted` | `#606066` | `#96969E` | Secondary descriptions, labels, meta |
| `--color-ink-faint` | `#909099` | `#585862` | Breadcrumbs, borders, inactive tabs |
| `--color-border-line` | `#E5E5E8` | `rgba(255,255,255,0.12)` | Hairline dividers and card borders |
| `--color-border-subtle`| `#ECECEF` | `rgba(255,255,255,0.06)` | Subtle nested table and grid dividers |

### 2.3 Semantic Status Tokens (Muted)

Status tokens are strictly reserved for stage outcomes, diagnostic logs, and telemetry badges. They are **never** used for button backgrounds or generic brand chrome.

| Semantic State | Light Theme | Dark Theme | Purpose |
|---|---|---|---|
| `success` | `#059669` | `#34D399` | Stage passed, zero regressions |
| `running` | `#D97706` | `#FBBF24` | Active execution cycle |
| `failed` | `#DC2626` | `#F87171` | Execution failure or fault injection |
| `skipped` | `#64748B` | `#94A3B8` | Downstream bypassed stages |
| `pending` | `#94A3B8` | `#64748B` | Queued in engine registry |

---

## 3. Typography Triad

KestrelCI uses three specialized typefaces loaded via Google Fonts:

1. **`Instrument Sans`** (`sans-serif`):
   - Weights: `300` (Light), `400` (Regular), `500` (Medium).
   - Usage: Hero statement paragraph (`font-light`), body copy, feature titles, button labels.
   - Character: Geometric neo-grotesk with open counters and balanced neutral personality.
2. **`Instrument Serif`** (`serif`):
   - Weights: `400` (Regular / Italic).
   - Usage: Specimen card titles (e.g. *Run #412*), editorial section highlights.
   - Character: High-contrast classical modern serif delivering restrained prestige.
3. **`JetBrains Mono`** (`monospace`):
   - Weights: `400` (Regular), `500` (Medium), `600` (SemiBold).
   - Usage: Commit hashes, tabular timestamps, pipeline IDs, log streams, execution durations, uppercase tracking labels (`text-[10px] uppercase tracking-[0.2em] font-mono`).

---

## 4. Component Patterns & Physics

### 4.1 Buttons & Interactive Links
- **Primary Button**: Solid white background on dark stage / solid ink on light surface. Completely square or 2px corners (`rounded-[2px]`). Uppercase tracked typography (`text-xs font-mono uppercase tracking-wider`). Includes an animated arrow glyph that translates `+3px` horizontally on hover.
- **Secondary / Action Links**: Text links with the `.draw-underline` class. A hairline underline expands from `0%` to `100%` width on hover with easing `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Anti-Pattern Guard**: Two filled buttons side-by-side are banned. Pairing must always be Primary Rectangular Solid + Text Link / Hairline Outline.

### 4.2 Floating 3D Cards & Overlapping Chips
Peripheral cards in the hero and key feature visualizers employ 3D CSS transforms:
- `transform: perspective(1000px) rotateX(12deg) rotateY(-8deg) rotateZ(3deg)`
- **Overlapping Pin Pattern**: Every large floating card features a smaller monospaced chip pinned across its corner (e.g., `-top-2.5 -right-2` with `RUNNING`, `STDOUT`, `EXIT 1`, `PROV_OK`), breaking bounding boxes to create physical depth.
- Mouse parallax coordinates subtly modulate rotation and translation on desktop viewports.

### 4.3 WebGL Particle Sphere (`ParticleSphere.jsx`)
- Built with Three.js `BufferGeometry` and `PointsMaterial`.
- 42,000 particles on desktop (`window.innerWidth >= 768px`), 8,500 particles on mobile.
- **GPU-Driven Vertex Breathing**: Subtle sine-wave displacement gives the sphere an organic breathing rhythm.
- **Warm Dust Streams**: Tangential emission curves with warm amber tint (`#E5A869`) drifting toward the floating cards.
- **Accessibility & Performance**:
  - Automatically paused when the hero leaves viewport (`IntersectionObserver`).
  - Automatically paused when browser tab is hidden (`document.visibilityState`).
  - WCAG 2.2.2 Pause Motion toggle in the announcement bar instantly freezes particle updates.
  - `@media (prefers-reduced-motion: reduce)` renders a static celestial aura.

---

## 5. Re-Skinning & Extension Guide

To adapt or re-skin KestrelCI for another platform or client:
1. **Update CSS Variables**: Modify the root tokens in `client/src/styles/tokens.css`. Because all components consume semantic classes (`bg-surface`, `text-ink`, `border-line`), modifying the variables immediately changes the entire application.
2. **Font Replacements**: Change the Google Fonts link in `client/index.html` and update `fontFamily` definitions in `client/tailwind.config.js`.
3. **Stage Registered Names**: When registering new stages in `server/engine/stageRegistry.js`, the frontend automatically maps any status to the semantic `Badge` and `StageNode` components without requiring UI rewrites.
