import { describe, expect, it } from 'vitest';
import { kLocales } from './locale';
import { messages } from './messages';

/**
 * Walk a dictionary and record the shape of every leaf: the dotted path plus
 * whether it holds a plain string or a function that formats one. A missing
 * key, a stray key or a string where the chrome calls a formatter all show up
 * as a difference against English.
 */
function shapeOf(value: unknown, path = ''): string[] {
  if (typeof value === 'function') return [`${path}:fn`];
  if (typeof value === 'string') return [`${path}:string`];
  return Object.entries(value as Record<string, unknown>)
    .flatMap(([key, child]) => shapeOf(child, path ? `${path}.${key}` : key))
    .sort();
}

const english = shapeOf(messages.en);

describe('chrome dictionaries', () => {
  it('carries the full set of strings in every locale', () => {
    for (const locale of kLocales) {
      expect(shapeOf(messages[locale]), `dictionary for "${locale}"`).toEqual(
        english,
      );
    }
  });

  it('leaves no string untranslated outside English', () => {
    for (const locale of kLocales) {
      if (locale === 'en') continue;
      expect(messages[locale].notFound.title).not.toBe(
        messages.en.notFound.title,
      );
      expect(messages[locale].search.placeholder).not.toBe(
        messages.en.search.placeholder,
      );
    }
  });

  // Ukrainian splits counts three ways, and the teens take the same form as
  // the large numbers even though they end in 1 through 4.
  it('picks the Ukrainian plural form for each count', () => {
    const since = messages.uk.whatsNew.since;
    expect(since(1)).toContain('новий реліз');
    expect(since(3)).toContain('нові релізи');
    expect(since(8)).toContain('нових релізів');
    expect(since(11)).toContain('нових релізів');
    expect(since(21)).toContain('новий реліз');
    expect(since(22)).toContain('нові релізи');
  });
});
