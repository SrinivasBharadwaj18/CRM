/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      // You can add your PolicyHub specific colors here if you want to swap 'blue-600'
      colors: {
        brand: {
          navy: '#0A1D43',
          orange: '#E94E1B',
        }
      }
    },
  },
  plugins: [],
}