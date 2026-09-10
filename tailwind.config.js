/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#10243e',
        navy: '#12395b',
        mint: '#eaf7f1',
        line: '#dce5ed',
      },
      boxShadow: {
        panel: '0 8px 28px rgba(25, 52, 76, 0.07)',
      },
    },
  },
  plugins: [],
}
