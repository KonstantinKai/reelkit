import { describe, expect, it } from 'vitest';
import { changelogEntryId, splitChangelog } from './changelogChunks';
import { parseChangelog } from '../utils/parseChangelog';
import * as served from 'virtual:reelkit-changelog';

// eslint-disable-next-line @nx/enforce-module-boundaries
import changelogRaw from '../../../../CHANGELOG.md?raw';

const headingsIn = (md: string) => md.match(/^## .*$/gm) ?? [];
const datesIn = (md: string) =>
  new Set(
    headingsIn(md).map((line) => line.match(/\((\d{4}-\d{2}-\d{2})\)/)?.[1]),
  );

const release = (date: string, count: number, from = 0) =>
  Array.from(
    { length: count },
    (_, index) =>
      `## @reelkit/p${from + index}@1.0.${index} (${date})\n\n- change ${index}\n\n`,
  ).join('');

describe('changelog chunks over the real changelog', () => {
  const { ids, chunks } = splitChangelog(changelogRaw);

  it('joins back into the source text exactly', () => {
    expect(chunks.join('')).toBe(changelogRaw);
  });

  it('puts every heading, documentation sections included, in exactly one chunk', () => {
    const all = headingsIn(changelogRaw);
    expect(all.some((line) => line.startsWith('## Documentation'))).toBe(true);
    expect(chunks.flatMap(headingsIn)).toEqual(all);
  });

  it('never splits a release across two chunks', () => {
    const seen = new Set<string | undefined>();
    for (const chunk of chunks) {
      for (const date of datesIn(chunk)) {
        expect(seen.has(date), `date ${date}`).toBe(false);
      }
      for (const date of datesIn(chunk)) seen.add(date);
    }
  });

  it('keeps the first chunk at twenty entries and later ones at thirty', () => {
    expect(chunks.length).toBeGreaterThan(2);
    expect(headingsIn(chunks[0]).length).toBeGreaterThanOrEqual(20);
    for (const chunk of chunks.slice(1, -1)) {
      expect(headingsIn(chunk).length).toBeGreaterThanOrEqual(30);
    }
  });

  it('lists the same entry ids as the parser, newest first', () => {
    expect(ids).toEqual(parseChangelog(changelogRaw).map((entry) => entry.id));
  });
});

// The Vite plugin is what the app reads, so its modules are checked against
// the splitter they are built from.
describe('changelog chunks as the app reads them', () => {
  const { ids, chunks } = splitChangelog(changelogRaw);

  it('serves the ids, the head and the chunk count', () => {
    expect(served.ids).toEqual(ids);
    expect(served.head).toBe(chunks[0]);
    expect(served.chunkCount).toBe(chunks.length);
  });

  it('loads every later chunk on demand', async () => {
    for (let index = 1; index < chunks.length; index += 1) {
      expect(await served.loadChunk(index)).toBe(chunks[index]);
    }
  });

  it('refuses the head and chunks that do not exist', async () => {
    await expect(served.loadChunk(0)).rejects.toThrow(RangeError);
    await expect(served.loadChunk(chunks.length)).rejects.toThrow(RangeError);
  });
});

describe('changelog chunks', () => {
  it('cuts only where a new release starts', () => {
    const md =
      release('2026-03-01', 2) +
      release('2026-02-01', 2, 2) +
      release('2026-01-01', 2, 4);
    const { chunks } = splitChangelog(md, { headEntries: 3, chunkEntries: 1 });
    expect(chunks.map((chunk) => headingsIn(chunk).length)).toEqual([4, 2]);
    expect(chunks.join('')).toBe(md);
  });

  it('keeps a documentation section with the release it belongs to', () => {
    const md =
      release('2026-03-01', 1) +
      '## Documentation (2026-03-01)\n\n- docs\n\n' +
      release('2026-02-01', 1, 1);
    const { ids, chunks } = splitChangelog(md, { headEntries: 1 });
    expect(chunks[0]).toContain('## Documentation (2026-03-01)');
    expect(headingsIn(chunks[1])).toEqual([
      '## @reelkit/p1@1.0.0 (2026-02-01)',
    ]);
    expect(ids).toEqual(['@reelkit/p0@1.0.0', '@reelkit/p1@1.0.0']);
  });

  it('keeps a changelog smaller than the first chunk whole', () => {
    const md = release('2026-03-01', 3);
    expect(splitChangelog(md).chunks).toEqual([md]);
  });

  it('keeps a single release larger than the first chunk whole', () => {
    const md = release('2026-03-01', 25) + release('2026-02-01', 1, 25);
    const { chunks } = splitChangelog(md);
    expect(chunks.map((chunk) => headingsIn(chunk).length)).toEqual([25, 1]);
  });

  it('keeps text above the first heading in the first chunk', () => {
    const md = '# Changelog\n\n' + release('2026-03-01', 1);
    expect(splitChangelog(md, { headEntries: 1 }).chunks).toEqual([md]);
  });

  it('returns nothing for an empty changelog', () => {
    expect(splitChangelog('')).toEqual({ ids: [], chunks: [] });
  });

  it('gives no id to a heading that names no package release', () => {
    expect(changelogEntryId('Documentation (2026-03-01)')).toBeNull();
    expect(changelogEntryId('@reelkit/core@0.5.0 (2026-03-01)')).toBe(
      '@reelkit/core@0.5.0',
    );
  });
});
