/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
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
        'ink':      '#0a0a0a',
        'ink-2':    '#1a1a1a',
        'ink-3':    '#2a2a2a',
        'mute':     '#6b6b6b',
        'mute-2':   '#9a9a9a',
        'rule':     '#d9d4ca',
        'rule-2':   '#ebe6dc',
        'paper':    '#f5f1ea',
        'paper-2':  '#eee8dc',
        'accent':   '#0a0a0a',
      },
      fontFamily: {
        display: ['Archivo', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        sans:    ['Inter', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        mono:    ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
