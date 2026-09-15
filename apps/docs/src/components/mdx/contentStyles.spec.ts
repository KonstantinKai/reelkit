import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync(
  join(import.meta.dirname, '../../styles.css'),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

/**
 * Selectors of every rule that belongs to the content typography — the ones
 * mentioning a `docs-` hook or the `.docs-mdx-content` scope.
 */
function contentSelectors(): string[] {
  const selectors: string[] = [];
  for (const match of css.matchAll(/([^{}]+)\{[^{}]*\}/g)) {
    const selector = match[1].trim();
    if (!selector.includes('docs-')) continue;
    selectors.push(...selector.split(',').map((s) => s.trim()));
  }
  return selectors;
}

// A bare tag under the content scope matches every element a shared
// component renders there too: the `#` anchor in a heading, the list in
// NextSteps, the code inside a highlighted block. Those carry their own
// classes at lower specificity and lose. So the typography only targets the
// hooks the components map puts on markdown-generated elements — a shared
// component never carries one. JSX tables are the exception, they bypass
// the map, and their cells are reached through the `.docs-table` hook.
describe('content typography', () => {
  it('targets class hooks, never bare tags, outside a table', () => {
    const offenders: string[] = [];
    for (const selector of contentSelectors()) {
      const compounds = selector.split(/\s*[>+~]\s*|\s+/).filter(Boolean);
      let insideTable = false;
      for (const compound of compounds) {
        if (compound.startsWith('.docs-table')) insideTable = true;
        const bareTag = /^[a-z][a-z0-9]*/.test(compound);
        if (bareTag && !insideTable) offenders.push(selector);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('has hooks for the elements the components map renders', () => {
    const selectors = contentSelectors().join('\n');
    for (const hook of [
      'docs-p',
      'docs-h2',
      'docs-h3',
      'docs-link',
      'docs-list',
      'docs-inline-code',
      'docs-table',
      'docs-code',
    ]) {
      expect(selectors, `no rule for .${hook}`).toContain(`.${hook}`);
    }
  });

  /** The utility classes a rule applies, for the exact selector given. */
  const applied = (selector: string) => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rule = css.match(
      new RegExp(`(?:^|[}\\s])${escaped}\\s*\\{\\s*@apply\\s+([^;]+);`),
    );
    return rule ? rule[1].trim().split(/\s+/).sort() : null;
  };

  // The legacy pages used an h3 of `text-lg font-semibold … mb-2` about 134
  // times and a larger `text-xl … mt-8 mb-4` about 49 times. Unifying on the
  // minority variant opened every sub-section up by a third, with a heading
  // one size too large, and nothing that compares text could notice. An h3
  // straight under an h2 sits on the h2's own bottom margin, as it did when
  // the legacy pages grouped them.
  it('keeps the sub-heading rhythm of the pages it replaced', () => {
    expect(applied('.docs-h3')).toEqual(
      ['text-lg', 'font-semibold', 'mt-6', 'mb-2'].sort(),
    );
    expect(applied('.docs-h2 + .docs-h3')).toEqual(['mt-0']);
  });

  // Markdown hands `**SliderController** — central state` to the list item
  // as two sibling nodes. A flex item row turns each into its own flex item
  // and puts the row gap between the bold word and the rest of the sentence;
  // the legacy markup wrapped both in one span. Markers are positioned
  // instead, so the item text stays one line of prose.
  it('keeps a bullet item one flow of text', () => {
    const itemRules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(
      (match) => /\[data-bullets[^\]]*\]\s+\.docs-li\s*$/.test(match[1].trim()),
    );
    expect(itemRules.length).toBeGreaterThan(0);
    for (const [, selector, body] of itemRules) {
      expect(body, selector.trim()).not.toMatch(/\b(flex|grid|inline-flex)\b/);
    }
  });

  // A bare `<strong>` on the legacy pages was bold in the colour of the text
  // around it. Giving it a weight or a colour of its own darkens every bold
  // word in a muted paragraph or list.
  it('renders bold text the way a bare strong element did', () => {
    expect(applied('.docs-strong')).toEqual(['font-bold']);
    // No rule that restyles bold text in one context only.
    expect(css).not.toMatch(/^[ \t]*[^\s{}][^{}\n]*\s\.docs-strong\s*\{/m);
  });
});
