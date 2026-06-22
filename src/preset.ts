// @singularityfp/theme — Tailwind preset.
// Wire into an app: import singularityTheme from '@singularityfp/theme/preset';
// const config = { presets: [singularityTheme], content: [...], theme: { extend: {/* app extras */} } };
// Provides darkMode selector + the semantic flipping tokens + brand font families.
// Requires Tailwind >= 3.4.1 for the 'selector' strategy (tokens.css also targets .dark).
import type { Config } from 'tailwindcss';

const preset = {
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg:          'rgb(var(--bg) / <alpha-value>)',
        surface:     'rgb(var(--surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--surface-2) / <alpha-value>)',
        fg:          'rgb(var(--fg) / <alpha-value>)',
        line:        'rgb(var(--line) / <alpha-value>)',
        accent:      'rgb(var(--accent) / <alpha-value>)',
        'fg-muted':    'var(--fg-muted)',
        'fg-subtle':   'var(--fg-subtle)',
        'accent-text': 'var(--accent-text)',
        'on-accent':   'var(--on-accent)',
        'selected-bg': 'var(--selected-bg)',
        'selected-fg': 'var(--selected-fg)',
      },
      fontFamily: {
        heading: ['Instrument Serif', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
        brand: ['Inter Tight', 'system-ui', 'sans-serif'],
      },
    },
  },
} satisfies Partial<Config>;

export default preset;
