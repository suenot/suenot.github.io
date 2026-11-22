/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        accent: 'var(--terminal-accent)',
        'accent-light': 'var(--terminal-accent-hover)',
        'surface': 'var(--terminal-bg)',
        'surface-2': 'var(--terminal-surface)',
        'surface-3': 'var(--terminal-surface-2)',
        'muted': 'var(--terminal-muted)',
      },
      fontFamily: {
        sans: ['"Schibsted Grotesk Variable"', '"Inter Tight Variable"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
};
