import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { loadLlmsEntries, renderLlmsFullTxt } from '../content/llmsText';
import { matchesSearch, searchItemsFor } from '../data/searchData';
import { parseLlmsCorpus } from './llmsCorpus';
import type { ModelContextTool } from './modelContext';
import { createDocsTools } from './tools';

const corpus = parseLlmsCorpus(
  renderLlmsFullTxt(
    loadLlmsEntries(join(import.meta.dirname, '../content/llms')),
  ),
);

// A script URL is exactly the kind of input the tools must refuse.
// eslint-disable-next-line no-script-url
const _kScriptUrl = 'javascript:alert(1)';

function setup(pathname = '/docs/getting-started') {
  const location = { origin: 'http://localhost:4200', pathname };
  const navigate = vi.fn<(to: string) => void>();
  const loadCorpus = vi.fn(async () => corpus);
  const tools = createDocsTools({
    loadCorpus,
    currentLocation: () => location,
    navigate,
  });
  const byName = (name: string) =>
    tools.find((tool) => tool.name === name) as ModelContextTool;
  const call = (name: string, input: unknown) =>
    byName(name).execute(input) as Promise<Record<string, unknown>>;
  return { location, navigate, loadCorpus, tools, byName, call };
}

describe('tool definitions', () => {
  it('registers the four docs tools', () => {
    expect(setup().tools.map((tool) => tool.name)).toEqual([
      'list_pages',
      'search_docs',
      'get_page',
      'open_page',
    ]);
  });

  it('describes every tool and closes its input schema', () => {
    for (const tool of setup().tools) {
      expect(tool.title, tool.name).toBeTruthy();
      expect(tool.description, tool.name).toBeTruthy();
      expect(tool.inputSchema.type).toBe('object');
      expect(tool.inputSchema.additionalProperties).toBe(false);
      expect(Array.isArray(tool.inputSchema.required)).toBe(true);
      for (const key of tool.inputSchema.required) {
        expect(tool.inputSchema.properties, tool.name).toHaveProperty(key);
      }
    }
  });

  it('marks every tool but navigation as read-only', () => {
    const { byName } = setup();
    for (const name of ['list_pages', 'search_docs', 'get_page']) {
      expect(byName(name).annotations?.readOnlyHint, name).toBe(true);
    }
    expect(byName('open_page').annotations?.readOnlyHint).toBeUndefined();
  });
});

describe('list_pages', () => {
  it('lists every page of the corpus, each one readable with get_page', async () => {
    const { call } = setup();
    const { pages } = (await call('list_pages', {})) as {
      pages: { title: string; url: string; section: string }[];
    };
    expect(pages).toEqual(
      corpus.map(({ title, url, section }) => ({ title, url, section })),
    );
    for (const { url } of pages) {
      const page = await call('get_page', { path: url });
      expect(page.error, url).toBeUndefined();
      expect(page.url).toBe(url);
    }
  });
});

