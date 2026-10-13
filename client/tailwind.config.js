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
        stage: {
          black: '#000000',
          card: '#0E1015',
          elevated: '#151720',
          hairline: 'rgba(255, 255, 255, 0.12)',
          'hairline-strong': 'rgba(255, 255, 255, 0.24)',
        },
        base: {
          light: 'var(--color-bg-base)',
          dark: 'var(--color-bg-base)',
        },
        surface: {
          light: 'var(--color-bg-surface)',
          dark: 'var(--color-bg-surface)',
          subtle: 'var(--color-bg-surface-subtle)',
        },
        ink: {
          DEFAULT: 'var(--color-ink-primary)',
          muted: 'var(--color-ink-muted)',
          faint: 'var(--color-ink-faint)',
        },
        line: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
        },
        btn: {
          primary: 'var(--btn-primary-bg)',
          'primary-text': 'var(--btn-primary-text)',
          'primary-hover': 'var(--btn-primary-hover-bg)',
        },
        status: {
          success: 'var(--color-status-success)',
          running: 'var(--color-status-running)',
          pending: 'var(--color-status-pending)',
          failed: 'var(--color-status-failed)',
          skipped: 'var(--color-status-skipped)',
        }
      },
      fontFamily: {
        sans: ['"Clarkson"', '"Instrument Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['"Clarkson Serif"', '"Canela"', '"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'SF Mono', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        eyebrow: '0.09em',
        editorial: '-0.025em',
        tightest: '-0.045em',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 350ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
