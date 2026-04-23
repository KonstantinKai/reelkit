import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const indexHtml = readFileSync(join(__dirname, '../../index.html'), 'utf8');
const themeCtx = readFileSync(join(__dirname, 'ThemeContext.tsx'), 'utf8');

const STORAGE_KEY_PATTERN = /_kStorageKey\s*=\s*'([^']+)'/;

describe('theme pre-hydration key sync', () => {
  it('ThemeContext storage key matches the key read by index.html inline script', () => {
    const match = themeCtx.match(STORAGE_KEY_PATTERN);
    expect(match, 'ThemeContext.tsx must declare _kStorageKey').not.toBeNull();
    const runtimeKey = match![1];
    expect(runtimeKey).toBe('rk-docs:theme');
    expect(indexHtml).toContain(`localStorage.getItem('${runtimeKey}')`);
  });
});
