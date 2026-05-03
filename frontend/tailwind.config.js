/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        rakbank: {
          red:    '#C8102E',
          dark:   '#1A1A2E',
          navy:   '#16213E',
          blue:   '#0F3460',
          accent: '#E94560',
        }
      }
    }
  },
  plugins: []
}
