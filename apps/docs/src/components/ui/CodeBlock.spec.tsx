import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CodeBlock } from './CodeBlock';

describe('code block', () => {
  // A static import pulls the highlighter into every page that shows a code
  // sample, the home page included, before anything is on screen.
  it('loads the highlighter on demand', () => {
    const source = readFileSync(
      join(import.meta.dirname, 'CodeBlock.tsx'),
      'utf8',
    );
    expect(source).not.toMatch(/^import[^;]*from 'shiki';/m);
    expect(source).toContain("import('shiki')");
  });

  // The prerendered page shows the sample before the highlighter runs, in the
  // markup the highlighter produces, so nothing moves when colours arrive.
  it('prerenders the code in the highlighter markup', () => {
    const html = renderToString(
      <CodeBlock code={'const a = 1;\n\nfoo();'} language="tsx" />,
    );
    expect(html).toContain(
      'class="shiki shiki-themes github-light catppuccin-macchiato"',
    );
    const lines = html.match(/<span class="line">[^<]*<\/span>/g);
    expect(lines).toEqual([
      '<span class="line">const a = 1;</span>',
      '<span class="line"></span>',
      '<span class="line">foo();</span>',
    ]);
  });
});
