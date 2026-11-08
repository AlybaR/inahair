/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        powder: '#F8E4E9',
        blush: '#FFF0F3',
        berry: { DEFAULT: '#A7194A', dark: '#8A123C', light: '#CF4774' },
        rose: { DEFAULT: '#CF4774' },
        cream: '#FFFAF9',
        cocoa: '#321A22',
        muted: '#74666C',
        line: '#EED7DE',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(50,26,34,0.18)',
        card: '0 2px 12px -4px rgba(50,26,34,0.10)',
      },
      borderRadius: { xl2: '1.25rem' },
      maxWidth: { site: '1320px' },
    },
  },
  plugins: [],
};
