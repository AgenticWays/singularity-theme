# @singularityfp/theme

The canonical **Singularity FP** design system — one source of truth for the
light/dark semantic token system and the `[singularity]FP` brand wordmark,
consumed by every Singularity web app (campaigns, windfall, advisor-hub, …).

Adopt the Singularity look-and-feel with a single `npm install`, eliminating
per-app palette drift.

## What this package ships

| Export | Entry point | Purpose |
|---|---|---|
| `tokens.css` | `@singularityfp/theme/tokens.css` | Light/dark semantic CSS variables (the canonical palette contract) |
| `singularityTheme` preset | `@singularityfp/theme/preset` | Tailwind preset → `bg-bg`/`text-fg`/… utilities, brand fonts, `data-theme` dark-mode strategy |
| `Brand` | `@singularityfp/theme` | The `[singularity]FP` wordmark component |
| `ThemeToggle` | `@singularityfp/theme` | A persisted light/dark toggle (`localStorage['sfp-theme']`) |
| `noFlashScript` | `@singularityfp/theme` | A pre-paint `<script>` string that applies the saved theme before first paint |

> **Raw source, no build step.** This package ships un-transpiled `.ts` / `.tsx`
> / `.css`. Its `exports` point directly at `src/`. Consumers transpile it via
> Next's `transpilePackages` (Step 1). There is no `dist`, no bundler.

## Install

Distributed from this **public GitHub repo** (not an npm registry). Use the explicit
`git+https` form — **not** the `github:` shorthand, which npm resolves over SSH and
fails in credential-less build sandboxes (e.g. Vercel) with `Permission denied (publickey)`:

```jsonc
// package.json → dependencies
"@singularityfp/theme": "git+https://github.com/AgenticWays/singularity-theme.git#v0.1.0"
```

Peer dependencies: `react >= 18`, `tailwindcss >= 3.4.1`.
Dev dependency for adoption: `postcss-import` (see step 2).

## Adoption — 4 steps

### 1. Transpile the package (Next.js)

Because the package ships raw source, tell Next to transpile it:

```js
// next.config.js
const nextConfig = {
  transpilePackages: ['@singularityfp/theme'],
};
module.exports = nextConfig;
```

### 2. Import the token CSS (ABOVE the `@tailwind` directives)

The `@import` must be the **first statement in the file, above `@tailwind`** (CSS
requires `@import` to precede other rules), and your PostCSS pipeline needs
`postcss-import` listed **before** `tailwindcss` so the package CSS is inlined into
the bundle:

```css
/* app/globals.css */
@import '@singularityfp/theme/tokens.css';
@tailwind base;
@tailwind components;
@tailwind utilities;
```

```js
// postcss.config.js
module.exports = { plugins: { 'postcss-import': {}, tailwindcss: {}, autoprefixer: {} } };
```

```bash
npm install -D postcss-import
```

This exposes `--bg / --surface / --fg / --line / --accent / …` and flips them
under both `[data-theme="dark"]` and `.dark`.

> **Gotcha (cost a failed build):** if the `@import` sits *below* the `@tailwind`
> directives, or `postcss-import` is missing/ordered after `tailwindcss`, the tokens
> silently never reach the compiled stylesheet and dark mode won't flip.

### 3. Add the Tailwind preset

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';
import singularityTheme from '@singularityfp/theme/preset';

