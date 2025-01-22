/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
       'noto' : ["Noto Sans Thai", 'sans-serif'],
      },
    },
  },
  plugins: [],
}
