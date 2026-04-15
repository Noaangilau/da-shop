/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // Override Tailwind's default borderRadius to enforce zero everywhere sitewide.
    // Use 'rounded-full' only for circles (e.g. notification badge).
    borderRadius: {
      'none': '0',
      DEFAULT: '0',
      'sm': '0',
      'md': '0',
      'lg': '0',
      'xl': '0',
      '2xl': '0',
      '3xl': '0',
      'full': '9999px',
    },
    extend: {
      colors: {
        'midnight': '#111111',
        'sand':     '#F7F7F7',
        'border':   '#E5E5E5',
        'muted':    '#888888',
      },
      fontFamily: {
        sans: ['Inter', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
