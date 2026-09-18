import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { loadLlmsEntries, renderLlmsFullTxt } from '../content/llmsText';
import { createCorpusLoader, parseLlmsCorpus } from './llmsCorpus';

const entries = loadLlmsEntries(join(import.meta.dirname, '../content/llms'));
const corpus = renderLlmsFullTxt(entries);

describe('docs corpus', () => {
  it('holds page bodies with headings of their own, which the split must survive', () => {
    expect(entries.some((entry) => /^## /m.test(entry.body))).toBe(true);
    expect(entries.some((entry) => /^### /m.test(entry.body))).toBe(true);
  });

  it('returns every page body exactly as its source file holds it', () => {
    const pages = parseLlmsCorpus(corpus);
    expect(pages.map((page) => page.url)).toEqual(
      entries.map((entry) => entry.url),
    );
    pages.forEach((page, index) => {
      expect(page.title, page.url).toBe(entries[index].title);
      expect(page.section, page.url).toBe(entries[index].section);
      expect(page.markdown, page.url).toBe(entries[index].body);
    });
  });

  it('finds one page per URL line of the file', () => {
    const urlLines = corpus
      .split('\n')
      .filter((line) => line.startsWith('URL: https://reelkit.dev/'));
    expect(parseLlmsCorpus(corpus)).toHaveLength(urlLines.length);
  });
});

describe('corpus loading', () => {
  it('fetches the file once for calls made together and after', async () => {
    const fetchText = vi.fn(async () => corpus);
    const load = createCorpusLoader(fetchText);

    const [first, second] = await Promise.all([load(), load()]);
    const third = await load();

    expect(fetchText).toHaveBeenCalledTimes(1);
    expect(second).toBe(first);
    expect(third).toBe(first);
  });

  it('tries again after a failed fetch', async () => {
    const fetchText = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(corpus);
    const load = createCorpusLoader(fetchText);

    await expect(load()).rejects.toThrow('offline');
    await expect(load()).resolves.toHaveLength(entries.length);
    expect(fetchText).toHaveBeenCalledTimes(2);
  });
});
