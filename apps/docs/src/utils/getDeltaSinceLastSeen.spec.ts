import { describe, expect, it } from 'vitest';
import type { ChangelogEntry } from './parseChangelog';
import { getDeltaSinceLastSeen } from './getDeltaSinceLastSeen';

const makeEntry = (id: string): ChangelogEntry => ({
  id,
  title: id,
  date: '',
  bodyHtml: '',
});

describe('getDeltaSinceLastSeen', () => {
  const entries = [
    makeEntry('@reelkit/core@1.2.0'),
    makeEntry('@reelkit/core@1.1.0'),
    makeEntry('@reelkit/core@1.0.0'),
  ];

  it('returns entries newer than the last-seen id (exclusive)', () => {
    expect(getDeltaSinceLastSeen(entries, '@reelkit/core@1.1.0')).toEqual([
      entries[0],
    ]);
  });

  it('returns all entries when lastSeen is null', () => {
    expect(getDeltaSinceLastSeen(entries, null)).toEqual(entries);
  });

  it('returns all entries when lastSeen is not in the list', () => {
    expect(getDeltaSinceLastSeen(entries, '@reelkit/core@0.9.0')).toEqual(
      entries,
    );
  });

  it('returns empty when lastSeen equals the newest entry', () => {
    expect(getDeltaSinceLastSeen(entries, entries[0].id)).toEqual([]);
  });

  it('does not mutate the source list', () => {
    const copy = entries.slice();
    getDeltaSinceLastSeen(entries, entries[0].id);
    expect(entries).toEqual(copy);
  });
});
