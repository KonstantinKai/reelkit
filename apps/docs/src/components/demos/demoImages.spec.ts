import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const demoDir = join(import.meta.dirname, '../../assets/demo');
const slides = readdirSync(demoDir)
  .filter((name) => name.endsWith('.webp'))
  .sort();

describe('home demo slide images', () => {
  it('has one WebP file per demo slide', () => {
    expect(slides).toEqual(
      Array.from({ length: 7 }, (_, index) => `slide-${index + 1}.webp`),
    );
    for (const name of slides) {
      const file = readFileSync(join(demoDir, name));
      expect(file.subarray(0, 4).toString('latin1'), name).toBe('RIFF');
      expect(file.subarray(8, 12).toString('latin1'), name).toBe('WEBP');
    }
  });

  // The first slide is the largest paint on the home page, so its weight is
  // the page's load time on a slow phone.
  it('keeps the first slide under 40 KB', () => {
    const size = readFileSync(join(demoDir, 'slide-1.webp')).length;
    expect(size).toBeLessThanOrEqual(40 * 1024);
  });
});
