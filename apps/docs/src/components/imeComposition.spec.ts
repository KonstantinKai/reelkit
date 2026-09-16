import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { isImeComposing } from './imeComposition';

describe('input method composition', () => {
  it('treats a key pressed while composing as the input method', () => {
    expect(isImeComposing({ isComposing: true, keyCode: 13 })).toBe(true);
  });

  // Safari clears the flag before the confirming Enter arrives.
  it('treats the legacy composition key code as the input method', () => {
    expect(isImeComposing({ isComposing: false, keyCode: 229 })).toBe(true);
  });

  it('leaves plain Enter and Escape to the page', () => {
    expect(isImeComposing({ isComposing: false, keyCode: 13 })).toBe(false);
    expect(isImeComposing({ isComposing: false, keyCode: 27 })).toBe(false);
  });

  // The palette listens on the document and has no rendering harness, so the
  // guard is checked where it has to sit: before any key is acted on.
  it('is checked by the command palette before it handles a key', () => {
    const source = readFileSync(
      join(import.meta.dirname, 'CommandPalette.tsx'),
      'utf8',
    );
    const handler = source.slice(source.indexOf("'keydown'"));
    const guard = handler.indexOf('isImeComposing(');
    const dispatch = handler.indexOf('switch (');
    expect(
      guard,
      'the keydown handler never checks for composition',
    ).toBeGreaterThan(-1);
    expect(
      guard,
      'the composition check runs after a key is handled',
    ).toBeLessThan(dispatch);
  });
});
