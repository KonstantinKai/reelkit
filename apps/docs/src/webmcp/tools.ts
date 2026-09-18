import { kSitePages } from '../content/manifest';
import { kFrameworks, type Framework } from '../data/frameworkSignal';
import { matchesSearch, searchItemsFor } from '../data/searchData';
import {
  kLocales,
  kSiteOrigin,
  localeUrl,
  readLocaleFromPath,
  stripLocaleFromPath,
  withLocale,
  type Locale,
} from '../i18n/locale';
import type { CorpusPage } from './llmsCorpus';
import type { ModelContextTool, ToolInputSchema } from './modelContext';

export interface DocsToolsOptions {
  loadCorpus: () => Promise<CorpusPage[]>;
  /** Where the reader is, read on every call so a language switch counts. */
  currentLocation: () => { origin: string; pathname: string };
  /** Client-side navigation, the same the site's own links use. */
  navigate: (to: string) => void;
}

type ToolResult = Record<string, unknown>;

const _kMaxSearchResults = 20;

const _kPagePaths = new Set(
  kSitePages.map((page) => (page.path === '' ? '/' : `/${page.path}`)),
);

// Heading ids are lowercase slugs. Anything else is not a section on the
// page, and would put arbitrary text into the address bar.
const _kAnchor = /^[a-z0-9-]+$/;

const _kPathDescription =
  'Page path or URL, as `list_pages` or `search_docs` return it, for example `/docs/core/guide` or `https://reelkit.dev/docs/core/guide#signals`.';

interface ResolvedPage {
  path: string;
  anchor?: string;
}

/**
 * The docs page an agent means, from anything that names it: a bare path, a
 * path without its leading slash, an absolute URL on this site, with or
 * without a language prefix, query, anchor or trailing slash. Nothing
 * outside the site's own pages resolves.
 */
function resolvePage(input: string, origin: string): ResolvedPage | undefined {
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(input);
  let url: URL;
  try {
    url = new URL(
      hasScheme ? input : `/${input.trim().replace(/^\/+/, '')}`,
      kSiteOrigin,
    );
  } catch {
    return undefined;
  }
  if (url.origin !== kSiteOrigin && url.origin !== origin) return undefined;
  const path = stripLocaleFromPath(url.pathname);
  if (!_kPagePaths.has(path)) return undefined;
  const anchor = url.hash.slice(1);
  return anchor ? { path, anchor } : { path };
}

/** Checks the input against the tool's schema; the browser does not. */
function readInput(
  input: unknown,
  schema: ToolInputSchema,
): Record<string, string> | string {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return 'Input must be an object.';
  }
  const values: Record<string, string> = {};
  for (const [key, value] of Object.entries(input)) {
    const property = schema.properties[key];
    if (!property) return `Unknown input \`${key}\`.`;
    if (value === undefined) continue;
    if (typeof value !== 'string') return `\`${key}\` must be a string.`;
    if (property.enum && !property.enum.includes(value)) {
      return `\`${key}\` must be one of: ${property.enum.join(', ')}.`;
    }
    values[key] = value;
  }
  const missing = schema.required.find((key) => !(key in values));
  return missing ? `\`${missing}\` is required.` : values;
}

interface ToolDefinition extends Omit<ModelContextTool, 'execute'> {
  run: (values: Record<string, string>) => Promise<ToolResult> | ToolResult;
}

// A rejected call reaches the agent as an error with no message, so every
// failure is answered as a result the agent can read instead.
function toTool({ run, ...tool }: ToolDefinition): ModelContextTool {
  return {
    ...tool,
    execute: async (input) => {
      const values = readInput(input, tool.inputSchema);
      if (typeof values === 'string') return { error: values };
      try {
        return await run(values);
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  };
}

const unknownPage = (input: string) => ({
  error: `No docs page at \`${input}\`. Call \`list_pages\` for every page.`,
});

/** The tools the docs register with the browser's model context. */
export function createDocsTools({
  loadCorpus,
  currentLocation,
  navigate,
}: DocsToolsOptions): ModelContextTool[] {
  const currentLocale = () => readLocaleFromPath(currentLocation().pathname);

  return [
    toTool({
      name: 'list_pages',
      title: 'List Reelkit docs pages',
      description:
        'Lists every page of the Reelkit documentation with its title, URL and group. Page text is English.',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      run: async () => ({
        pages: (await loadCorpus()).map(({ title, url, section }) => ({
          title,
          url,
          section,
        })),
      }),
    }),
    toTool({
      name: 'search_docs',
      title: 'Search Reelkit docs',
      description: `Searches Reelkit documentation page and section titles and keywords, the same way the site's search box does. Returns up to ${_kMaxSearchResults} matches with absolute URLs, section anchors included.`,
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description:
              'Words to look for. An empty query matches everything.',
          },
          locale: {
            type: 'string',
            description:
              'Language of titles and URLs. Defaults to the language of the page the reader is on.',
            enum: kLocales,
          },
          framework: {
            type: 'string',
            description:
              'Keep only framework-neutral results and those for this framework.',
            enum: kFrameworks,
          },
        },
        required: ['query'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      run: ({ query, locale, framework }) => {
        const items = searchItemsFor(
          (locale as Locale | undefined) ?? currentLocale(),
        ).filter(
          (item) =>
            (!framework ||
              !item.framework ||
              item.framework === (framework as Framework)) &&
            matchesSearch(item, query.trim()),
        );
        return {
          results: items.slice(0, _kMaxSearchResults).map((item) => ({
            title: item.title,
            section: item.sectionTitle,
            url: `${kSiteOrigin}${item.path}${
              item.sectionAnchor ? `#${item.sectionAnchor}` : ''
            }`,
            category: item.category,
          })),
        };
      },
    }),
    toTool({
      name: 'get_page',
      title: 'Read a Reelkit docs page',
      description:
        'Returns one Reelkit docs page as markdown, the text `llms-full.txt` publishes for it. Page text is English whatever the language of the path.',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: _kPathDescription },
        },
        required: ['path'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      run: async ({ path }) => {
        const resolved = resolvePage(path, currentLocation().origin);
        if (!resolved) return unknownPage(path);
        const url = `${kSiteOrigin}${resolved.path}`;
        const page = (await loadCorpus()).find((entry) => entry.url === url);
        if (!page) return unknownPage(path);
        return { url: page.url, title: page.title, markdown: page.markdown };
      },
    }),
    toTool({
      name: 'open_page',
      title: 'Open a Reelkit docs page',
      description:
        'Shows a Reelkit docs page to the reader in this tab, in the language they are reading, optionally scrolled to a section.',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: _kPathDescription },
          anchor: {
            type: 'string',
            description:
              'Section id to scroll to, for example `quick-start`. Overrides an anchor in `path`.',
          },
        },
        required: ['path'],
        additionalProperties: false,
      },
      run: ({ path, anchor }) => {
        const resolved = resolvePage(path, currentLocation().origin);
        if (!resolved) return unknownPage(path);
        const section = anchor ?? resolved.anchor;
        if (section !== undefined && !_kAnchor.test(section)) {
          return { error: `\`${section}\` is not a section id.` };
        }
        const locale = currentLocale();
        const hash = section ? `#${section}` : '';
        navigate(`${withLocale(locale, resolved.path)}${hash}`);
        return { url: `${localeUrl(locale, resolved.path)}${hash}` };
      },
    }),
  ];
}
