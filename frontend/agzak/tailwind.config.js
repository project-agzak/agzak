/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        galmuri: ['"Galmuri11"', "system-ui", "sans-serif"],
        bitbit: ['"DNF BitBit v2"', "system-ui", "sans-serif"],
      }
    },
  },
  plugins: [],
};