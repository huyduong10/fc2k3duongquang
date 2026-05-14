/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pitch: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        slateNight: {
          950: '#020617',
          900: '#0f172a',
          850: '#111c2f',
          800: '#1e293b',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(34,197,94,0.15), 0 18px 60px rgba(0,0,0,0.45)',
      },
      backgroundImage: {
        'pitch-gradient': 'linear-gradient(135deg, rgba(6, 95, 70, 0.35), rgba(15, 23, 42, 0.95))',
      },
    },
  },
  plugins: [],
};
