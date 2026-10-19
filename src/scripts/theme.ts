// Visitor theme: dark (default) or light.
// The inline script in Layout.astro's <head> applies the stored choice before
// first paint; this module wires the toggles, saves the choice and tells
// canvas-drawn parts (the hero cube) to recolor via a `hud:theme` event.
import { motionAllowed } from './motion-tokens';

type Theme = 'dark' | 'light';

const STORAGE_KEY = 'suenot-theme';
const FADE_MS = 180;
const root = document.documentElement;
let fadeTimer = 0;

const current = (): Theme => (root.dataset.theme === 'light' ? 'light' : 'dark');

function save(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage blocked (private mode, disabled cookies): the choice lasts for this page only.
  }
}

function syncToggles() {
  const pressed = String(current() === 'light');
  document.querySelectorAll('[data-theme-toggle]').forEach((toggle) => toggle.setAttribute('aria-pressed', pressed));
}

function apply(theme: Theme, fade: boolean) {
  if (theme === current()) return;
  if (fade && motionAllowed()) {
    root.setAttribute('data-theme-switching', '');
    window.clearTimeout(fadeTimer);
    fadeTimer = window.setTimeout(() => root.removeAttribute('data-theme-switching'), FADE_MS + 40);
  }
  root.dataset.theme = theme;
  syncToggles();
  document.dispatchEvent(new CustomEvent('hud:theme', { detail: { theme } }));
}

document.addEventListener('click', (event) => {
  const toggle = (event.target as Element | null)?.closest?.('[data-theme-toggle]');
  if (!toggle) return;
  const next: Theme = current() === 'light' ? 'dark' : 'light';
  apply(next, true);
  save(next);
});

// Another tab changed the theme.
window.addEventListener('storage', (event) => {
  if (event.key === STORAGE_KEY) apply(event.newValue === 'light' ? 'light' : 'dark', false);
});

if (!root.dataset.theme) root.dataset.theme = 'dark';
syncToggles();
