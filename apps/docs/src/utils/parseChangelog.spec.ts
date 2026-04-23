import { describe, expect, it } from 'vitest';
import { parseChangelog } from './parseChangelog';

describe('parseChangelog', () => {
  it('extracts id, title, and date from ## headings', () => {
    const md = `## @reelkit/core@1.0.0 (2026-04-23)

### 🚀 Features

- first

## @reelkit/react@0.5.0 (2026-04-22)

- second
`;
    const entries = parseChangelog(md);
    expect(entries).toHaveLength(2);
    expect(entries[0].id).toBe('@reelkit/core@1.0.0');
    expect(entries[0].date).toBe('2026-04-23');
    expect(entries[0].title).toBe('@reelkit/core@1.0.0 (2026-04-23)');
    expect(entries[1].id).toBe('@reelkit/react@0.5.0');
  });

  it('renders bodyHtml via the shared markdown renderer', () => {
    const md = `## @reelkit/core@1.0.0 (2026-04-23)

- bullet

`;
    const [entry] = parseChangelog(md);
    expect(entry.bodyHtml).toContain('<ul');
    expect(entry.bodyHtml).toContain('<li>bullet</li>');
  });

  it('skips headings that lack a package@version id', () => {
    const md = `## Not a release header

## @reelkit/core@1.0.0 (2026-04-23)

- ok
`;
    const entries = parseChangelog(md);
    expect(entries).toHaveLength(1);
    expect(entries[0].id).toBe('@reelkit/core@1.0.0');
  });

  it('returns empty list when no headings match', () => {
    expect(parseChangelog('')).toEqual([]);
    expect(parseChangelog('just prose\nno headings')).toEqual([]);
  });

  it('sets date to empty string when heading has no ISO date', () => {
    const [entry] = parseChangelog('## @reelkit/core@1.0.0\n\n- a\n');
    expect(entry.date).toBe('');
  });
});