describe('search_docs', () => {
  it.each([
    ['', 'en'],
    ['player', 'en'],
    ['signal', 'en'],
    ['lightbox', 'uk'],
    ['плеєр', 'uk'],
  ] as const)(
    'matches what the search box finds for "%s" in %s',
    async (query, locale) => {
      const { call } = setup();
      const { results } = (await call('search_docs', { query, locale })) as {
        results: { url: string }[];
      };
      const expected = searchItemsFor(locale)
        .filter((item) => matchesSearch(item, query))
        .slice(0, 20)
        .map(
          (item) =>
            `https://reelkit.dev${item.path}${
              item.sectionAnchor ? `#${item.sectionAnchor}` : ''
            }`,
        );
      expect(results.map((result) => result.url)).toEqual(expected);
      expect(results.length).toBeLessThanOrEqual(20);
    },
  );

  it('points section results at their anchor', async () => {
    const { call } = setup();
    const { results } = (await call('search_docs', {
      query: 'quick start',
    })) as { results: { url: string; section?: string }[] };
    const section = results.find((result) => result.section);
    expect(section?.url).toMatch(
      /^https:\/\/reelkit\.dev\/docs\/.+#[a-z0-9-]+$/,
    );
  });

  it('keeps every framework unless one is asked for', async () => {
    const { call } = setup();
    const all = (await call('search_docs', { query: 'reel player' })) as {
      results: { url: string }[];
    };
    const vue = (await call('search_docs', {
      query: 'reel player',
      framework: 'vue',
    })) as { results: { url: string }[] };
    const urls = all.results.map((result) => result.url).join(' ');
    expect(urls).toContain('/docs/reel-player');
    expect(urls).toContain('/docs/vue-reel-player');
    expect(vue.results.length).toBeGreaterThan(0);
    for (const { url } of vue.results) {
      expect(url).not.toMatch(/\/docs\/(reel-player|angular-reel-player)/);
    }
  });

  it('defaults to the language of the page the reader is on now', async () => {
    const { call, location } = setup('/docs/ssr');
    const first = (await call('search_docs', { query: 'ssr' })) as {
      results: { url: string }[];
    };
    expect(first.results[0].url).toMatch(/^https:\/\/reelkit\.dev\/docs\//);

    location.pathname = '/uk/docs/ssr';
    const second = (await call('search_docs', { query: 'ssr' })) as {
      results: { url: string }[];
    };
    expect(second.results[0].url).toMatch(
      /^https:\/\/reelkit\.dev\/uk\/docs\//,
    );
  });
});

describe('get_page', () => {
  it.each([
    'docs/ssr',
    '/docs/ssr',
    '/docs/ssr/',
    '/uk/docs/ssr',
    '/docs/ssr?framework=vue',
    '/docs/ssr#hydration',
    'https://reelkit.dev/docs/ssr',
    'https://reelkit.dev/es/docs/ssr#hydration',
    'http://localhost:4200/docs/ssr',
  ])('reads the same page from %s', async (path) => {
    const { call } = setup();
    const page = await call('get_page', { path });
    const ssr = corpus.find((entry) => entry.url.endsWith('/docs/ssr'));
    expect(page).toEqual({
      url: 'https://reelkit.dev/docs/ssr',
      title: ssr?.title,
      markdown: ssr?.markdown,
    });
  });

  it.each([
    '/docs/nope',
    '/',
    '/privacy',
    'https://example.com/docs/ssr',
    '//example.com/docs/ssr',
    _kScriptUrl,
  ])('answers %s with an error', async (path) => {
    const { call } = setup();
    const page = await call('get_page', { path });
    expect(page.error).toMatch(/list_pages/);
    expect(page.markdown).toBeUndefined();
  });

  it('answers a failed corpus fetch with an error', async () => {
    const { call, loadCorpus } = setup();
    loadCorpus.mockRejectedValueOnce(new Error('offline'));
    await expect(call('get_page', { path: '/docs/ssr' })).resolves.toEqual({
      error: 'offline',
    });
    await expect(call('list_pages', {})).resolves.toHaveProperty('pages');
  });
});

describe('open_page', () => {
  it('navigates in the language the reader is on now', async () => {
    const { call, navigate, location } = setup('/uk/docs/getting-started');
    await expect(
      call('open_page', { path: 'https://reelkit.dev/docs/ssr' }),
    ).resolves.toEqual({ url: 'https://reelkit.dev/uk/docs/ssr' });
    expect(navigate).toHaveBeenLastCalledWith('/uk/docs/ssr');

    location.pathname = '/docs/ssr';
    await call('open_page', { path: '/uk/docs/core/guide', anchor: 'signals' });
    expect(navigate).toHaveBeenLastCalledWith('/docs/core/guide#signals');
  });

  it('keeps the anchor of a search result', async () => {
    const { call, navigate } = setup();
    await call('open_page', {
      path: 'https://reelkit.dev/docs/ssr#hydration',
    });
    expect(navigate).toHaveBeenCalledWith('/docs/ssr#hydration');
  });

  it('opens pages that have no corpus text', async () => {
    const { call, navigate } = setup();
    await call('open_page', { path: '/' });
    await call('open_page', { path: '/privacy' });
    expect(navigate.mock.calls).toEqual([['/'], ['/privacy']]);
  });

  it.each([
    [{ path: '/docs/nope' }],
    [{ path: 'https://example.com/docs/ssr' }],
    [{ path: '//example.com' }],
    [{ path: _kScriptUrl }],
    [{ path: '/docs/ssr', anchor: 'x"><script>' }],
    [{ path: '/docs/ssr#Not A Slug' }],
  ])('refuses %j without navigating', async (input) => {
    const { call, navigate } = setup();
    const result = await call('open_page', input);
    expect(result.error).toBeTruthy();
    expect(navigate).not.toHaveBeenCalled();
  });
});

describe('tool input', () => {
  it.each([
    ['search_docs', undefined],
    ['search_docs', null],
    ['search_docs', 'player'],
    ['search_docs', []],
    ['search_docs', {}],
    ['search_docs', { query: 3 }],
    ['search_docs', { query: 'x', locale: 'fr' }],
    ['search_docs', { query: 'x', framework: 'svelte' }],
    ['search_docs', { query: 'x', limit: 5 }],
    ['list_pages', { all: true }],
    ['get_page', {}],
    ['get_page', { path: ['/docs/ssr'] }],
    ['open_page', { path: '/docs/ssr', anchor: 1 }],
  ])(
    'answers %s with %j as an error, never a rejection',
    async (name, input) => {
      const { call, navigate } = setup();
      const result = await call(name, input);
      expect(typeof result.error).toBe('string');
      expect(navigate).not.toHaveBeenCalled();
    },
  );
});

// The tools only read the public docs: no cookies, no browser storage and no
// request to another origin, so the privacy page has nothing to add.
describe('what the tools can reach', () => {
  const sources = readdirSync(import.meta.dirname)
    .filter((file) => file.endsWith('.ts') && !file.includes('.spec.'))
    .map((file) => [
      file,
      readFileSync(join(import.meta.dirname, file), 'utf8'),
    ]);

  it.each(sources)('%s touches no cookie or storage', (_file, source) => {
    expect(source).not.toMatch(
      /document\.cookie|localStorage|sessionStorage|indexedDB|caches\./,
    );
  });

  it.each(sources)('%s fetches only from its own origin', (_file, source) => {
    for (const [, target] of source.matchAll(/fetch\(\s*([^)]*)\)/g)) {
      expect(target).toMatch(/^'\/[^/]/);
    }
    expect(source).not.toMatch(/XMLHttpRequest|sendBeacon|WebSocket/);
  });
});
