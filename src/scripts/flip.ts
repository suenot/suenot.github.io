import { EASE_OUT, motionAllowed } from './motion-tokens';

/**
 * FLIP for list filtering: measure, mutate, then glide the survivors from
 * where they were to where they are. Items that appear fade in; items that
 * leave go at once (the visitor is typing, the answer must not wait).
 * Only elements near the viewport are measured, so long lists stay cheap.
 */
export function flip(items: HTMLElement[], mutate: () => void) {
  if (!motionAllowed()) {
    mutate();
    return;
  }
  const margin = window.innerHeight * 0.5;
  const near = (rect: DOMRect) => rect.bottom > -margin && rect.top < window.innerHeight + margin;
  const before = new Map<HTMLElement, DOMRect>();
  for (const item of items) {
    if (item.hidden) continue;
    const rect = item.getBoundingClientRect();
    if (near(rect)) before.set(item, rect);
  }
  items.forEach((item) => item.getAnimations().forEach((animation) => animation.cancel()));
  mutate();
  for (const item of items) {
    // Hidden, or still waiting for its scroll reveal (motion.ts owns that one).
    if (item.hidden || item.dataset.motion === 'pending') continue;
    const rect = item.getBoundingClientRect();
    if (!near(rect)) continue;
    const previous = before.get(item);
    if (previous) {
      const dx = previous.left - rect.left;
      const dy = previous.top - rect.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue;
      item.animate([{ transform: `translate3d(${dx}px, ${dy}px, 0)` }, { transform: 'none' }], { duration: 300, easing: EASE_OUT });
    } else {
      item.animate(
        [
          { opacity: 0, transform: 'translate3d(0, 0.5rem, 0)' },
          { opacity: 1, transform: 'none' },
        ],
        { duration: 240, easing: EASE_OUT },
      );
    }
  }
}
