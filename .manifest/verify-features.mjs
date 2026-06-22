import preset from '../src/preset.ts';
import * as pkg from '../src/index.ts';
import { readFileSync } from 'node:fs';

let fails = 0;
const ok = (cond, msg) => {
  if (!cond) fails++;
  console.log((cond ? 'PASS' : 'FAIL') + ': ' + msg);
};
const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');

// US1 — token CSS exposes flipping palette; channel tokens space-separated RGB
const css = read('../src/tokens.css');
ok(css.includes(':root {'), 'tokens.css defines :root (light)');
ok(css.includes(':root[data-theme="dark"]'), 'tokens.css flips under [data-theme="dark"]');
ok(css.includes('.dark {'), 'tokens.css flips under .dark');
ok(/--fg:\s+28\s+35\s+51/.test(css), 'channel --fg is space-separated RGB (28 35 51) -> rgb(var(--fg)/0.6) works');
ok(/--bg:\s+11\s+14\s+20/.test(css), 'dark --bg channel present (11 14 20)');
ok(css.includes('--accent-text:  #0f766e'), 'solid token --accent-text present (light)');

// US2 — preset: semantic colors + fonts + dark strategy
const c = preset.theme.extend.colors;
ok(preset.darkMode[0] === 'selector' && preset.darkMode[1] === '[data-theme="dark"]', 'preset darkMode = selector [data-theme="dark"]');
ok(/var\(--bg\)/.test(c.bg) && /var\(--fg\)/.test(c.fg) && /var\(--line\)/.test(c.line) && /var\(--accent\)/.test(c.accent), 'preset maps bg/fg/line/accent channel colors');
ok(c['accent-text'] === 'var(--accent-text)', 'preset maps accent-text solid color');
const f = preset.theme.extend.fontFamily;
ok(!!(f.heading && f.body && f.mono && f.brand), 'preset exposes font-heading/body/mono/brand');

// US3 — barrel exports
ok(typeof pkg.Brand === 'function', 'barrel exports Brand');
ok(typeof pkg.ThemeToggle === 'function', 'barrel exports ThemeToggle');
ok(typeof pkg.noFlashScript === 'string', 'barrel exports noFlashScript');

// ThemeToggle behavior (source markers)
const tt = read('../src/ThemeToggle.tsx');
const useClient = String.fromCharCode(39) + 'use client' + String.fromCharCode(39);
ok(tt.startsWith(useClient), 'ThemeToggle has use-client directive');
ok(tt.includes('sfp-theme'), 'ThemeToggle persists to localStorage sfp-theme');
ok(tt.includes("setAttribute('data-theme'"), 'ThemeToggle sets data-theme on <html>');
ok(tt.includes('data-testid="theme-toggle"'), 'ThemeToggle exposes data-testid theme-toggle');

// noFlashScript string
ok(pkg.noFlashScript.includes('sfp-theme') && pkg.noFlashScript.includes('data-theme'), 'noFlashScript references sfp-theme + data-theme');

// Brand wordmark
const b = read('../src/Brand.tsx');
ok(b.includes('#4aa89e'), 'Brand uses fixed editorial teal #4aa89e');
ok(b.includes('singularity'), 'Brand renders [singularity]FP wordmark');

console.log('\n' + (fails === 0 ? 'ALL FEATURES REACHABLE' : fails + ' FEATURE CHECK(S) FAILED'));
process.exit(fails === 0 ? 0 : 1);
