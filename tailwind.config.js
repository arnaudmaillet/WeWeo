/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./contexts/**/*.{js,jsx,ts,tsx}",
    "./windows/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6A89CC",
          light: "#8AA6E5",
          dark: "#4A6AA2",
          contrast: "#ffffff",
        },
        grayscale: {
          DEFAULT: '#F4F3F2',
          lighter_1x: '#FAFAFA',
          lighter_2x: '#FEFEFE',
          darker_1x: '#E8E7E5',
          darker_2x: '#D9D8D6',
          darker_3x: '#B0B0B0',
          darker_4x: 'grey'
      }
      },
    },
  },
  plugins: [],
}