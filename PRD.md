# @singularityfp/theme — Product Requirements Document

**Version:** 1.0 | June 21, 2026
**Platform:** Library (publishable npm package) — **NOT a web app**

---

## Overview

Create `@singularityfp/theme`, the canonical Singularity FP design system: one source of truth for the light/dark semantic token system and the `[singularity]FP` brand wordmark, consumed by every Singularity web app (campaigns, windfall, advisor-hub, …). The package is extracted verbatim from the theme already shipped in `singularity-campaigns` (commit `f0d43a0`).

**Core Value Prop:** Adopt the Singularity look-and-feel — light/dark flipping tokens, Tailwind preset, theme toggle, and brand wordmark — with one `npm install`, eliminating per-app palette drift.

---

## Platform — read first (CRITICAL deviations from the default pipeline)

This project is a **library**, not a Next.js web app. The default ManifestAgent flow (scaffold a Next app → deploy to Vercel) does NOT apply.

- **CRITICAL:** Do NOT scaffold a Next.js/React app, pages, or routes. There is no UI to render and nothing to deploy to Vercel. The deliverable is an npm package: source files + `package.json` + README.
- **CRITICAL:** The package ships **raw, un-transpiled** `.ts` / `.tsx` / `.css`. There is **no build step** (no `tsc` emit, no bundler). Consumers transpile it via Next's `transpilePackages`. The `package.json` `exports` point directly at the `src` files. Do not add a `build` script that emits `dist`, and do not rewrite `exports` to a `dist` path.
- **CRITICAL:** "Done" = the repo exists on GitHub with these exact files committed, `npm run typecheck` passes, the export-resolution smoke check passes, and the package is **published to the configured npm registry** (or `npm pack` produces a valid tarball if the publish token isn't present — see Publish).
- The repo is `AgenticWays/singularity-theme`; the package name is `@singularityfp/theme`.

---

## Repository Layout (create exactly this)

```
singularity-theme/
  package.json
  tsconfig.json
  README.md
  src/
    index.ts
    tokens.css
    preset.ts
    Brand.tsx
    ThemeToggle.tsx
    no-flash.ts
  test/
    exports.test.ts          (new — see Testing)
```

---

## File Contents (create each file with this EXACT content)

### `package.json`
```json
{
  "name": "@singularityfp/theme",
  "version": "0.1.0",
  "description": "Singularity FP canonical design system — light/dark semantic tokens, Tailwind preset, ThemeToggle, and the [singularity]FP brand wordmark. Single source of truth across every Singularity web app.",
  "license": "UNLICENSED",
  "private": false,
  "type": "module",
  "sideEffects": ["*.css"],
  "files": ["src"],
  "exports": {
    ".": { "types": "./src/index.ts", "default": "./src/index.ts" },
    "./preset": { "types": "./src/preset.ts", "default": "./src/preset.ts" },
    "./tokens.css": "./src/tokens.css"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "node --test --import tsx test/"
  },
  "peerDependencies": { "react": ">=18", "tailwindcss": ">=3.4.1" },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "react": "^18.3.0",
    "tailwindcss": "^3.4.0",
    "tsx": "^4.0.0",
    "typescript": "^5.4.0"
  },
  "publishConfig": { "access": "restricted" },
  "keywords": ["singularity", "design-system", "tailwind", "theme", "dark-mode"]
}
```

### `src/tokens.css`
```css
/* @singularityfp/theme — semantic design tokens (light + dark).
   Import ONCE per app, right after the @tailwind directives in app/globals.css:
       @tailwind base; @tailwind components; @tailwind utilities;
       @import '@singularityfp/theme/tokens.css';
   Core neutrals/accent are "R G B" channels so Tailwind /opacity modifiers work
   (text-fg/60). Light values are pinned to the canonical palette so an already-
   light app stays pixel-identical; only dark mode is new. */
@layer base {
  :root {
    --brand-cream: #f5f4f0;
    --brand-teal:  #4ecdb4;
    --brand-navy:  #1c2333;

    --bg:        245 244 240;   /* #F5F4F0 page background */
    --surface:   255 255 255;   /* #FFFFFF cards/panels */
    --surface-2: 250 250 247;   /* #FAFAF7 zebra/hover rows */
    --fg:         28  35  51;   /* #1C2333 primary text */
    --line:      229 231 235;   /* #E5E7EB hairline borders */
    --accent:     78 205 180;   /* #4ECDB4 teal fill */

    --fg-muted:     #6b7280;
    --fg-subtle:    #9ca3af;
    --accent-text:  #0f766e;
    --on-accent:    #1c2333;
    --selected-bg:  #1c2333;
    --selected-fg:  #f5f4f0;

    color-scheme: light;
  }

  :root[data-theme="dark"],
  .dark {
    --bg:        11  14  20;
    --surface:   17  21  31;
    --surface-2: 22  28  41;
    --fg:       245 244 240;
    --line:      35  42  58;
    --accent:    78 205 180;

    --fg-muted:     #9aa1b0;
    --fg-subtle:    #6f7989;
    --accent-text:  #5fd6c0;
    --on-accent:    #06080a;
    --selected-bg:  #4ecdb4;
    --selected-fg:  #06080a;

    color-scheme: dark;
  }

  html, body {
    background-color: rgb(var(--bg));
    color: rgb(var(--fg));
    font-family: 'DM Sans', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  h1, h2, h3 { font-family: 'Instrument Serif', Georgia, serif; letter-spacing: -0.01em; }
  code, pre { font-family: 'IBM Plex Mono', ui-monospace, monospace; }
}
```

### `src/preset.ts`
```ts
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
```

### `src/Brand.tsx`
```tsx
// @singularityfp/theme — Brand wordmark ([singularity]FP). The canonical logo,
// identical across the marketing site and every product. Requires the 'Inter
// Tight' webfont (load per app). Word follows currentColor; brackets + raised
// "FP" are the fixed editorial teal (#4aa89e).
import type { CSSProperties } from 'react';

const BRAND_FONT =
  "'Inter Tight', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif";
const TEAL = '#4aa89e';

export function Brand({ size = '1.05rem', className }: { size?: string; className?: string }) {
  const bracket: CSSProperties = { color: TEAL, fontWeight: 400, padding: '0 6px', fontSize: '1.15em', lineHeight: 1 };
  return (
    <span
      className={className}
      aria-label="Singularity Financial Partners"
      style={{
        fontFamily: BRAND_FONT, fontSize: size, fontWeight: 500, letterSpacing: '-0.005em',
        lineHeight: 1, display: 'inline-flex', alignItems: 'baseline', color: 'currentColor',
      }}
    >
      <span style={bracket}>[</span>
      <span style={{ fontWeight: 500, letterSpacing: '-0.01em' }}>singularity</span>
      <span style={{ ...bracket, paddingRight: 0 }}>]</span>
      <span style={{ color: TEAL, fontSize: '0.6em', fontWeight: 500, letterSpacing: '0.04em', marginLeft: 1, transform: 'translateY(-0.5em)', display: 'inline-block' }}>FP</span>
    </span>
  );
}

export default Brand;
```

### `src/ThemeToggle.tsx`
```tsx
'use client';
// @singularityfp/theme — ThemeToggle. Persists to localStorage['sfp-theme'],
// sets data-theme on <html>. Pair with noFlashScript in <head>. Adds
// data-testid="theme-toggle".
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
const KEY = 'sfp-theme';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const saved = (typeof localStorage !== 'undefined' && localStorage.getItem(KEY)) as Theme | null;
    const initial: Theme = saved ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem(KEY, next); } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggle}
      data-testid="theme-toggle"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={
        'inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 ' +
        'font-mono text-xs uppercase tracking-wide text-fg-muted hover:text-fg ' +
        'transition-colors ' + className
      }
    >
      <span aria-hidden>{theme === 'dark' ? '◗' : '◖'}</span>
      {theme === 'dark' ? 'Dark' : 'Light'}
    </button>
  );
}

export default ThemeToggle;
```

### `src/no-flash.ts`
```ts
// @singularityfp/theme — no-flash theme script. Applies the saved theme before
// first paint. Render in <head>:
//   <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
export const noFlashScript = `(function () {
  try {
    var t = localStorage.getItem('sfp-theme');
    if (!t) t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', t);
  } catch (e) {}
})();`;

export default noFlashScript;
```

### `src/index.ts`
```ts
// Public entry. Preset is a separate entry ('@singularityfp/theme/preset');
// token CSS is '@singularityfp/theme/tokens.css'.
export { Brand } from './Brand';
export { ThemeToggle } from './ThemeToggle';
export { noFlashScript } from './no-flash';
```

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true
  },
  "include": ["src", "test"]
}
```

### `README.md`
Write a concise adoption guide covering: what the package ships; `npm install @singularityfp/theme`; the 4 adoption steps (Next `transpilePackages`; `@import` tokens.css after the `@tailwind` directives; add `presets: [singularityTheme]`; add `noFlashScript` + `<ThemeToggle/>` + `<Brand/>` and load the four fonts — DM Sans, Instrument Serif, IBM Plex Mono, Inter Tight); and a token reference table (bg/surface/surface-2/fg/fg-muted/fg-subtle/line/accent/accent-text/on-accent/selected-* with light + dark values). Note that opacity modifiers work on the channel tokens (bg/surface/surface-2/fg/line/accent) but not the solid tokens.

---

## Requirements (User Stories)

### Consume the tokens
- As an app developer, I can **import the token CSS** and get the flipping palette
  - [ ] `@import '@singularityfp/theme/tokens.css'` exposes `--bg/--surface/--fg/--line/--accent/...` and they flip under `[data-theme="dark"]` and `.dark`
  - [ ] Channel tokens are space-separated RGB so `rgb(var(--fg) / 0.6)` works

### Consume the preset
- As an app developer, I can **add the Tailwind preset** and use semantic color + font classes
  - [ ] `presets: [singularityTheme]` makes `bg-bg`, `text-fg`, `border-line`, `bg-accent`, `text-accent-text`, `font-heading/body/mono/brand` available
  - [ ] `darkMode` is the `[data-theme="dark"]` selector strategy

### Consume the components
- As an app developer, I can **import `Brand`, `ThemeToggle`, and `noFlashScript`** from the package root
  - [ ] `import { Brand, ThemeToggle, noFlashScript } from '@singularityfp/theme'` resolves
  - [ ] `ThemeToggle` persists to `localStorage['sfp-theme']`, sets `data-theme`, exposes `data-testid="theme-toggle"`
  - [ ] `noFlashScript` is a string suitable for `dangerouslySetInnerHTML`

---

## Quality Requirements
- [ ] `npm run typecheck` (`tsc --noEmit`) passes with no errors.
- [ ] No `build`/emit step; `package.json` `exports` resolve to `src/*` files.
- [ ] Token values are byte-identical to the spec above (these are the canonical palette — do not "improve" them).

---

## Testing

The package has no UI to E2E. Verify structurally with a Node test runner (`node --test` via `tsx`):

| Test | Type | What to Verify |
|------|------|----------------|
| Exports resolve | Unit | `import('@singularityfp/theme')` exposes `Brand`, `ThemeToggle`, `noFlashScript`; `import('@singularityfp/theme/preset')` default-exports an object with `darkMode` and `theme.extend.colors.fg` |
| Preset shape | Unit | preset `darkMode[1] === '[data-theme="dark"]'`; `colors.bg` contains `var(--bg)`; `colors['accent-text'] === 'var(--accent-text)'` |
| no-flash script | Unit | `noFlashScript` is a non-empty string containing `sfp-theme` and `data-theme` |
| Typecheck | Unit | `tsc --noEmit` exits 0 |

`test/exports.test.ts` (create it):
```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as pkg from '../src/index.ts';
import preset from '../src/preset.ts';
import { noFlashScript } from '../src/no-flash.ts';

test('root exports', () => {
  assert.equal(typeof pkg.Brand, 'function');
  assert.equal(typeof pkg.ThemeToggle, 'function');
  assert.equal(typeof pkg.noFlashScript, 'string');
});

test('preset shape', () => {
  assert.equal((preset as any).darkMode[1], '[data-theme="dark"]');
  const c = (preset as any).theme.extend.colors;
  assert.match(c.bg, /var\(--bg\)/);
  assert.equal(c['accent-text'], 'var(--accent-text)');
});

test('no-flash script', () => {
  assert.match(noFlashScript, /sfp-theme/);
  assert.match(noFlashScript, /data-theme/);
});
```

---

## Publish

- [ ] Create GitHub repo `AgenticWays/singularity-theme` and commit all files.
- [ ] Publish `@singularityfp/theme@0.1.0` to the configured npm registry.
- **CRITICAL:** Publishing requires an npm auth token (`NODE_AUTH_TOKEN` / `.npmrc`). This is provided in the runner/Studio environment — do NOT hardcode it in the repo. If no token is available at build time, instead run `npm pack` to produce `singularityfp-theme-0.1.0.tgz` as the artifact and report that the package is ready to publish, leaving the actual `npm publish` to Jim.

---

## Success Criteria
- [ ] Repo `AgenticWays/singularity-theme` exists with the exact layout + file contents above.
- [ ] `npm run typecheck` and `npm test` pass.
- [ ] Package is published to the npm registry as `@singularityfp/theme@0.1.0` (or a valid `npm pack` tarball is produced if no publish token is present).
- [ ] No Next.js app, no Vercel deployment, no `dist` build step were introduced.

---

## Known Gotchas

**CRITICAL:** This is a library, not a web app. Ignore the default "scaffold Next.js + deploy to Vercel" flow entirely. The repo root has no `app/`, `pages/`, `next.config.js`, or Vercel config.

**CRITICAL:** Ship raw source. `package.json` `exports` point at `./src/*.ts(x)` and `./src/tokens.css`. Consumers compile via `transpilePackages`. Do not add a bundler/`tsc` emit or repoint exports to `dist`.

**CRITICAL:** The token hex values and names are the canonical contract three apps already depend on (campaigns is live on them; windfall + advisor-hub adoption PRDs reference them). Reproduce them exactly — do not rename tokens or adjust colors.

---
_Source: mcp:create:inline · sha256: 538a122abfad_
