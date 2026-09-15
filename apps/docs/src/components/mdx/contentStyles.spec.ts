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
});
