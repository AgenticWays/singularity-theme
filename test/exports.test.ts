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
