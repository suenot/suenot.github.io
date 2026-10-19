/**
 * Motion layer for suenot.com. Every effect here is an enhancement: the HTML is
 * complete and visible without it. Tokens mirror src/styles/motion.css.
 *
 * Rules (docs/motion.md): transform and opacity only, ease-out for entrances,
 * ease-in-out for travel, 200-900 ms per element, play once, no layout shift.
 * Only elements that start below the fold get a pending state, so nothing the
 * visitor has already seen disappears. Under prefers-reduced-motion nothing
 * in this file animates.
 *
 * Hooks in markup:
 *   [data-reveal]          fade and rise when it enters view, staggered per batch
 *   [data-blog-post]       same, for archive entries
 *   .terminal-kicker       accent tick draws, label slides in from the inline start
 *   .terminal-heading      HUD scan: a beam sweeps down and uncovers the heading
 *   .terminal-section      the corner reticle locks on
 *   [data-count]           counts up once, width reserved (see prepareCount)
 *   svg[data-wipe]         the line is acquired by a sweeping cover
 *   [data-draw]            children appear column by column; "calendar" adds a playhead
 * Dynamic content dispatches `hud:enhance` on its root after rendering.
 */

import { EASE_OUT, SWEEP, dirSign, motionAllowed } from './motion-tokens';

const STAGGER_MS = 45;
const STAGGER_CAP = 8;

type Kind = 'reveal' | 'kicker' | 'heading' | 'section' | 'count' | 'wipe' | 'draw';

const SELECTORS: [Kind, string][] = [
  ['section', '.terminal-section'],
  ['kicker', '.terminal-kicker'],
  ['heading', '.terminal-heading'],
  ['reveal', '[data-reveal], [data-blog-post]'],
  ['count', '[data-count]'],
  ['wipe', 'svg[data-wipe]'],
  ['draw', '[data-draw]'],
];

const kinds = new WeakMap<Element, Kind>();
/** Every element already considered once; painted content is never re-hidden. */
const seen = new WeakSet<Element>();
let observer: IntersectionObserver | null = null;

const byDocumentOrder = (a: Element, b: Element) =>
  a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;

/* ---------------------------------------------------------------- reveal */

function playReveal(el: HTMLElement, delay: number) {
  el.removeAttribute('data-motion');
  el.animate(
    [
      { opacity: 0, transform: 'translate3d(0, 1rem, 0)' },
      { opacity: 1, offset: 0.55 },
      { opacity: 1, transform: 'none' },
    ],
    { duration: 700, delay, easing: EASE_OUT, fill: 'backwards' },
  );
}

function playKicker(el: HTMLElement, delay: number) {
  el.removeAttribute('data-motion');
  el.animate(
    [
      { opacity: 0, transform: `translate3d(${-0.5 * dirSign()}rem, 0, 0)` },
      { opacity: 1, transform: 'none' },
    ],
    { duration: 520, delay: delay + 60, easing: EASE_OUT, fill: 'backwards' },
  );
  try {
    el.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], {
      duration: 560,
      delay,
      easing: EASE_OUT,
      fill: 'backwards',
      pseudoElement: '::before',
    });
  } catch {
    /* Pseudo-element animation unsupported: the tick is simply there. */
  }
}

function playHeading(el: HTMLElement, delay: number) {
  // Size the cover from the ink extents, not the box: a heading set in a wide
  // fallback face can overflow its column, and no glyph edge may peek out.
  const box = el.getBoundingClientRect();
  const range = document.createRange();
  range.selectNodeContents(el);
  const ink = range.getBoundingClientRect();
  const pad = (Number.parseFloat(getComputedStyle(el).fontSize) || 16) * 0.2;
  const left = Math.max(0, box.left - ink.left) + pad;
  const right = Math.max(0, ink.right - box.right) + pad;
  const top = Math.max(0, box.top - ink.top) + pad;
  const bottom = Math.max(0, ink.bottom - box.bottom) + pad;
  const scan = document.createElement('span');
  scan.className = 'hud-scan';
  scan.setAttribute('aria-hidden', 'true');
  Object.assign(scan.style, {
    left: `${-left - 2}px`,
    right: `${-right - 2}px`,
    top: `${-top}px`,
    height: `${2 * (box.height + top + bottom)}px`,
  });
  el.append(scan);
  el.style.clipPath = `inset(${-top}px ${-right}px ${-bottom}px ${-left}px)`;
  el.removeAttribute('data-motion');
  const sweep = scan.animate([{ transform: 'translate3d(0, -50%, 0)' }, { transform: 'translate3d(0, 0, 0)' }], {
    duration: 780,
    delay,
    easing: SWEEP,
    fill: 'both',
  });
  sweep.finished
    .then(() => scan.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, easing: 'ease-out', fill: 'forwards' }).finished)
    .catch(() => undefined)
    .finally(() => {
      scan.remove();
      el.style.clipPath = '';
    });
}

