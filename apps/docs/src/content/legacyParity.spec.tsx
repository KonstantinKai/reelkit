import { describe, expect, it, vi } from 'vitest';
import type { ComponentType, ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { kLocales, withLocale } from '../i18n/locale';
import { kSitePages } from './manifest';
import { pageFiles } from './sitePages';

/*
 * Migration guard for pages moved from a tsx module to a content file. While
 * a page's old module is still mounted as its `-legacy` twin, the content
 * file must say exactly what the module said: the same words in the same
 * order, the same code samples byte for byte, and the same heading anchors,
 * which other pages and the search index link to. Layout is compared by eye
 * on the twin route. The test goes away with the legacy modules.
 */

const recorded = vi.hoisted(() => ({ samples: [] as string[] }));

// The real highlighter renders nothing until an effect runs, so a static
// render would show no code at all. Both renders go through the same
// stand-in, which records each sample as the reader would copy it.
vi.mock('../components/ui/CodeBlock', () => ({
  CodeBlock: ({ code }: { code: string }) => {
    recorded.samples.push(code.trim());
    return null;
  },
}));

vi.mock('../components/ui/Sandbox', () => ({
  Sandbox: ({ code, children }: { code: string; children?: ReactNode }) => {
    recorded.samples.push(code.trim());
    return children;
  },
}));

const contentModules = import.meta.glob<{ default: ComponentType }>(
  './*/docs/**/*.mdx',
);
const legacyModules = import.meta.glob<{ default: ComponentType }>(
  '../pages/**/*.tsx',
);

const twins = kLocales.flatMap((locale) =>
  kSitePages.flatMap((page) => {
    const { main, legacy } = pageFiles(page, locale);
    return legacy
      ? [{ locale, path: `/${page.path}`, content: main, legacy }]
      : [];
  }),
);

const entities: Record<string, string> = {
  '&quot;': '"',
  '&#x27;': "'",
  '&#39;': "'",
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&nbsp;': ' ',
};

async function render(
  load: () => Promise<{ default: ComponentType }>,
  path: string,
) {
  const { default: Page } = await load();
  recorded.samples.length = 0;
  const html = renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <Page />
    </MemoryRouter>,
  );
  const text = html
    .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[#\w]+;/g, (entity) => entities[entity] ?? entity)
    .replace(/\s+/g, ' ')
    .trim();
  const anchors = [...html.matchAll(/<h[23]\b[^>]*\bid="([^"]*)"/g)].map(
    (match) => match[1],
  );
  return { text, anchors, samples: [...recorded.samples] };
}

describe.each(twins)('$locale $path moved to a content file', (twin) => {
  const route = withLocale(twin.locale, twin.path);
  const pair = async () => {
    const contentKey = `./${twin.content.slice('content/'.length)}`;
    const legacyKey = `../${twin.legacy}`;
    expect(contentModules[contentKey], contentKey).toBeDefined();
    expect(legacyModules[legacyKey], legacyKey).toBeDefined();
    return {
      content: await render(contentModules[contentKey], route),
      legacy: await render(legacyModules[legacyKey], route),
    };
  };

  it('keeps every word of the legacy page, in order', async () => {
    const { content, legacy } = await pair();
    expect(content.text).toBe(legacy.text);
  });

  it('shows the same code samples, in the same order', async () => {
    const { content, legacy } = await pair();
    expect(content.samples).toEqual(legacy.samples);
  });

  it('keeps every heading anchor', async () => {
    const { content, legacy } = await pair();
    expect(content.anchors).toEqual(legacy.anchors);
  });
});
