/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'midnight': '#111111',
        'sand':     '#F7F7F7',
        'border':   '#E5E5E5',
        'muted':    '#888888',
        // legacy aliases kept so nothing breaks
        'gold':      '#111111',
        'gold-muted':'#333333',
        'isle-teal': '#111111',
      },
      fontFamily: {
        sans: ['Inter', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
