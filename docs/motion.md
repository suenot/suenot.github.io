# Motion

Motion on suenot.com reads as a HUD acquiring data: type is uncovered, lines
are scanned, numbers settle, the calendar is drawn. It never hides content.

## Contract

- Server-rendered HTML is complete. With JavaScript off or under
  `prefers-reduced-motion: reduce` everything is static and visible.
- A pending (hidden) state exists only after `src/scripts/motion.ts` has run,
  only for elements that start below the fold, and only when motion is
  allowed. Anything already painted is never re-hidden. An element skipped by
  an anchor jump or scrolled into from above is shown at once.
- Transform and opacity only. Ease-out for entrances, ease-in-out for travel,
  200-900 ms per element, every animation plays once. The only loop is the
  loading cursor of the activity calendar.
- No layout shift: counters reserve their final width, the readout has fixed
  columns, overlays are absolutely positioned.
- RTL: horizontal movement uses `dirSign()` in scripts and `--dir` in CSS, so
  it runs toward the inline end in Arabic too. The hero name lines are
  isolated as LTR so the split letters keep their order.
- The readout reports scroll position only. It is not a recorder: no REC
  label and no timecode.

## Files

- `src/styles/motion.css`: tokens (`--ease-out`, `--ease-in-out`, `--dir`),
  pending states, the HUD scan beam, sparkline wipe, view transitions.
- `src/scripts/motion-tokens.ts`: the same tokens for scripts, no side effects.
- `src/scripts/motion.ts`: one IntersectionObserver plus WAAPI.
- `src/scripts/hud-readout.ts`: nav readout, depth hairline, nav cursor.
- `src/scripts/flip.ts`: FLIP helper used by blog search.
- `src/components/Hero.astro`: build-time letter split with a CSS-only reveal,
  the staged intro and the particle-assembly intro of the cube.

## Hooks

| Hook | Effect |
| --- | --- |
| `[data-reveal]`, `[data-blog-post]` | fade and rise on entry, staggered 45 ms per batch |
| `.terminal-kicker` | accent tick draws, label slides from the inline start |
| `.terminal-heading` | HUD scan: a beam sweeps down and uncovers the heading |
| `.terminal-section` | the corner reticle locks on |
| `[data-count]` | counts up once; `data-count-locale` formats with `Intl` |
| `[data-count-intro="ms"]` | count starts on a timer as part of the hero intro |
| `svg[data-wipe]` | the line is acquired by a sweeping cover |
| `[data-draw="calendar" or "columns"]` | children appear column by column; a calendar also gets one playhead sweep |
| `[data-motion-skip]` | opt a subtree out |

Content rendered after load dispatches `hud:enhance` on its root (see
`Contributions.astro`); new elements in it may then play in place.

Code activity (the last section on the homepage, numbered 08): source rows
enter in sequence and available totals count up; an unavailable source shows
its label instead of a number. The calendar draws week by week behind a
playhead that crosses it once (right to left in Arabic). Hovering a day locks
the cell and writes its date and count into the caption line. Without
JavaScript the section states that activity is unavailable.

New projects, categories and posts need no motion code: rows rendered from
data carry the hooks.

## Budget

Home page first-load JS: 6.96 KB gzip before the motion layer, 11.40 KB after
(no animation library).

## Verification

`bun run build`, then screenshots in Camoufox (Firefox) at 1440x900 and
390x844 for `/` and `/ar/`, with reduced motion and with JavaScript off. CSS
intro frames can be checked deterministically by pausing every animation and
setting `currentTime` (`document.getAnimations()`).
