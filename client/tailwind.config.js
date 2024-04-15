/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],  theme: {
    extend: {
      colors: {
        'bg1': '#2A3B4D',    
        'bg2': '#3D5C6B',
        'button': '#008483',           
        'white': '#FFFFFF',
        'red-button': '#EB001B',
      },
    },
  },
  plugins: [],
}

