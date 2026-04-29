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
        accent: {
          DEFAULT: 'var(--accent)',
          bright: 'var(--accent-bright)',
          dim: 'var(--accent-dim)',
          muted: 'var(--accent-muted)',
        },
        gold: {
          DEFAULT: 'var(--gold)',
          bright: 'var(--gold-bright)',
          muted: 'var(--gold-muted)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          muted: 'var(--danger-muted)',
        },
        info: {
          DEFAULT: 'var(--info)',
          muted: 'var(--info-muted)',
        },
        base: 'var(--bg-base)',
        raised: 'var(--bg-raised)',
        elevated: 'var(--bg-elevated)',
        subtle: 'var(--bg-subtle)',
        'hover-bg': 'var(--bg-hover)',
        // Legacy surface aliases (for backward compat during migration)
        surface: {
          lowest: 'var(--bg-base)',
          dim: 'var(--bg-base)',
          DEFAULT: 'var(--bg-raised)',
          'container-lowest': 'var(--bg-base)',
          'container-low': 'var(--bg-raised)',
          'container': 'var(--bg-elevated)',
          'container-high': 'var(--bg-subtle)',
          'container-highest': 'var(--bg-hover)',
        },
        // Legacy text aliases
        on: {
          primary: 'var(--text-inverted)',
          secondary: 'var(--text-inverted)',
          surface: 'var(--text-primary)',
          'surface-variant': 'var(--text-secondary)',
        },
        outline: {
          DEFAULT: 'var(--text-muted)',
          variant: 'var(--border)',
        },
        // Semantic
        primary: {
          DEFAULT: 'var(--accent)',
          container: 'var(--accent-dim)',
          'fixed-dim': 'var(--accent)',
        },
        secondary: {
          DEFAULT: 'var(--gold)',
          container: '#D97706',
          'fixed-dim': 'var(--gold)',
        },
        tertiary: {
          DEFAULT: '#FFB695',
          container: '#EF6719',
        },
        error: {
          DEFAULT: 'var(--danger)',
          container: '#93000A',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        headline: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        label: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'sharp': '2px',
        'card': '4px',
        'btn': '4px',
        'pill': '9999px',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'accent': 'var(--shadow-accent)',
        'gold': 'var(--shadow-gold)',
        'glow': 'var(--shadow-accent)',
      },
      spacing: {
        'sidebar': 'var(--sidebar-width)',
        'sidebar-sm': 'var(--sidebar-collapsed)',
        'bottom-nav': 'var(--bottom-nav-height)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'slide-down': 'slideDown 0.35s ease-out',
        'scale-in': 'scaleIn 0.25s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 var(--accent-glow)' },
          '50%': { boxShadow: '0 0 20px 4px var(--accent-glow)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to: { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}