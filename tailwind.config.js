/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        japan: {
          red: '#dc2626',
          crimson: '#b91c1c',
          gold: '#eab308',
          goldDark: '#ca8a04',
          indigo: '#1e1b4b',
          night: '#0f172a',
          sakura: '#fbcfe8',
          bamboo: '#15803d',
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ripple': 'ripple 0.8s ease-out forwards',
        'dart-fly': 'dartFly 0.45s ease-out forwards',
        'target-glow': 'targetGlow 1.5s ease-in-out infinite',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0.2)', opacity: '1' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        dartFly: {
          '0%': { transform: 'translate(-50%, 150%) scale(2.5) rotate(-20deg)', opacity: '0' },
          '30%': { opacity: '1' },
          '100%': { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: '1' },
        },
        targetGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 4px rgba(234, 179, 8, 0.6))' },
          '50%': { filter: 'drop-shadow(0 0 16px rgba(234, 179, 8, 1))' },
        }
      }
    },
  },
  plugins: [],
}
