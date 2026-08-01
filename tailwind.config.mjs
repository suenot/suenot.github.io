/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        accent: '#FF3B30',
        'accent-light': '#FF6B62',
        'surface': '#090B0A',
        'surface-2': '#0D100E',
        'surface-3': '#121512',
        'muted': '#858B84',
      },
      fontFamily: {
        sans: ['Arial Narrow', 'Roboto Condensed', 'Helvetica Neue Condensed', 'Arial', 'sans-serif'],
        mono: ['SFMono-Regular', 'Roboto Mono', 'Cascadia Code', 'Liberation Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
