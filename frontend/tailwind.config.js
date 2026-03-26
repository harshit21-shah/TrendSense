/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-bg)",
        surface: {
          DEFAULT: "var(--color-surface)",
          raised: "var(--color-surface-raised)",
          overlay: "var(--color-surface-overlay)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          strong: "var(--color-border-strong)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          dim: "var(--color-accent-dim)",
        },
        text: {
          primary:   "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted:     "var(--color-text-muted)",
        },
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger:  "var(--color-danger)",
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        // Strict 8-stop type scale
        'micro':   ['10px', { lineHeight: '1.3' }],
        'caption': ['12px', { lineHeight: '1.3' }],
        'sm':      ['14px', { lineHeight: '1.5' }],
        'base':    ['16px', { lineHeight: '1.5' }],
        'lg':      ['18px', { lineHeight: '1.5' }],
        'h4':      ['20px', { lineHeight: '1.3' }],
        'h3':      ['24px', { lineHeight: '1.3' }],
        'h2':      ['28px', { lineHeight: '1.3' }],
        'h1':      ['36px', { lineHeight: '1.2' }],
      },
      spacing: {
        // 8-pt grid additions
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        // Canonical radius tokens
        'badge':  '4px',
        'btn':    '6px',
        'card':   '8px',
        'modal':  '12px',
        'xl':     '12px',
        '2xl':    '16px',
        '3xl':    '24px',
      },
      animation: {
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'spin-slow':  'spin-slow 8s linear infinite',
        'shimmer':    'shimmer 1.8s infinite',
      },
      screens: {
        'xs': '480px',
      },
    },
  },
  plugins: [],
}
