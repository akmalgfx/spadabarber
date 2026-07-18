# Design — "The Arena"

Dark cinematic system derived directly from the Spada TORQ commercial footage (steel-blue night grade, fog, hard top-spotlight on white tools, electric-blue LED).

## Color

OKLCH tokens (hex fallbacks shown). Strategy: **Drenched dark** — the night grade IS the surface; the white product is the brightest element on every page.

| Token | Value | Role |
|---|---|---|
| `--night` | `oklch(15% 0.018 245)` ≈ #0a0f15 | page ground |
| `--night-2` | `oklch(19% 0.022 243)` ≈ #101823 | raised panels |
| `--steel` | `oklch(26% 0.028 240)` ≈ #1b2836 | borders-strong, deep surfaces |
| `--fog` | `oklch(74% 0.03 235)` ≈ #9db4c6 | secondary text (AA on night) |
| `--chrome` | `oklch(94% 0.008 235)` ≈ #e9eef3 | primary text, headlines |
| `--led` | `oklch(72% 0.145 245)` ≈ #4fb4ff | accent: CTAs, focus, glow, live details |
| `--led-deep` | `oklch(55% 0.16 250)` | accent hover/pressed |

Glows: LED blue at low alpha, radial. Spotlights: fog-blue radial gradients from top. No warm tones anywhere — the grade is cold.

## Typography

- **Display / brand headlines:** Chakra Petch 700 italic, uppercase — angular blade-cut forms matching the SPADA wordmark. `letter-spacing: 0.01em` (never negative beyond -0.02em).
- **Spec numbers / labels / nav:** Barlow Condensed 500–700 — industrial signage voice for armory-plaque stats.
- **Body:** Barlow 400/500, `line-height: 1.75` on dark, max 70ch.

Scale: fluid clamp(), ratio ≥1.3. Hero display caps at 5.5rem.

## Signature moves

- **Spotlight staging:** transparent product PNGs lit by a radial cone from above + floor reflection (scaleY(-1) with mask fade) + LED glow accent — recreating the IG post look in CSS.
- **Fog:** slow-drifting blurred radial layers at section seams. Static under reduced motion.
- **Video slots:** hero and mid-page bands accept `assets/videos/*.mp4`; JS falls back to the CSS atmosphere scene until files exist.
- **Kicker system (deliberate, single device):** the italic `TORQ /` blade-tag appears only on product showcases — never generic section eyebrows.

## Components

- **Buy fork dialog:** every Buy CTA opens the two-door dialog — "I cut for a living" → empirebarber.ca trade price / "For home" → Amazon. Native `<dialog>`, keyboard-safe, remembers the last door.
- **CTAs:** primary = LED-blue border + text with glow on hover (never filled blue slabs); secondary = fog-outline ghost.
- **Spec plaques:** stat rows on hairline `--steel` rules — no cards-in-grids.

## Motion

ease-out-quint everywhere. IntersectionObserver reveals gated behind an `html.js` class (content fully visible without JS). Fog drift 40s+ loops. Full `prefers-reduced-motion: reduce` alternates.

## Files

Static multi-page: `index.html`, `torq-clipper.html`, `torq-trimmer.html`, `torq-shaver.html`, `accessories.html` + `css/main.css` + `js/main.js`. Product links config lives at the top of `js/main.js` (`PRODUCT_LINKS`) for easy swap when final Amazon URLs arrive.
