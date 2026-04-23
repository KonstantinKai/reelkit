import { describe, expect, it } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
  it('lowercases + hyphenates non-alphanumeric runs', () => {
    expect(slugify('Timeline Controller')).toBe('timeline-controller');
  });

  it('strips leading and trailing separators', () => {
    expect(slugify('  Hello, World!  ')).toBe('hello-world');
  });

  it('collapses multiple non-alphanumeric separators', () => {
    expect(slugify('A + B / C')).toBe('a-b-c');
  });

  it('is idempotent', () => {
    const once = slugify('Foo Bar — Baz');
    expect(slugify(once)).toBe(once);
  });

  it('outputs only [a-z0-9-]', () => {
    expect(slugify('C¢ß ü "quoted" 123')).toMatch(/^[a-z0-9-]+$/);
  });

  it('returns empty string for blank input', () => {
    expect(slugify('   ')).toBe('');
  });

  it('returns identical output on repeat calls regardless of prior calls', () => {
    expect(slugify('Scoped Slots')).toBe('scoped-slots');
    expect(slugify('Scoped Slots')).toBe('scoped-slots');
    expect(slugify('CSS Classes')).toBe('css-classes');
    // Repeated invocation never drifts — no hidden counter / registry.
    expect(slugify('CSS Classes')).toBe('css-classes');
  });
});
