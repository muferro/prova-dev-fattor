/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fattor: {
          navy: '#16304d',
          gold: '#b88317',
          dark: '#0c1a2b',
          light: '#f8fafc',
        },
        brand: {
          50: '#f0f5fa',
          100: '#dde8f2',
          200: '#c0d4e6',
          300: '#95b7d6',
          400: '#6494c2',
          500: '#4176ab',
          600: '#2d5c8f',
          700: '#234a74',
          800: '#1e3e60',
          900: '#16304d', // Oficial Fattor Deep Navy
          950: '#0c1a2b',
        },
        gold: {
          50: '#fdfaf3',
          100: '#faedd5',
          200: '#f5d9aa',
          300: '#eec075',
          400: '#e2a441',
          500: '#c78f1e',
          600: '#b88317', // Oficial Fattor Gold
          700: '#946513',
          800: '#774f15',
          900: '#634215',
          950: '#382208',
        },
      },
    },
  },
  plugins: [],
}
