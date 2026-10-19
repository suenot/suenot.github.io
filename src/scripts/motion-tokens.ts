/** Motion vocabulary shared by every script. Mirrors the custom properties in src/styles/motion.css. */
export const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
export const EASE_IN_OUT = 'cubic-bezier(0.77, 0, 0.175, 1)';
/** Scanner travel: steady through the middle, soft at both ends. */
export const SWEEP = 'cubic-bezier(0.65, 0, 0.35, 1)';

const reducedMotion = typeof window === 'undefined' ? null : window.matchMedia('(prefers-reduced-motion: reduce)');

export function motionAllowed(): boolean {
  return Boolean(reducedMotion) && !reducedMotion!.matches && 'IntersectionObserver' in window && typeof Element.prototype.animate === 'function';
}

/** +1 when the inline direction runs left to right, -1 in RTL documents. */
export function dirSign(): number {
  return document.documentElement.dir === 'rtl' ? -1 : 1;
}
