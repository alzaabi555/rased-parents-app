/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // 🚨 هذا السطر هو الأهم! يخبر التصميم أن يقرأ ملف App.tsx
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'sans-serif'], // لضمان ظهور الخط العربي بشكل فخم
      }
    },
  },
  plugins: [],
}
