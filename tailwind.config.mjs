/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        accent: '#7C3AED',
        'accent-light': '#A78BFA',
        'surface': '#0F0F1A',
        'surface-2': '#1A1A2E',
        'surface-3': '#16213E',
        'muted': '#6B7280',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
