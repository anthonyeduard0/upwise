/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Adiciona a fonte 'Inter' que você usou no App.tsx
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}