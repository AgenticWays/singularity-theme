# Execution Plan — `@singularityfp/theme`

> Source of truth for tasks: local task list (#1–#12). Source of truth for file
> contents: `PRD.md`. Batch assignments below are organizational only — they do
> **not** alter any task description or its acceptance criteria.

---

## 1. Executive Summary

**What we're building:** `@singularityfp/theme` — the canonical Singularity FP
design system, shipped as a **publishable npm package** (a library, not a web
app). It is extracted verbatim from `singularity-campaigns@f0d43a0` and provides:

- `tokens.css` — light/dark semantic CSS variables (the canonical palette contract)
- `preset.ts` — a Tailwind preset exposing those tokens as `bg-bg`/`text-fg`/… + brand fonts + `data-theme` dark-mode strategy
- `Brand.tsx` — the `[singularity]FP` wordmark component
- `ThemeToggle.tsx` — a persisted light/dark toggle (`localStorage['sfp-theme']`)
- `no-flash.ts` — a pre-paint `<script>` string to apply the saved theme before first paint
- `index.ts` — the public barrel (`Brand`, `ThemeToggle`, `noFlashScript`)

**Total tasks:** 12 (#1–#12), grouped into 5 batches (Batch 0 → Batch 4).

**Platform — SERVER build (see `.manifest/state.json` → `platform: "server"`):**
The deliverable is an npm package. There is **no web-tier hosting deploy**, no
Next.js/React app scaffold, no routing, no web bundle, no UI-framework target.
The build's terminal output is a **GitHub repo push** to `AgenticWays/singularity-theme`,
plus an `npm pack` tarball (and `npm publish` only if a token is present).
> Note: `src/Brand.tsx` and `src/ThemeToggle.tsx` are **raw, un-transpiled library
> source files** that consumers compile via Next `transpilePackages`. They are part
> of the package's public surface — they are **not** a hosted UI and do not make this
> a web build.

**Key tech choices (with PRD overrides of the generic defaults called out):**

| Concern | Choice | Note |
|---|---|---|
| Language/module | TypeScript (ESM, `"type": "module"`, `ESNext`/`Bundler` resolution) | Default ✓ |
| Node | 20+ | Default ✓ |
| Runtime/SDK | **No server SDK.** Peer deps: `react >=18`, `tailwindcss >=3.4.1` | Library, not a server/CLI |
| Build/emit | **None** — ships raw `src/*.ts(x)` + `src/tokens.css`; `exports` point at `src/` | **Override:** PRD forbids a `build`/`dist`/bundler step |
| Tests | **`node --test --import tsx`** (`node:test` + `tsx`) | **Override:** PRD specifies this, not `vitest` |
| npm scripts | **`typecheck`, `test` only** | **Override:** no `build`, no `lint`, no `start` — none apply, and `package.json` must stay byte-identical to the spec |
| typecheck | `tsc --noEmit` | Default ✓ |

**Hard invariants (do not deviate):**
- Every file in `PRD.md` § "File Contents" must be created **byte-identical** to the spec. Token hex values/names are a canonical contract three apps depend on — do not rename or "improve" them.
- `package.json` `exports` resolve to `./src/*` — never repoint to `dist`.
- "Done" = repo on GitHub with the exact layout, `npm run typecheck` passes, `npm test` passes, export-resolution smoke check passes, and the package is published to the npm registry **or** a valid `npm pack` tarball is produced if no publish token is present.

---

## 2. Batches

### Batch 0 — Project Foundation
**Tasks:** #1 (Set up package: package.json, tsconfig.json, install dependencies)

**What gets built:** The package skeleton — `package.json` (byte-identical to the
PRD spec: `typecheck` + `test` scripts only, `exports` → `src/`, peer deps
react/tailwindcss, dev deps `@types/react`/`react`/`tailwindcss`/`tsx`/`typescript`)
and `tsconfig.json` (`noEmit`, `react-jsx`, `Bundler` resolution, `include: ["src","test"]`).
Then `npm install` to populate `node_modules`.
> Do **not** add a `build`, `lint`, or `start` script. Do **not** create `app/`,
> `pages/`, `next.config.js`, or any Vercel/bundler config.

**Validation checkpoint:**
- `npm install` completes cleanly; `node_modules` present.
- `npx tsc --noEmit` exits 0 (no source files yet → nothing to fail).
- `package.json` and `tsconfig.json` match the PRD spec exactly.

---

### Batch 1 — Token & Preset Contracts
**Tasks:** #2 (`src/tokens.css`), #3 (`src/preset.ts`)

**What gets built:** The two contract artifacts every consumer and component
depends on. `tokens.css` defines the light (`:root`) and dark
(`:root[data-theme="dark"]`, `.dark`) semantic variables — channel tokens as
space-separated RGB so `rgb(var(--fg) / 0.6)` works. `preset.ts` is the typed
Tailwind preset (`satisfies Partial<Config>`) mapping those tokens to
`bg`/`surface`/`fg`/`line`/`accent`/… and the brand font families, with
`darkMode: ['selector', '[data-theme="dark"]']`.

**Validation checkpoint:**
- `npm run typecheck` passes (`preset.ts` typechecks against `tailwindcss` `Config`).
- Token values are byte-identical to the PRD palette (light pinned to canonical, dark new).

---

### Batch 2 — Core Components
**Tasks:** #4 (`src/Brand.tsx`), #5 (`src/ThemeToggle.tsx`), #6 (`src/no-flash.ts`)

**What gets built:** The three runtime pieces of the public surface.
- `Brand.tsx` — `[singularity]FP` wordmark; word follows `currentColor`, brackets + raised `FP` fixed teal `#4aa89e`.
- `ThemeToggle.tsx` — `'use client'`; reads/writes `localStorage['sfp-theme']`, sets `data-theme` on `<html>`, exposes `data-testid="theme-toggle"`.
- `no-flash.ts` — exports `noFlashScript`, an IIFE string for `dangerouslySetInnerHTML` that applies the saved theme before first paint.

These three are independent (no inter-dependencies) and can be built in parallel.

**Validation checkpoint:**
- `npm run typecheck` passes (JSX + React types resolve; `'use client'` directive intact).
- Each file byte-identical to the PRD spec.

---

### Batch 3 — Public-Surface Wiring
**Tasks:** #7 (`src/index.ts` — public entry barrel) — *blocked by #4, #5, #6*

**What gets built:** The root barrel that re-exports `Brand`, `ThemeToggle`, and
`noFlashScript`. (The preset and token CSS are intentionally **separate** entry
points — `@singularityfp/theme/preset` and `@singularityfp/theme/tokens.css` — not
re-exported from the barrel.)

**Validation checkpoint:**
- `import { Brand, ThemeToggle, noFlashScript } from '@singularityfp/theme'` resolves all three.
- `npm run typecheck` passes.

---

### Batch 4 — Integration Tests, Documentation & Release (FINAL)
**Tasks:** #8 (`test/exports.test.ts`) → #9 (`README.md`) → #10 (FINAL-1: Build
verification) → #11 (Package for publish: `npm pack` + publish if token) → #12
(FINAL: PRD Feature Verification — every public surface reachable)

> Internal order follows the dependency graph: #8 and #9 first (both gate #10),
> then #10 → #11 → #12.

**What gets built:**
- **#8 — Integration tests** (`test/exports.test.ts`, exact content from PRD § Testing):
  imports the built package surface and asserts it — `root exports` (`Brand`/`ThemeToggle` are functions, `noFlashScript` is a string), `preset shape` (`darkMode[1] === '[data-theme="dark"]'`, `colors.bg` contains `var(--bg)`, `colors['accent-text'] === 'var(--accent-text)'`), and `no-flash script` (contains `sfp-theme` and `data-theme`). This is the integration test that exercises the documented public surface — for a raw-source library, importing the entry points **is** "exercising the binary."
- **#9 — README.md**: adoption guide with the 4 install/wire-up steps, **one example invocation per public-surface feature** (`@import` tokens.css; `presets: [singularityTheme]`; `<Brand/>`; `<ThemeToggle/>`; `noFlashScript` via `dangerouslySetInnerHTML`), the four-font load note (DM Sans, Instrument Serif, IBM Plex Mono, Inter Tight), and the full token reference table (light + dark, noting opacity modifiers work on channel tokens only).
- **#10 — Build verification**: run `npm run typecheck` and `npm test`; confirm `exports` resolve to `src/*`; confirm no `dist`/build/emit step exists.
- **#11 — Package for publish**: `npm pack` → `singularityfp-theme-0.1.0.tgz` (must contain only `src/` + `package.json` + README per `"files": ["src"]`). If `NODE_AUTH_TOKEN`/`.npmrc` is present, `npm publish @singularityfp/theme@0.1.0`; otherwise report the tarball as the ready-to-publish artifact and leave the actual publish to Jim. Never hardcode the token in the repo.
- **#12 — PRD Feature Verification**: confirm every public surface from the PRD user stories is reachable (token import flips under `[data-theme="dark"]`/`.dark`; preset classes + dark strategy; barrel imports; `ThemeToggle` persistence + `data-testid`; `noFlashScript` string). **Terminal output: commit all files and push to GitHub `AgenticWays/singularity-theme`.**

**Validation checkpoint (release gate):**
- `npm run typecheck` exits 0; `npm test` → all 3 `node:test` cases green.
- `npm pack` produces a valid `singularityfp-theme-0.1.0.tgz` containing exactly `src/*` + `package.json` + `README.md`; no `dist`.
- README documents all five public-surface features with one example each + the token table.
- Repo `AgenticWays/singularity-theme` exists with the exact layout and is pushed to GitHub.
- Package published to npm as `@singularityfp/theme@0.1.0` **or** tarball produced + reported.
- No Next.js app, no Vercel deploy, no `dist`/build step were introduced.

---

## 3. Tech Defaults (applied, with PRD overrides)

- **Node.js 20+ + TypeScript (ESM)** — `"type": "module"`, `module: ESNext`, `moduleResolution: Bundler`, `jsx: react-jsx`, `strict: true`, `noEmit: true`.
- **Runtime/SDK** — none server-side. Peer deps `react >=18` + `tailwindcss >=3.4.1`; dev deps `@types/react`, `react`, `tailwindcss`, `tsx`, `typescript`.
- **Tests** — `node --test --import tsx test/` *(PRD override — not `vitest`)*.
- **npm scripts** — `typecheck` (`tsc --noEmit`) and `test` only *(PRD override — no `build`, no `lint`, no `start`; none apply to a raw-source library, and `package.json` must stay byte-identical to the spec)*.
- **No build/start/runnable-server** — this is a library; consumers transpile via `transpilePackages`.

---

## 4. Validation Checkpoints (summary)

| After Batch | Verify |
|---|---|
| 0 — Foundation | `npm install` clean; `npx tsc --noEmit` exits 0; `package.json`/`tsconfig.json` byte-identical to spec |
| 1 — Contracts | `npm run typecheck` passes; token values byte-identical; preset typechecks vs `Config` |
| 2 — Core components | `npm run typecheck` passes; JSX/React types resolve; files byte-identical |
| 3 — Public-surface wiring | barrel import resolves `Brand`/`ThemeToggle`/`noFlashScript`; `npm run typecheck` passes |
| 4 — Tests/Docs/Release (final) | `npm test` 3/3 green; `npm run typecheck` exits 0; README complete (5 features + token table); `npm pack` valid tarball (src-only, no `dist`); repo pushed to GitHub; published or tarball reported |

---

## 5. Final Batch Requirements — Coverage Map

The required final-batch items map to tasks in **Batch 4**:

- **README.md** with setup, npm scripts (`typecheck`, `test`), and one example invocation per public-surface feature → **#9**.
- **Integration tests that exercise the documented public surface** — `test/exports.test.ts` imports the package entry points (`@singularityfp/theme`, `/preset`, `no-flash`) and asserts the public API. (No standalone binary to spawn; for a raw-source library, importing the exported surface is the equivalent integration exercise.) → **#8**, run in **#10**, re-confirmed in **#12**.
- **Terminal output is a GitHub push — no other deploy steps** — commit + push to `AgenticWays/singularity-theme`, plus `npm pack` (and `npm publish` only if a token is present). No Vercel, no web-hosting deploy. → **#11**, **#12**.
