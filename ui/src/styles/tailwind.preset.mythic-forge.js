/**
 * MYTHIC FORGE — Olympus-Grid Design System
 * Tailwind CSS Configuration
 *
 * Usage: Every Olympus-Grid app imports this shared config.
 * Each app overrides --accent, --accent-dim, --accent-mute in its own CSS.
 *
 * Google Fonts to include:
 *   Cinzel:wght@400;500;600;700
 *   IBM+Plex+Sans:wght@300;400;500;600;700
 *   Azeret+Mono:wght@400;500;600
 */

import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,html}'],

  theme: {
    // ──────────────────────────────────────────
    // FONTS
    // ──────────────────────────────────────────
    fontFamily: {
      display: ['Cinzel', 'Georgia', 'serif'],
      body:    ['IBM Plex Sans', ...defaultTheme.fontFamily.sans],
      mono:    ['Azeret Mono', 'IBM Plex Mono', ...defaultTheme.fontFamily.mono],
    },

    // ──────────────────────────────────────────
    // TYPE SCALE
    // ──────────────────────────────────────────
    fontSize: {
      'h1':    ['2rem',      { lineHeight: '1.1',  letterSpacing: '0.03em',  fontWeight: '600' }],
      'h2':    ['1.5rem',    { lineHeight: '1.2',  letterSpacing: '0.03em',  fontWeight: '500' }],
      'h3':    ['1.125rem',  { lineHeight: '1.3',  letterSpacing: '0.06em' }],
      'label': ['0.8rem',    { lineHeight: '1.4',  letterSpacing: '0.12em' }],
      'body':  ['1rem',      { lineHeight: '1.6' }],
      'sm':    ['0.875rem',  { lineHeight: '1.5' }],
      'xs':    ['0.75rem',   { lineHeight: '1.4' }],
      'code':  ['0.875rem',  { lineHeight: '1.7' }],
    },

    // ──────────────────────────────────────────
    // COLORS
    // ──────────────────────────────────────────
    colors: {
      transparent: 'transparent',
      current: 'currentColor',

      // Surface layers (darkest → lightest)
      base:     '#06060A',
      surface0: '#0A0A12',
      surface1: '#0F0F18',
      surface2: '#14141E',
      surface3: '#1A1A28',

      // Borders
      border:      '#1A1A28',
      borderHover: '#24243A',
      borderFocus: '#35355A',

      // Text hierarchy
      text: {
        primary:   '#E8E4DC',
        secondary: '#AAA69E',
        tertiary:  '#666360',
        disabled:  '#3A3835',
      },

      // Gold thread (universal brand)
      gold: {
        DEFAULT: '#C8A84E',
        dim:     '#C8A84E18',
        mute:    '#C8A84E35',
      },

      // Accent (CSS variable, per app)
      accent: {
        DEFAULT: 'var(--accent)',
        dim:     'var(--accent-dim)',
        mute:    'var(--accent-mute)',
        text:    'var(--accent-text)',
      },

      // Semantic
      success: {
        DEFAULT: '#27AE60',
        dim:     '#27AE6018',
      },
      error: {
        DEFAULT: '#E74C3C',
        dim:     '#E74C3C18',
      },
      warning: {
        DEFAULT: '#F39C12',
        dim:     '#F39C1218',
      },
      info: {
        DEFAULT: '#3498DB',
        dim:     '#3498DB18',
      },

      // God accents (for direct reference when needed)
      god: {
        athena:     '#4A9EBF',
        poseidon:   '#2E86DE',
        ares:       '#C0392B',
        hermes:     '#D4A843',
        apollo:     '#F39C12',
        iris:       '#8E44AD',
        proteus:    '#27AE60',
        gate:       '#1ABC9C',
        chronos:    '#E74C3C',
        orion:      '#3498DB',
        aeon:       '#95A5A6',
        eos:        '#D4AC0D',
        zeus:       '#FFD700',
        hera:       '#9B59B6',
        hestia:     '#E67E22',
        hephaestus: '#DC7633',
        argos:      '#17A589',
        demeter:    '#82C341',
        artemis:    '#A3E4D7',
        aphrodite:  '#FF69B4',
        dionysus:   '#A569BD',
        alpha:      '#F5F5DC',
        foundation: '#BDC3C7',
        odyssey:    '#5DADE2',
        turtleshell:'#45B39D',
        cosmos:     '#E8D5B7',
      },
    },

    // ──────────────────────────────────────────
    // BORDER RADIUS
    // ──────────────────────────────────────────
    borderRadius: {
      'none': '0',
      'xs':   '2px',
      'sm':   '4px',
      DEFAULT:'6px',
      'lg':   '8px',
      'xl':   '10px',
      '2xl':  '12px',
      'full': '9999px',
    },

    // ──────────────────────────────────────────
    // EXTEND
    // ──────────────────────────────────────────
    extend: {
      spacing: {
        'rail':    '56px',
        'rail-sm': '44px',
        'rail-xl': '220px',
        'topbar':  '48px',
        'status':  '26px',
        '18':      '4.5rem',  // 72px — common panel padding
      },

      boxShadow: {
        // No shadows by default. Elevation via surface layers.
        // These exist only for popovers and modals.
        'popover': '0 8px 32px rgba(0,0,0,0.5)',
        'modal':   '0 16px 64px rgba(0,0,0,0.6)',
      },

      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
      },

      backgroundImage: {
        'gold-thread': 'linear-gradient(90deg, #C8A84E, #C8A84E35, transparent 60%)',
      },
    },
  },

  plugins: [],
}
