/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#faf7f2',
          100: '#f2ebe0',
          200: '#e4d4c0',
          300: '#d4b896',
          400: '#c49a6e',
          500: '#b07d4a',
          600: '#966340',
          700: '#7a4f36',
          800: '#654332',
          900: '#54392d',
          950: '#2e1c16',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
