/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf8ec",
          100: "#faefc5",
          200: "#ebd49a",
          300: "#e0be6a",
          400: "#d4a843",
          500: "#c49a3a",
          600: "#b08a30",
          700: "#8c6e26",
          800: "#6b541f",
          900: "#4a3a16",
        },
        surface: {
          DEFAULT: "#0f1b2d",
          raised: "#1a2744",
          overlay: "#243356",
        },
      },
      fontFamily: {
        display: ["Oswald", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
