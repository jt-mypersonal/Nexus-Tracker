/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#eef2f8',
          100: '#d6e0f0',
          200: '#adc2e3',
          300: '#7a9ed0',
          400: '#5180bf',
          500: '#3472c8',
          600: '#2a5aa0',
          700: '#214678',
          800: '#1a2744',
          900: '#111a2e',
        },
      },
    },
  },
  plugins: [],
}
