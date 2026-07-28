import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const rootShell = readFileSync(join(__dirname, '../root.tsx'), 'utf8');
const themeCtx = readFileSync(join(__dirname, 'ThemeContext.tsx'), 'utf8');

const STORAGE_KEY_PATTERN = /_kStorageKey\s*=\s*'([^']+)'/;

describe('theme pre-hydration key sync', () => {
  it('ThemeContext storage key matches the key read by the root.tsx bootstrap script', () => {
    const match = themeCtx.match(STORAGE_KEY_PATTERN);
    expect(match, 'ThemeContext.tsx must declare _kStorageKey').not.toBeNull();
    const runtimeKey = match![1];
    expect(runtimeKey).toBe('rk-docs:theme');
    expect(rootShell).toContain(`localStorage.getItem('${runtimeKey}')`);
  });

  // The stored value is now a choice, not a colour. If the bootstrap script
  // treated `system` as a colour it would paint light on a dark desktop and
  // the provider would correct it after mount — a visible flash.
  it('resolves the system choice before paint, like the provider does', () => {
    expect(themeCtx).toContain("'system'");
    expect(rootShell).toContain('prefers-color-scheme: dark');
    // Anything that is not an explicit colour defers to the media query.
    expect(rootShell).toMatch(/choice\s*!==\s*'light'/);
    expect(rootShell).toMatch(/choice\s*===\s*'dark'/);
  });
});
