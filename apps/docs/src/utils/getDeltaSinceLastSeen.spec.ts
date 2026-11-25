import { describe, expect, it } from 'vitest';
import { getDeltaSinceLastSeen } from './getDeltaSinceLastSeen';

describe('getDeltaSinceLastSeen', () => {
  const ids = [
    '@reelkit/core@1.2.0',
    '@reelkit/core@1.1.0',
    '@reelkit/core@1.0.0',
  ];

  it('returns ids newer than the last-seen id (exclusive)', () => {
    expect(getDeltaSinceLastSeen(ids, '@reelkit/core@1.1.0')).toEqual([ids[0]]);
  });

  it('returns all ids when lastSeen is null', () => {
    expect(getDeltaSinceLastSeen(ids, null)).toEqual(ids);
  });

  it('returns all ids when lastSeen is not in the list', () => {
    expect(getDeltaSinceLastSeen(ids, '@reelkit/core@0.9.0')).toEqual(ids);
  });

  it('returns empty when lastSeen equals the newest id', () => {
    expect(getDeltaSinceLastSeen(ids, ids[0])).toEqual([]);
  });

  it('does not mutate the source list', () => {
    const copy = ids.slice();
    getDeltaSinceLastSeen(ids, ids[0]).push('extra');
    expect(ids).toEqual(copy);
  });
});
