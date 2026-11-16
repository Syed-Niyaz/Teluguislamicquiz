/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          50: '#f0f7f4',
          100: '#dbeee2',
          200: '#bce0cb',
          300: '#92cbb0',
          400: '#64b090',
          500: '#40916c',
          600: '#2d6a4f',
          700: '#255941',
          800: '#1b4332',
          900: '#143527',
          950: '#0b1e16',
        },
        amber: {
          50: '#fdfbf4',
          100: '#fbf4e2',
          200: '#f5e4bb',
          300: '#eed08d',
          400: '#e5b85f',
          500: '#d4af37',
          600: '#bfa15f',
          700: '#9b7d41',
          800: '#7d6435',
          900: '#66512c',
        }
      },
      fontFamily: {
        telugu: ['Noto Sans Telugu', 'sans-serif'],
        arabic: ['Amiri', 'serif'],
      }
    },
  },
  plugins: [],
}
