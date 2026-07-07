/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          primary: '#0EA5E9', // Electric blue
          available: '#10B981', // Emerald green
          locked: '#F59E0B', // Amber/orange
          booked: '#F43F5E', // Rose red
          text: '#0F172A',
          subtext: '#64748B'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px -1px rgba(15, 23, 42, 0.05), 0 4px 20px -2px rgba(15, 23, 42, 0.03)',
        cardHover: '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 16px -6px rgba(15, 23, 42, 0.03)'
      }
    },
  },
  plugins: [],
}
