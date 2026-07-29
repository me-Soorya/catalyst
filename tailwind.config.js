/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4', // Mint Teal
          400: '#2dd4bf', // Teal Accent
          500: '#14b8a6', // Turquoise
          600: '#0891b2', // Deep Cyan
          700: '#0284c7', // Sky Cyan
          800: '#1e40af', // Sapphire Blue
          900: '#1e3a8a', // Deep Blue
          950: '#070f1e', // Dark Sapphire BG
        },
        slate: {
          850: '#0e172a',
          950: '#070d19',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0.0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
