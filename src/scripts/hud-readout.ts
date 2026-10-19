/**
 * Scroll readout in the nav: index of the section under the reading line,
 * its code, and scroll depth, plus a hairline depth bar and a cursor under the
 * matching nav link. It reports position only; it is not a recorder and shows
 * no timecode. Position is state, not motion, so it also runs under reduced
 * motion (the CSS drops the cursor transition there).
 */
const CODES: Record<string, string> = { top: 'INDEX', tech: 'STACK' };
const READING_LINE = 0.4;

function codeFor(id: string) {
  return CODES[id] ?? id.replace(/[-_]+/g, ' ').toUpperCase();
}

function init() {
  const readout = document.querySelector<HTMLElement>('[data-readout]');
  const bar = document.querySelector<HTMLElement>('[data-readout-bar]');
  if (!readout || !bar) return;
  const indexEl = readout.querySelector<HTMLElement>('[data-readout-index]');
  const codeEl = readout.querySelector<HTMLElement>('[data-readout-code]');
  const depthEl = readout.querySelector<HTMLElement>('[data-readout-depth]');

  const main = document.getElementById('main-content');
  const sections = main ? Array.from(main.querySelectorAll<HTMLElement>(':scope > section[id]')) : [];
  const headings = Array.from(document.querySelectorAll<HTMLElement>('main article h2[id]'));
  const marks = sections.length >= 2 ? sections : headings;
  const coded = marks === sections;
  const total = String(marks.length).padStart(2, '0');
  if (!marks.length) indexEl?.setAttribute('hidden', '');
  if (!coded) codeEl?.setAttribute('hidden', '');

  const navList = document.querySelector<HTMLElement>('[data-nav-index]');
  const cursor = navList?.querySelector<HTMLElement>('[data-nav-cursor]') ?? null;
  const navLinks = new Map<string, HTMLAnchorElement>();
  navList?.querySelectorAll<HTMLAnchorElement>('a[href*="#"]').forEach((link) => {
    const url = new URL(link.href, location.href);
    if (url.pathname === location.pathname && url.hash.length > 1) navLinks.set(decodeURIComponent(url.hash.slice(1)), link);
  });

  let shownIndex = '';
  let shownCode = '';
  let shownDepth = '';
  let activeId: string | null = null;
  let queued = false;

  const update = (force = false) => {
    queued = false;
    // Reads first.
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    const line = window.innerHeight * READING_LINE;
    let current = -1;
    for (let i = 0; i < marks.length; i += 1) {
      if (marks[i].getBoundingClientRect().top <= line) current = i;
      else break;
    }
    if (progress > 0.995 && marks.length) current = marks.length - 1;
    const id = current >= 0 ? marks[current].id : '';
    const link = navLinks.get(id) ?? null;
    let cursorTransform = '';
    if ((force || id !== activeId) && cursor && navList && link) {
      const listRect = navList.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      if (linkRect.width) cursorTransform = `translate3d(${linkRect.left - listRect.left}px, 0, 0) scaleX(${linkRect.width})`;
    }

    // Then writes.
    bar.style.transform = `scaleX(${progress})`;
    const depth = `${String(Math.round(progress * 100)).padStart(3, '0')}%`;
    if (depth !== shownDepth && depthEl) depthEl.textContent = shownDepth = depth;
    if (marks.length) {
      const index = `${String(current + 1).padStart(2, '0')}/${total}`;
      if (index !== shownIndex && indexEl) indexEl.textContent = shownIndex = index;
      const code = coded && id ? codeFor(id) : coded ? codeFor('top') : '';
      if (code !== shownCode && codeEl) codeEl.textContent = shownCode = code;
    }
    if (force || id !== activeId) {
      navLinks.forEach((candidate) => candidate.removeAttribute('data-active'));
      link?.setAttribute('data-active', '');
      if (cursor) {
        if (cursorTransform) {
          // Appearing: fade in on the spot. Already visible: travel to the new link.
          const appearing = !('visible' in cursor.dataset);
          if (appearing) cursor.style.transition = 'opacity 200ms ease';
          cursor.style.transform = cursorTransform;
          cursor.dataset.visible = '';
          if (appearing) requestAnimationFrame(() => requestAnimationFrame(() => cursor.style.removeProperty('transition')));
        } else {
          delete cursor.dataset.visible;
        }
      }
      activeId = id;
    }
  };

  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => update());
  };

  readout.hidden = false;
  update(true);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', () => requestAnimationFrame(() => update(true)), { passive: true });
  document.fonts?.ready.then(() => update(true));
}

init();
