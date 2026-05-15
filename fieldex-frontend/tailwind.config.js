/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      colors: {
        primary: {
          DEFAULT: '#1E3A5F',
          light: '#2B5280',
          50: '#EFF6FF',
          100: '#DBEAFE',
        },
      },
    },
  },
  plugins: [],
};
