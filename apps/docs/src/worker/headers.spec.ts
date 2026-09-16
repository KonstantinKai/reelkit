import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const docsDir = join(import.meta.dirname, '../..');
const read = (path: string) => readFileSync(join(docsDir, path), 'utf8');

// Cloudflare compresses nothing that carries `no-transform`, so pages travel
// compressed only while no rule sends it. Accepting that means accepting the
// zone's bot protection script, and the privacy page has to name its cookie.
describe('response headers', () => {
  it('never tell Cloudflare to leave a response untransformed', () => {
    const rules = read('public/_headers')
      .split('\n')
      .filter((line) => !line.trimStart().startsWith('#'));
    expect(rules.join('\n')).not.toContain('no-transform');
  });

  it('come with a privacy page that names the bot protection cookie', () => {
    expect(read('src/pages/Privacy.tsx')).toContain('cf_clearance');
  });
});
