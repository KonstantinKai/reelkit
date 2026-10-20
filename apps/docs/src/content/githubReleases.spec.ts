import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// CI runs this script on every release commit, and a wrong release is public
// the moment it is created. The script lives with the other repo scripts,
// outside any project.
// eslint-disable-next-line @nx/enforce-module-boundaries
const script = join(
  import.meta.dirname,
  '../../../../scripts/github-releases.mjs',
);

interface PlannedRelease {
  tag: string;
  notes: string;
  latest: boolean;
}

const entry = (name: string, date: string, body = `body for ${name}`) =>
  `## @reelkit/${name} (${date})\n\n${body}\n\n`;

const published = [
  entry('react-stories-player@0.6.2', '2026-09-25'),
  '## Documentation (2026-09-18)\n\nsite notes\n\n',
  entry('core@0.8.2', '2026-09-18'),
].join('');

function plan(head: string): PlannedRelease[] | string {
  const dir = mkdtempSync(join(tmpdir(), 'rk-releases-'));
  const baseFile = join(dir, 'base.md');
  const headFile = join(dir, 'head.md');
  writeFileSync(baseFile, published, 'utf8');
  writeFileSync(headFile, head, 'utf8');
  const output = execFileSync(
    'node',
    [script, `--base-file=${baseFile}`, `--head-file=${headFile}`, '--dry-run'],
    { encoding: 'utf8', stdio: 'pipe' },
  );
  return output.startsWith('[') ? JSON.parse(output) : output.trim();
}

describe('github releases from the changelog', () => {
  const release = [
    entry(
      'react-lightbox@0.7.0',
      '2026-10-15',
      '### 🚀 Features\n\n- slideshow',
    ),
    entry('core@0.9.0', '2026-10-15', '### 🚀 Features\n\n- timer'),
    published,
  ].join('');

  it('releases only the entries the release commit added, in changelog order', () => {
    expect((plan(release) as PlannedRelease[]).map((r) => r.tag)).toEqual([
      '@reelkit/react-lightbox@0.7.0',
      '@reelkit/core@0.9.0',
    ]);
  });

  // The changelog sort puts the release's lead capability first, so that is
  // the release the repository page should show.
  it('marks the first new entry as the latest release', () => {
    expect((plan(release) as PlannedRelease[]).map((r) => r.latest)).toEqual([
      true,
      false,
    ]);
  });

  it('uses the entry without its heading as the notes', () => {
    expect((plan(release) as PlannedRelease[])[0].notes).toBe(
      '### 🚀 Features\n\n- slideshow\n',
    );
  });

  it('skips dated documentation entries, which name no package', () => {
    const tags = (
      plan(
        `## Documentation (2026-10-16)\n\nsite notes\n\n${release}`,
      ) as PlannedRelease[]
    ).map((r) => r.tag);

    expect(tags).not.toContainEqual(expect.stringContaining('Documentation'));
    expect(tags).toHaveLength(2);
  });

  it('creates nothing when no entry was added', () => {
    expect(plan(published)).toBe('github-releases: no new changelog entries');
  });
});
