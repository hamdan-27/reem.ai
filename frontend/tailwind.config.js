/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      "poppins": ['Poppins', 'sans-serif'],
    },
    extend: {
      colors: {
        'primary': '#0A3696',
      },
    },
  },
  plugins: [],
}

