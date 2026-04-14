/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ADC7FF',
          dark: '#002E68',
          light: '#D8E2FF',
          container: '#4A8EFF',
          'fixed-dim': '#ADC7FF',
        },
        secondary: {
          DEFAULT: '#E9C349',
          fixed: '#FFE088',
          container: '#AF8D11',
          'fixed-dim': '#E9C349',
        },
        tertiary: {
          DEFAULT: '#FFB695',
          fixed: '#FFDBCC',
          container: '#EF6719',
          'fixed-dim': '#FFB695',
        },
        surface: {
          lowest: '#0E0E0E',
          dim: '#131313',
          DEFAULT: '#131313',
          'container-lowest': '#0E0E0E',
          'container-low': '#1C1B1B',
          'container': '#201F1F',
          'container-high': '#2A2A2A',
          'container-highest': '#353534',
          bright: '#393939',
        },
        on: {
          primary: '#002E68',
          'primary-container': '#00285B',
          'primary-fixed': '#001A41',
          'primary-fixed-variant': '#004493',
          secondary: '#3C2F00',
          'secondary-fixed': '#241A00',
          'secondary-fixed-variant': '#574500',
          'secondary-container': '#342800',
          tertiary: '#571E00',
          'tertiary-container': '#4C1A00',
          'tertiary-fixed': '#351000',
          'tertiary-fixed-variant': '#7C2E00',
          surface: '#E5E2E1',
          'surface-variant': '#C1C6D7',
          background: '#E5E2E1',
          error: '#690005',
          'error-container': '#FFDAD6',
          'inverse-surface': '#313030',
          'inverse-primary': '#005BC0',
          'inverse-on-surface': '#313030',
        },
        outline: {
          DEFAULT: '#8B90A0',
          variant: '#414754',
        },
        error: {
          DEFAULT: '#FFB4AB',
          container: '#93000A',
        },
        surface: {
          tint: '#ADC7FF',
        },
      },
      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 15px rgba(173, 199, 255, 0.2)',
        'glow-secondary': '0 0 15px rgba(233, 196, 73, 0.2)',
        'glass': '0 0 0 1px rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}