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
        'gold': '#FFFFFF',
        'sand': '#F5F5F5',
        'isle-teal': '#111111',
        'gold-muted': '#E5E5E5',
      },
      fontFamily: {
        sans: ['Inter', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