function playSection(el: HTMLElement, delay: number) {
  el.removeAttribute('data-motion');
  try {
    el.animate(
      [
        { opacity: 0, transform: 'rotate(45deg) scale(0.4)' },
        { opacity: 1, transform: 'none' },
      ],
      { duration: 560, delay, easing: EASE_OUT, fill: 'backwards', pseudoElement: '::before' },
    );
  } catch {
    /* Reticle shows without the lock-on. */
  }
}

/* --------------------------------------------------------------- counters */

type Counter = { final: string; format: (value: number) => string; target: number };
const counters = new WeakMap<HTMLElement, Counter>();

function counterFor(el: HTMLElement): Counter | null {
  const final = el.textContent ?? '';
  const explicit = el.dataset.count ? Number(el.dataset.count) : Number.NaN;
  if (el.hasAttribute('data-count-locale') && Number.isFinite(explicit)) {
    const formatter = new Intl.NumberFormat(document.documentElement.lang || undefined);
    return { final, target: explicit, format: (value) => formatter.format(Math.round(value)) };
  }
  // Template mode: replace the first number in the server text, keep prefix,
  // suffix ("20+"), zero padding ("06") and grouping ("1,234").
  const match = final.match(/\d[\d,]*/);
  if (!match || match.index === undefined) return null;
  const digits = match[0];
  const target = Number.isFinite(explicit) ? explicit : Number(digits.replace(/,/g, ''));
  if (!Number.isFinite(target)) return null;
  const head = final.slice(0, match.index);
  const tail = final.slice(match.index + digits.length);
  const pad = digits.length > 1 && digits.startsWith('0') ? digits.length : 0;
  const grouped = digits.includes(',');
  return {
    final,
    target,
    format: (value) => {
      const rounded = Math.round(value);
      const body = grouped ? rounded.toLocaleString('en-US') : String(rounded).padStart(pad, '0');
      return head + body + tail;
    },
  };
}

/** Reserves the final width, then shows the zero state. No layout shift. */
function prepareCount(el: HTMLElement): boolean {
  if (counters.has(el)) return true;
  const counter = counterFor(el);
  if (!counter) return false;
  const width = el.getBoundingClientRect().width;
  if (getComputedStyle(el).display === 'inline') el.style.display = 'inline-block';
  el.style.minInlineSize = `${Math.ceil(width)}px`;
  el.style.textAlign = 'end';
  el.textContent = counter.format(0);
  counters.set(el, counter);
  return true;
}

function finishCount(el: HTMLElement) {
  const counter = counters.get(el);
  if (!counter) return;
  el.textContent = counter.final;
  el.style.minInlineSize = '';
  el.style.textAlign = '';
  if (el.style.display === 'inline-block') el.style.display = '';
  counters.delete(el);
}

function playCount(el: HTMLElement, delay: number) {
  const counter = counters.get(el);
  el.removeAttribute('data-motion');
  if (!counter) return;
  const duration = 900;
  const start = performance.now() + delay;
  const tick = (now: number) => {
    if (!counters.has(el)) return;
    const t = Math.min(1, Math.max(0, (now - start) / duration));
    const eased = 1 - Math.pow(1 - t, 3);
    const next = counter.format(counter.target * eased);
    if (el.textContent !== next) el.textContent = next;
    if (t < 1) requestAnimationFrame(tick);
    else finishCount(el);
  };
  requestAnimationFrame(tick);
}

