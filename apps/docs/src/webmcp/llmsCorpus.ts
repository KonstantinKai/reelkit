import { kSiteOrigin } from '../i18n/locale';

/** One docs page as `llms-full.txt` carries it. */
export interface CorpusPage {
  title: string;
  url: string;
  /** The group the page is listed under, such as `Core` or `React`. */
  section: string;
  markdown: string;
}

const _kUrlLinePrefix = `URL: ${kSiteOrigin}/`;

// A page opens with its title, a blank line and its URL. Page bodies carry
// their own `##` and `###` headings, so a heading alone never starts a page.
const isPageHeader = (lines: string[], index: number) =>
  lines[index]?.startsWith('### ') === true &&
  lines[index + 1] === '' &&
  lines[index + 2]?.startsWith(_kUrlLinePrefix) === true;

// A group heading is only one when a page header follows it directly.
const isGroupHeading = (lines: string[], index: number) =>
  lines[index]?.startsWith('## ') === true &&
  lines[index + 1] === '' &&
  isPageHeader(lines, index + 2);

/** Split `llms-full.txt` into its pages, in file order. */
export function parseLlmsCorpus(text: string): CorpusPage[] {
  const lines = text.split('\n');
  const pages: CorpusPage[] = [];
  let section = '';
  let open: (Omit<CorpusPage, 'markdown'> & { start: number }) | undefined;

  const close = (end: number) => {
    if (!open) return;
    const { start, ...page } = open;
    pages.push({
      ...page,
      markdown: lines.slice(start, end).join('\n').trim(),
    });
    open = undefined;
  };

  for (let index = 0; index < lines.length; index++) {
    if (isGroupHeading(lines, index)) {
      close(index);
      section = lines[index].slice(3).trim();
      index++;
    } else if (isPageHeader(lines, index)) {
      close(index);
      open = {
        title: lines[index].slice(4).trim(),
        url: lines[index + 2].slice('URL: '.length).trim(),
        section,
        start: index + 3,
      };
      index += 2;
    }
  }
  close(lines.length);
  return pages;
}

/**
 * Loads the pages once per document. Calls made while the file is on its way
 * share that one request, and a failed request is dropped so the next call
 * tries again.
 */
export function createCorpusLoader(
  fetchText: () => Promise<string>,
): () => Promise<CorpusPage[]> {
  let pending: Promise<CorpusPage[]> | undefined;
  return () => {
    pending ??= fetchText()
      .then(parseLlmsCorpus)
      .catch((error: unknown) => {
        pending = undefined;
        throw error;
      });
    return pending;
  };
}

/** Reads `llms-full.txt` from the site the page was served from. */
export async function fetchCorpusText(): Promise<string> {
  const response = await fetch('/llms-full.txt');
  if (!response.ok) {
    throw new Error(`llms-full.txt answered with status ${response.status}`);
  }
  return response.text();
}
