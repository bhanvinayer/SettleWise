/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        settle: {
          dark: '#0a0d14',
          card: '#121824',
          cardBorder: '#1e293b',
          accentBlue: '#0052FF',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
          purple: '#8b5cf6',
          cyan: '#06b6d4',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        glow: '0 0 25px -5px rgba(0, 82, 255, 0.25)',
        glowEmerald: '0 0 25px -5px rgba(16, 185, 129, 0.25)',
        glowRose: '0 0 25px -5px rgba(244, 63, 94, 0.25)',
      }
    },
  },
  plugins: [],
}