/* ------------------------------------------------------------ sparklines */

const SVG_NS = 'http://www.w3.org/2000/svg';
const wipes = new WeakMap<SVGSVGElement, SVGGElement>();

function prepareWipe(svg: SVGSVGElement) {
  const box = svg.viewBox.baseVal;
  if (!box || !box.width) return false;
  const dir = dirSign();
  const group = document.createElementNS(SVG_NS, 'g');
  group.setAttribute('class', 'hud-wipe');
  const cover = document.createElementNS(SVG_NS, 'rect');
  cover.setAttribute('class', 'hud-wipe__cover');
  cover.setAttribute('x', String(box.x - 2));
  cover.setAttribute('y', String(box.y - 2));
  cover.setAttribute('width', String(box.width + 4));
  cover.setAttribute('height', String(box.height + 4));
  const edge = document.createElementNS(SVG_NS, 'rect');
  edge.setAttribute('class', 'hud-wipe__edge');
  edge.setAttribute('x', String(dir > 0 ? box.x - 2 : box.x + box.width + 0.5));
  edge.setAttribute('y', String(box.y - 2));
  edge.setAttribute('width', '1.5');
  edge.setAttribute('height', String(box.height + 4));
  group.append(cover, edge);
  svg.append(group);
  wipes.set(svg, group);
  return true;
}

