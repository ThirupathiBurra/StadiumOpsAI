/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './apps/web/src/**/*.{js,ts,jsx,tsx,mdx}',
    './packages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Cyber-Zen Command palette (from Stitch design system) ──────────────
        // Surface hierarchy
        'surface-base':              '#12121c',
        'surface-dim':               '#12121c',
        'surface-container-lowest':  '#0d0d17',
        'surface-container-low':     '#1b1b25',
        'surface-container':         '#1f1f29',
        'surface-container-high':    '#292934',
        'surface-container-highest': '#34343f',
        'surface-bright':            '#383843',
        'surface-variant':           '#34343f',
        'surface-tint':              '#4edea3',
        // On-surface text
        'on-surface':         '#e3e1ef',
        'on-surface-variant': '#bbcabf',
        'outline':            '#86948a',
        'outline-variant':    '#3c4a42',
        // Primary – Emerald (safe/normal)
        'primary':              '#4edea3',
        'on-primary':           '#003824',
        'primary-container':    '#10b981',
        'on-primary-container': '#00422b',
        'primary-fixed':        '#6ffbbe',
        'primary-fixed-dim':    '#4edea3',
        'inverse-primary':      '#006c49',
        // Secondary – Amber (warning)
        'secondary':              '#ffb95f',
        'on-secondary':           '#472a00',
        'secondary-container':    '#ee9800',
        'on-secondary-container': '#5b3800',
        'secondary-fixed':        '#ffddb8',
        'secondary-fixed-dim':    '#ffb95f',
        // Tertiary – Rose (critical)
        'tertiary':              '#ffb2b7',
        'on-tertiary':           '#67001b',
        'tertiary-container':    '#ff7886',
        'on-tertiary-container': '#780021',
        'tertiary-fixed':        '#ffdadb',
        'tertiary-fixed-dim':    '#ffb2b7',
        // Error
        'error':             '#ffb4ab',
        'on-error':          '#690005',
        'error-container':   '#93000a',
        'on-error-container':'#ffdad6',
        // Background / Inverse
        'background':       '#12121c',
        'on-background':    '#e3e1ef',
        'inverse-surface':  '#e3e1ef',
        'inverse-on-surface':'#302f3a',

        // ── Legacy compat aliases ───────────────────────────────────────────────
        brand: {
          50:  '#f2f7f4',
          100: '#e1efe6',
          200: '#c5e0cf',
          300: '#9bcba9',
          400: '#6ffbbe',
          500: '#4edea3',
          600: '#10b981',
          700: '#006c49',
          800: '#005236',
          900: '#003824',
          950: '#002113',
        },
        surface: {
          base:    '#12121c',
          raised:  '#1f1f29',
          overlay: '#292934',
          border:  '#3c4a42',
        },
        status: {
          normal:     '#4edea3',
          warning:    '#ffb95f',
          critical:   '#ff7886',
          evacuating: '#ee9800',
          closed:     '#6b7280',
        },
        severity: {
          low:      '#4edea3',
          medium:   '#ffb95f',
          high:     '#ee9800',
          critical: '#ff7886',
        },
        // Shorthand aliases used in components
        emerald: '#4edea3',
        amber:   '#ffb95f',
        rose:    '#ff7886',
      },

      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Geist', 'system-ui', 'sans-serif'],
        mono:    ['Courier Prime', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },

      // Stitch typography scale
      fontSize: {
        'metric-xl':         ['48px', { lineHeight: '1.1', letterSpacing: '-0.04em', fontWeight: '700' }],
        'headline-lg':       ['32px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
        'headline-lg-mobile':['24px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '600' }],
        'body-md':           ['16px', { lineHeight: '1.6', letterSpacing: '0em',     fontWeight: '400' }],
        'label-caps':        ['12px', { lineHeight: '1',   letterSpacing: '0.08em',  fontWeight: '600' }],
        'status-sm':         ['14px', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '500' }],
      },

      spacing: {
        'gutter':      '24px',
        'section-gap': '48px',
        'base':        '8px',
        'card-padding':'24px',
        'grid-margin': '32px',
      },

      borderRadius: {
        DEFAULT: '0.25rem',
        sm:      '0.125rem',
        md:      '0.375rem',
        lg:      '0.5rem',
        xl:      '0.75rem',
        '2xl':   '1rem',
        full:    '9999px',
      },

      animation: {
        'pulse-slow':    'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-ring':    'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':       'fadeIn 0.25s ease-out',
        'slide-in-up':   'slideInUp 0.3s ease-out',
        'blink':         'blink 1s step-end infinite',
      },

      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%':   { transform: 'scale(0.8)', opacity: '0.8' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        blink: {
          'from, to': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
