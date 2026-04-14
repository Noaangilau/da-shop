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
        'gold': '#C49A28',
        'sand': '#F5F0E8',
        'isle-teal': '#1B5E4A',
        'gold-muted': '#A07D1C',
      },
      fontFamily: {
        sans: ['Inter', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