function playWipe(svg: SVGSVGElement, delay: number) {
  svg.removeAttribute('data-motion');
  const group = wipes.get(svg);
  if (!group) return;
  const distance = (svg.viewBox.baseVal.width + 6) * dirSign();
  const sweep = group.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${distance}px)` }], {
    duration: 900,
    delay: delay + 120,
    easing: SWEEP,
    fill: 'both',
  });
  sweep.finished.catch(() => undefined).finally(() => {
    group.remove();
    wipes.delete(svg);
  });
}

/* --------------------------------------------------------- column drawing */

function prepareDraw(el: HTMLElement) {
  el.dataset.motion = 'pending';
  return true;
}

const WEEK_MS = 12;

/** A playhead crosses the calendar once; each week lights up just behind it. */
function sweepPlayhead(grid: HTMLElement, delay: number, weeks: number) {
  const width = grid.getBoundingClientRect().width;
  if (!width) return;
  const head = document.createElement('span');
  head.className = 'hud-playhead';
  head.setAttribute('aria-hidden', 'true');
  grid.append(head);
  head
    .animate([{ transform: 'translate3d(0, 0, 0)' }, { transform: `translate3d(${width * dirSign()}px, 0, 0)` }], {
      duration: Math.max(200, weeks * WEEK_MS),
      delay,
      easing: 'linear',
      fill: 'both',
    })
    .finished.then(() => head.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, easing: 'ease-out', fill: 'forwards' }).finished)
    .catch(() => undefined)
    .finally(() => head.remove());
}

function playDraw(el: HTMLElement, delay: number) {
  const children = (Array.from(el.children) as HTMLElement[]).filter((child) => !child.classList.contains('hud-playhead'));
  const calendar = el.dataset.draw === 'calendar';
  el.removeAttribute('data-motion');
  children.forEach((child, index) => {
    const week = calendar ? Math.floor(index / 7) : Math.max(0, Number.parseInt(child.style.gridColumn, 10) - 1 || 0);
    const day = calendar ? index % 7 : 0;
    child.animate(
      [
        { opacity: 0, transform: 'scale(0.55)' },
        { opacity: 1, transform: 'none' },
      ],
      { duration: 360, delay: delay + 40 + week * WEEK_MS + day * 14, easing: EASE_OUT, fill: 'backwards' },
    );
  });
  if (calendar) sweepPlayhead(el, delay, Math.ceil(children.length / 7));
}

/* ------------------------------------------------------------- dispatcher */

function settle(el: Element) {
  el.removeAttribute('data-motion');
  if (el instanceof HTMLElement) finishCount(el);
  if (el instanceof SVGSVGElement) {
    wipes.get(el)?.remove();
    wipes.delete(el);
  }
}

function play(el: Element, kind: Kind, delay: number) {
  switch (kind) {
    case 'reveal': return playReveal(el as HTMLElement, delay);
    case 'kicker': return playKicker(el as HTMLElement, delay);
    case 'heading': return playHeading(el as HTMLElement, delay + 80);
    case 'section': return playSection(el as HTMLElement, delay);
    case 'count': return playCount(el as HTMLElement, delay + 160);
    case 'wipe': return playWipe(el as SVGSVGElement, delay);
    case 'draw': return playDraw(el as HTMLElement, delay);
  }
}

function onIntersect(entries: IntersectionObserverEntry[]) {
  const entering = entries.filter((entry) => entry.isIntersecting);
  if (!entering.length) return;
  entering.sort((a, b) => byDocumentOrder(a.target, b.target));
  // Section headers read in order: reticle, kicker, heading, then the rest.
  const hasHeading = entering.some((entry) => kinds.get(entry.target) === 'heading');
  const animate = motionAllowed();
  let staggerIndex = 0;
  for (const entry of entering) {
    const el = entry.target;
    const kind = kinds.get(el);
    observer?.unobserve(el);
    if (!kind) continue;
    // Reduced motion switched on mid-visit: show, do not perform.
    if (!animate) {
      settle(el);
      continue;
    }
    // Jumped past (anchor link, fast scroll up): show it, do not perform it.
    const rootTop = entry.rootBounds?.top ?? 0;
    if (entry.boundingClientRect.bottom < rootTop + 1 || entry.boundingClientRect.top < rootTop - 1) {
      settle(el);
      continue;
    }
    if (kind === 'reveal' || kind === 'count') {
      play(el, kind, (hasHeading ? 220 : 0) + Math.min(staggerIndex, STAGGER_CAP) * STAGGER_MS);
      staggerIndex += 1;
    } else {
      play(el, kind, 0);
    }
  }
}

function getObserver() {
  observer ??= new IntersectionObserver(onIntersect, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
  return observer;
}

function prepare(el: Element, kind: Kind): boolean {
  if (kind === 'count') return prepareCount(el as HTMLElement);
  if (kind === 'wipe') return prepareWipe(el as SVGSVGElement);
  if (kind === 'draw') return prepareDraw(el as HTMLElement);
  (el as HTMLElement).dataset.motion = 'pending';
  return true;
}

/**
 * Wires every motion hook under `root`. Server-rendered content only moves if
 * it starts below the fold; freshly rendered content (`fresh`) may also play
 * in place because it has never been painted.
 */
export function enhance(root: ParentNode = document, fresh = false) {
  if (!motionAllowed()) return;
  const io = getObserver();
  const fold = window.innerHeight;
  for (const [kind, selector] of SELECTORS) {
    const scope = root instanceof Element && root.matches(selector) ? [root] : [];
    const found = [...scope, ...Array.from(root.querySelectorAll(selector))];
    for (const el of found) {
      if (seen.has(el) || el.closest('[data-motion-skip]')) continue;
      const rect = el.getBoundingClientRect();
      // Not rendered yet (hidden container): consider it again when it appears.
      if (!rect.width && !rect.height) continue;
      seen.add(el);
      if (!fresh && rect.top <= fold) continue;
      if (!prepare(el, kind)) continue;
      kinds.set(el, kind);
      io.observe(el);
    }
  }
}

/** Counters that belong to an on-load intro (hero stats) start on a timer. */
function startIntroCounters() {
  document.querySelectorAll<HTMLElement>('[data-count-intro]').forEach((el) => {
    if (seen.has(el)) return;
    if (el.getBoundingClientRect().top > window.innerHeight) return;
    if (!prepareCount(el)) return;
    seen.add(el);
    kinds.set(el, 'count');
    playCount(el, Number(el.dataset.countIntro) || 0);
  });
}

function init() {
  if (!motionAllowed()) return;
  startIntroCounters();
  enhance(document);
  document.addEventListener('hud:enhance', (event) => {
    if (event.target instanceof Element) enhance(event.target, true);
  });
}

init();
