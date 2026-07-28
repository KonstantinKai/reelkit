import { describe, expect, it } from 'vitest';

const declarations = import.meta.glob('./**/*.d.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

// Pins the placement of the vite/client reference; `src/vite-env.d.ts` carries
// the reason it cannot live in a tsconfig `types` array instead.
describe('vite ambient types', () => {
  it('references vite/client from a declaration file inside src', () => {
    const referencing = Object.entries(declarations).filter(([, source]) =>
      /\/\/\/\s*<reference\s+types=["']vite\/client["']\s*\/>/.test(source),
    );
    expect(
      referencing.map(([path]) => path),
      'no .d.ts under src references vite/client, so bundler-only types ' +
        'resolve in the build but not in the editor',
    ).not.toEqual([]);
  });

  // Both features are load-bearing in the suite: the search index reads the
  // sitemap with `?raw`, and the brand-icon guard globs the sources.
  it('resolves the bundler-only imports it declares', async () => {
    expect(Object.keys(declarations).length).toBeGreaterThan(0);
    const sitemap = await import('../public/sitemap.xml?raw');
    expect(sitemap.default).toContain('<urlset');
  });
});
