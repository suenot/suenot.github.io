/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        canvas: '#ffffff',
        carbon: '#333333',
        smoke: '#b3b3b3',
        midnight: '#000000',
        mist: '#d6d6d6',
        silver: '#808080',
        'accent-yellow': '#f5ffbe',
        /* Keep old tokens mapped for any stray references */
        accent: '#333333',
        'accent-light': '#808080',
        'surface': '#ffffff',
        'surface-2': '#f5ffbe',
        'surface-3': '#f5f5f5',
        'muted': '#808080',
      },
      fontFamily: {
        sans: ['Instrument Sans', 'Montserrat', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Instrument Sans', 'Montserrat', 'Inter', 'sans-serif'],
        mono: ['SF Mono', 'Menlo', 'Cascadia Code', 'Consolas', 'Ubuntu Mono', 'monospace'],
      },
      fontSize: {
        'display': ['86px', { lineHeight: '103px', letterSpacing: '-3.01px' }],
        'heading': ['24px', { lineHeight: '28px', letterSpacing: '-0.84px' }],
        'subheading': ['22px', { lineHeight: '26px', letterSpacing: '-0.77px' }],
        'body': ['17px', { lineHeight: '20px', letterSpacing: '-0.595px' }],
        'body-sm': ['14px', { lineHeight: '20px', letterSpacing: '-0.3px' }],
        'caption': ['10px', { lineHeight: '12px', letterSpacing: '-0.35px' }],
      },
      borderRadius: {
        'card': '12px',
        'icon': '8px',
        'image': '16px',
        'btn': '8px',
      },
      spacing: {
        'section': '120px',
        'element': '20px',
      },
    },
  },
  plugins: [],
};
