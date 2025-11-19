/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin';
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        galmuri: ['"Galmuri"', "system-ui", "sans-serif"],
        bitbit: ['"DNF BitBit v2"', "system-ui", "sans-serif"],
      },
      
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-5px)' },
          '40%': { transform: 'translateX(5px)' },
          '60%': { transform: 'translateX(-3px)' },
          '80%': { transform: 'translateX(3px)' },
        },
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
      },
      animation: {
        shake: 'shake 0.4s ease-in-out',
        'fade-in': 'fadeIn 0.4s ease-in-out',
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      const newUtilities = {
        '.text-stroke-1': {
          '-webkit-text-stroke': '1px black',
        },
      };
      addUtilities(newUtilities);
    }),
  ],
};
