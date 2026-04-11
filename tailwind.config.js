/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9ecff",
          500: "#3b82f6",
          700: "#1d4ed8"
        }
      }
    }
  },
  plugins: []
};
