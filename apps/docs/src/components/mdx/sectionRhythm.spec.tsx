import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { useMDXComponents } from './components';

const css = readFileSync(
  join(import.meta.dirname, '../../styles.css'),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

// The legacy pages wrapped every section in `mb-12`, so a section title sat
// 48px below whatever ended the section before it. Content files have no
// section wrapper; a markdown h2 gets that distance from its own top margin.
// A component that opens a section with its own heading has no such margin
// and would sit on the previous block's smaller bottom margin instead — the
// wrapper gives it the section's distance back.
describe('section rhythm', () => {
  it('opens the next steps section as far down as any other section', () => {
    const { NextSteps } = useMDXComponents();
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <NextSteps
          items={[
            {
              label: 'Core Guide',
              path: '/docs/core/guide',
              description: 'engine',
            },
          ]}
        />
      </MemoryRouter>,
    );
    expect(html).toMatch(/^<div class="docs-section">[\s\S]*<h2/);
    expect(css).toMatch(/\.docs-section\s*\{\s*@apply\s+mt-12;\s*\}/);
  });
});
