/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4FD1C5', //teal-300
      },
    },
  },
  plugins: [],
}

//'#5044E5'