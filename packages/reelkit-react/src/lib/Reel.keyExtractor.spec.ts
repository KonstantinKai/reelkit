import { describe, it, expect } from 'vitest';
import { createDefaultKeyExtractorForLoop } from './Reel';

describe('createDefaultKeyExtractorForLoop', () => {
  it('returns index as string for normal cases', () => {
    const extractor = createDefaultKeyExtractorForLoop(5);

    expect(extractor(0, 0)).toBe('0');
    expect(extractor(3, 1)).toBe('3');
    expect(extractor(4, 2)).toBe('4');
  });

  it('appends _cloned suffix for count=2 when indexInRange=0 and index is 0 or 1', () => {
    const extractor = createDefaultKeyExtractorForLoop(2);

    // count=2, index=0, indexInRange=0 → "0_cloned"
    expect(extractor(0, 0)).toBe('0_cloned');
    // count=2, index=1, indexInRange=0 → "1_cloned"
    expect(extractor(1, 0)).toBe('1_cloned');
  });

  it('does not append _cloned for count=2 when indexInRange is not 0', () => {
    const extractor = createDefaultKeyExtractorForLoop(2);

    expect(extractor(0, 1)).toBe('0');
    expect(extractor(1, 2)).toBe('1');
  });

  it('supports keyPrefix', () => {
    const extractor = createDefaultKeyExtractorForLoop(5, 'slide-');

    expect(extractor(0, 0)).toBe('slide-0');
    expect(extractor(3, 1)).toBe('slide-3');
  });

  it('applies keyPrefix with _cloned suffix for count=2', () => {
    const extractor = createDefaultKeyExtractorForLoop(2, 'item-');

    expect(extractor(0, 0)).toBe('item-0_cloned');
    expect(extractor(1, 0)).toBe('item-1_cloned');
  });
});
