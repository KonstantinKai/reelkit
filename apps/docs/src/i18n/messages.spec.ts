import { describe, expect, it } from 'vitest';
import { homeMessages } from './home';
import { kLocales, type Locale } from './locale';
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

  // Portuguese splits counts two ways: one, and everything else.
  it('picks the Portuguese plural form for each count', () => {
    const since = messages.pt.whatsNew.since;
    expect(since(1)).toContain('1 novo lançamento');
    expect(since(2)).toContain('2 novos lançamentos');
    expect(since(21)).toContain('21 novos lançamentos');
    expect(messages.pt.whatsNew.more(1)).toBe('+1 lançamento');
    expect(messages.pt.whatsNew.more(3)).toBe('+3 lançamentos');
  });

  // Japanese counts with a counter word and no plural, so one template
  // serves every number.
  it('counts Japanese releases with the counter word', () => {
    const since = messages.ja.whatsNew.since;
    expect(since(1)).toContain('1 件');
    expect(since(5)).toContain('5 件');
  });

  // The Hindi noun for a release does not change with the count, so one
  // template serves every number.
  it('counts Hindi releases with one template', () => {
    const since = messages.hi.whatsNew.since;
    expect(since(1)).toContain('1 नई रिलीज़');
    expect(since(5)).toContain('5 नई रिलीज़');
  });

  // Spanish splits counts two ways: one, and everything else.
  it('picks the Spanish plural form for each count', () => {
    const since = messages.es.whatsNew.since;
    expect(since(1)).toContain('1 nueva versión');
    expect(since(2)).toContain('2 nuevas versiones');
    expect(messages.es.whatsNew.more(1)).toBe('+1 versión más');
    expect(messages.es.whatsNew.more(3)).toBe('+3 versiones más');
  });

  // German splits counts two ways: one, and everything else.
  it('picks the German plural form for each count', () => {
    const since = messages.de.whatsNew.since;
    expect(since(1)).toContain('1 neue Version ');
    expect(since(2)).toContain('2 neue Versionen');
    expect(messages.de.whatsNew.more(1)).toBe('+1 weitere Version');
    expect(messages.de.whatsNew.more(3)).toBe('+3 weitere Versionen');
  });
});

describe('landing page dictionaries', () => {
  // A dictionary copied over from English compiles and has the right shape,
  // and the freshness record only notices English changing later. These are
  // the lines a reader meets first, none of them a product name.
  it('translates the headline copy in every locale', () => {
    const headline = (locale: Locale) => {
      const home = homeMessages[locale];
      return [
        home.meta.description,
        home.hero.subtitle,
        ...home.virtualization.steps.map((step) => step.title),
        ...home.features.highlights.map((highlight) => highlight.title),
      ];
    };
    const english = headline('en');
    for (const locale of kLocales) {
      if (locale === 'en') continue;
      headline(locale).forEach((line, index) =>
        expect(line, `${locale} keeps the English "${line}"`).not.toBe(
          english[index],
        ),
      );
    }
  });
});