export default {
  presets: [singularityTheme],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: { extend: { /* app-specific extras */ } },
} satisfies Config;
```

You now have `bg-bg`, `text-fg`, `border-line`, `bg-accent`, `text-accent-text`,
`font-heading` / `font-body` / `font-mono` / `font-brand`, and the
`[data-theme="dark"]` dark-mode selector strategy.

### 4. Wire up the components, no-flash script, and fonts

Render the no-flash script in `<head>` (before first paint), then drop in the
toggle and brand wordmark. Load the four brand webfonts however you prefer
(e.g. `next/font/google` or `<link>` tags): **DM Sans** (body), **Instrument
Serif** (headings), **IBM Plex Mono** (code), and **Inter Tight** (the `Brand`
wordmark).

```tsx
// app/layout.tsx
import { noFlashScript, ThemeToggle, Brand } from '@singularityfp/theme';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* applies the saved theme before first paint — avoids the flash */}
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </head>
      <body>
        <header className="flex items-center justify-between">
          <Brand />
          <ThemeToggle />
        </header>
        {children}
      </body>
    </html>
  );
}
```

## Public-surface examples (one per feature)

**Token CSS** — import once, as the first line, **above** the `@tailwind` directives (requires `postcss-import`):

```css
@import '@singularityfp/theme/tokens.css';
```

**Tailwind preset** — register it, then use semantic classes:

```ts
import singularityTheme from '@singularityfp/theme/preset';
// presets: [singularityTheme]  →  <div className="bg-surface text-fg border border-line" />
```

**`Brand`** — the `[singularity]FP` wordmark (the word follows `currentColor`):

```tsx
import { Brand } from '@singularityfp/theme';
<Brand size="1.25rem" className="text-fg" />
```

**`ThemeToggle`** — persists to `localStorage['sfp-theme']`, sets `data-theme`
on `<html>`, exposes `data-testid="theme-toggle"`:

```tsx
import { ThemeToggle } from '@singularityfp/theme';
<ThemeToggle />
```

**`noFlashScript`** — a string for `dangerouslySetInnerHTML`, rendered in `<head>`:

```tsx
import { noFlashScript } from '@singularityfp/theme';
<script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
```

## Token reference

Channel tokens are stored as space-separated `R G B` so Tailwind opacity
modifiers work (e.g. `text-fg/60`, `bg-surface/80`). Solid tokens are stored as
hex and **do not** support opacity modifiers.

### Channel tokens (opacity modifiers supported)

| Token | Tailwind class | Light | Dark |
|---|---|---|---|
| `--bg` | `bg-bg` | `245 244 240` (`#F5F4F0`) | `11 14 20` (`#0B0E14`) |
| `--surface` | `bg-surface` | `255 255 255` (`#FFFFFF`) | `17 21 31` (`#11151F`) |
| `--surface-2` | `bg-surface-2` | `250 250 247` (`#FAFAF7`) | `22 28 41` (`#161C29`) |
| `--fg` | `text-fg` | `28 35 51` (`#1C2333`) | `245 244 240` (`#F5F4F0`) |
| `--line` | `border-line` | `229 231 235` (`#E5E7EB`) | `35 42 58` (`#232A3A`) |
| `--accent` | `bg-accent` | `78 205 180` (`#4ECDB4`) | `78 205 180` (`#4ECDB4`) |

### Solid tokens (no opacity modifiers)

| Token | Tailwind class | Light | Dark |
|---|---|---|---|
| `--fg-muted` | `text-fg-muted` | `#6b7280` | `#9aa1b0` |
| `--fg-subtle` | `text-fg-subtle` | `#9ca3af` | `#6f7989` |
| `--accent-text` | `text-accent-text` | `#0f766e` | `#5fd6c0` |
| `--on-accent` | `text-on-accent` | `#1c2333` | `#06080a` |
| `--selected-bg` | `bg-selected-bg` | `#1c2333` | `#4ecdb4` |
| `--selected-fg` | `text-selected-fg` | `#f5f4f0` | `#06080a` |

Brand anchor variables (not flipped): `--brand-cream #f5f4f0`,
`--brand-teal #4ecdb4`, `--brand-navy #1c2333`.

### Brand fonts

| Tailwind class | Family |
|---|---|
| `font-heading` | Instrument Serif → Georgia → serif |
| `font-body` | DM Sans → system-ui → sans-serif |
| `font-mono` | IBM Plex Mono → ui-monospace → monospace |
| `font-brand` | Inter Tight → system-ui → sans-serif |

## Scripts

| Script | Command | What it does |
|---|---|---|
| `npm run typecheck` | `tsc --noEmit` | Type-checks the raw source against `strict` TS |
| `npm test` | `node --test --import tsx 'test/**/*.test.ts'` | Runs the `node:test` suite (exports + preset shape + no-flash script) via `tsx` |

There is intentionally **no** `build` step — consumers compile the raw source
through `transpilePackages`.

## License

UNLICENSED — internal Singularity FP package.
