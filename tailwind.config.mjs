/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      // Brand palette (60-30-10): coffee = Nâu Cà Phê Trầm #3E2723 (900) with Kem Nông Sản #FDFBF7 (50) as the
      // page background; leaf = Xanh Nông Nghiệp #2E5A44 (700); ripe = Cam Trái Chín #D97724 (500), CTAs only.
      colors: {
        coffee: {
          50: '#fdfbf7',
          100: '#f5efe6',
          200: '#e8dccb',
          300: '#d3bfa6',
          400: '#b39478',
          500: '#8d6e57',
          600: '#6d4c41',
          700: '#5d4037',
          800: '#4e342e',
          900: '#3e2723',
          950: '#2a1a16',
        },
        leaf: {
          50: '#eef5f1',
          100: '#d5e7dd',
          200: '#acd0bc',
          300: '#7fb497',
          400: '#559674',
          500: '#3f7a5c',
          600: '#34674e',
          700: '#2e5a44',
          800: '#244635',
          900: '#1a3326',
        },
        ripe: {
          50: '#fdf4ea',
          100: '#fae3c9',
          200: '#f4c592',
          300: '#eda25a',
          400: '#e48a3a',
          500: '#d97724',
          600: '#bc611b',
          700: '#994c18',
          800: '#7c3e19',
          900: '#663418',
        },
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
