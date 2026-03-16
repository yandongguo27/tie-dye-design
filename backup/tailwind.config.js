

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1b396a',
        secondary: '#5773cf61',
        accent: '#304db0e6',
        glass: 'rgba(255, 255, 255, 0.1)',
        'glass-border': 'rgba(255, 255, 255, 0.2)',
        'text-primary': '#1b396a',
        'text-secondary': '#304db0e6',
        'bg-glass': 'rgba(255, 255, 255, 0.05)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-inset': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      }
    }
  },
  plugins: [],
}

