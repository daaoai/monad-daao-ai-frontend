/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', 'class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/sections/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          10: '#AEB3B6',
          20: '#4D4D4D',
          30: '#302F2F',
          40: '#222222',
          50: '#101010',
          60: '#000000',
          70: '#A4A4A4',
        },
        teal: {
          10: '#F2FAEF',
          20: '#D0F0BF',
          30: '#CDF462',
          40: '#C8FF31',
          50: '#D1FF53',
          60: '#DFFE01',
          70: '#E8D077',
        },
        purple: {
          10: '#EDEDFF',
          20: '#60609D',
        },
        mellowYellow: '#FBDE7F',
        gold: '#FFB801',
        midGreen: '#A7BDB0',
        paleGreen: '#9AFC99',
        darkGreen: '#053738',
        iconGray: '#C6B8B8',
        notification: '#C64141',
        success: '#459A30',
        error: '#B62F2E',
        white: '#FFFFFF',
        black: '#000000',
        yellow: '#FFD801',
        lightYellow: '#F8DE7F',
      },
      backgroundImage: {
        dots: 'radial-gradient(rgb(0 0 0 / 6%) 1px, transparent 2px)',
      },
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        rubik: ['Rubik', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
