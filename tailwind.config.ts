/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './apps/web/src/**/*.{js,ts,jsx,tsx,mdx}',
    './packages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Muted stadium turf green brand palette
        brand: {
          50:  '#f2f7f4',
          100: '#e1efe6',
          200: '#c5e0cf',
          300: '#9bcba9',
          400: '#6bb080',
          500: '#45935e',
          600: '#347547',
          700: '#2a5d3a',
          800: '#234a30',
          900: '#1d3e28',
          950: '#0f2215',
        },
        // Semantic surface colors (graphite/charcoal/slate)
        surface: {
          base:    '#0f1115',
          raised:  '#181a20',
          overlay: '#21242c',
          border:  '#2d3139',
        },
        // Status colors
        status: {
          normal:     '#22c55e',
          warning:    '#f59e0b',
          critical:   '#ef4444',
          evacuating: '#f97316',
          closed:     '#6b7280',
        },
        // Severity colors
        severity: {
          low:      '#22c55e',
          medium:   '#f59e0b',
          high:     '#f97316',
          critical: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow':   'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':      'fadeIn 0.2s ease-out',
        'slide-in-up':  'slideInUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
