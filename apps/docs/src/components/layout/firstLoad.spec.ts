import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const srcDir = join(import.meta.dirname, '../..');
const read = (path: string) => readFileSync(join(srcDir, path), 'utf8');

// Every docs page loads the header, the sidebar and the what's-new dialog.
// A static import in any of them puts its target in every page's first load,
// so the heavy parts — the search index and the release notes — are loaded
// on demand, and these checks keep them that way.
describe('first page load', () => {
  it('loads the command palette and its search index on demand', () => {
    const header = read('components/layout/Header.tsx');
    expect(header).not.toMatch(/^import CommandPalette/m);
    expect(header).toContain("import('../CommandPalette')");
    expect(read('components/layout/Sidebar.tsx')).not.toContain(
      "from '../../data/searchData'",
    );
  });

  it('loads the release notes on demand', () => {
    for (const file of [
      'components/WhatsNewDialog.tsx',
      'components/layout/Sidebar.tsx',
    ]) {
      const source = read(file);
      expect(source, file).not.toMatch(/^import [^;]*CHANGELOG\.md\?raw/m);
      expect(source, file).not.toMatch(/^import \{[^}]*parseChangelog[^}]*\}/m);
    }
    expect(read('utils/loadChangelog.ts')).toContain(
      "import('../../../../CHANGELOG.md?raw')",
    );
  });
});
