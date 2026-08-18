/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'md-primary': '#1B6E45',
        'md-on-primary': '#FFFFFF',
        'md-primary-container': '#A7F2C3',
        'md-on-primary-container': '#002110',
        'md-primary-dim': '#0F4E2E',
        'md-secondary': '#C9911A',
        'md-secondary-container': '#FFE3AD',
        'md-on-secondary-container': '#2A1800',
        'md-tertiary': '#2E5FA6',
        'md-error': '#BA1A1A',
        'md-error-container': '#FFDAD6',
        'md-on-error-container': '#410002',
        'md-success': '#1B6E45',
        'md-success-container': '#C6F3D6',
        'md-surface': '#F5FAF5',
        'md-surface-container': '#E9F0E7',
        'md-surface-container-low': '#EFF5EE',
        'md-surface-container-high': '#E3EBE1',
        'md-surface-container-highest': '#DDE5DB',
        'md-surface-container-lowest': '#FFFFFF',
        'md-on-surface': '#181D19',
        'md-on-surface-variant': '#414942',
        'md-outline': '#71796F',
        'md-outline-variant': '#C1C9BC',
        'md-inverse-surface': '#2C322C',
        'md-inverse-on-surface': '#EDF2EA',
      },
      fontFamily: {
        sans: ['Roboto', 'Roboto Flex', 'sans-serif'],
        display: ['Roboto Flex', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'e1': '0 1px 2px rgba(6,32,18,.28), 0 1px 4px 1px rgba(6,32,18,.14)',
        'e2': '0 1px 3px rgba(6,32,18,.3), 0 3px 9px 2px rgba(6,32,18,.16)',
        'e3': '0 5px 10px 1px rgba(6,32,18,.16), 0 2px 5px rgba(6,32,18,.32)',
        'e4': '0 7px 14px 3px rgba(6,32,18,.16), 0 3px 6px rgba(6,32,18,.32)',
        'e5': '0 10px 22px 6px rgba(6,32,18,.18), 0 5px 8px rgba(6,32,18,.34)',
      },
      borderRadius: {
        'xs': '8px',
        'sm': '12px',
        'md': '16px',
        'lg': '22px',
        'xl': '30px',
      }
    },
  },
  plugins: [],
}
