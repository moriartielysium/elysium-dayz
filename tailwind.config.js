/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        elysium: {
          red: '#ef1b24',
          amber: '#f7b733',
          ink: '#07080d',
          card: '#10131f',
        },
      },
      boxShadow: {
        glow: '0 0 40px rgba(239, 27, 36, 0.22)',
      },
    },
  },
  plugins: [],
};
