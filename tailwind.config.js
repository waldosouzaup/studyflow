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
          DEFAULT: 'var(--color-primary)',
          dark: 'var(--color-primary-dark)',
          light: 'var(--color-primary-light)',
          container: '#4A8EFF',
          'fixed-dim': 'var(--color-primary)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          fixed: '#FFE088',
          container: '#AF8D11',
          'fixed-dim': 'var(--color-secondary)',
        },
        tertiary: {
          DEFAULT: 'var(--color-tertiary)',
          fixed: '#FFDBCC',
          container: '#EF6719',
          'fixed-dim': 'var(--color-tertiary)',
        },
        surface: {
          lowest: 'var(--bg-surface-lowest)',
          dim: 'var(--bg-surface-dim)',
          DEFAULT: 'var(--bg-surface)',
          'container-lowest': 'var(--bg-surface-container-lowest)',
          'container-low': 'var(--bg-surface-container-low)',
          'container': 'var(--bg-surface-container)',
          'container-high': 'var(--bg-surface-container-high)',
          'container-highest': 'var(--bg-surface-container-highest)',
          bright: '#393939',
          tint: 'var(--color-primary)',
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
          surface: 'var(--text-on-surface)',
          'surface-variant': 'var(--text-on-surface-variant)',
          background: 'var(--text-on-surface)',
          error: '#690005',
          'error-container': '#FFDAD6',
          'inverse-surface': '#313030',
          'inverse-primary': '#005BC0',
          'inverse-on-surface': '#313030',
        },
        outline: {
          DEFAULT: 'var(--text-outline)',
          variant: 'var(--text-outline-variant)',
        },
        error: {
          DEFAULT: '#FFB4AB',
          container: '#93000A',
        },
      },
      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow': 'var(--shadow-glow)',
        'glow-secondary': 'var(--shadow-glow-secondary)',
        'glass': 'var(--shadow-glass)',
        'elevated': '0 4px 12px rgba(0, 0, 0, 0.15)',
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