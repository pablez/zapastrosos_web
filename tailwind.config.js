/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Habilitar modo oscuro con clase
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        zapastroso: {
          cyan: '#00e5d4',
          teal: '#00b8a3',
          dark: '#2d3748',
          light: '#f7fafc',
        }
      },
      fontFamily: {
        'brand': ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
}