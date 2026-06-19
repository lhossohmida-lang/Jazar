/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // JEZAR brand palette: dark red, black, white
        brand: {
          50: '#fdf2f2',
          100: '#fce4e4',
          200: '#f9caca',
          300: '#f1a0a0',
          400: '#e56a6a',
          500: '#d23f3f',
          600: '#b01e1e', // primary dark red
          700: '#8f1414',
          800: '#7a1414',
          900: '#5c0f0f',
          950: '#330707',
        },
        ink: {
          DEFAULT: '#0d0d0d',
          soft: '#1a1a1a',
          muted: '#2a2a2a',
        },
      },
      fontFamily: {
        sans: ['Cairo', 'Tajawal', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        soft: '0 4px 20px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
