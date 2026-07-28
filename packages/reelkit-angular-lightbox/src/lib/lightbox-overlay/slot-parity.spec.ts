import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The slot query list lives in two components: the gallery declares it, and
 * the url overlay declares it again so it can forward each template as an
 * input — a `contentChild` query does not reach through a wrapper's
 * `<ng-content>`.
 *
 * Two copies drift. A seventh slot added to one and not the other reads
 * exactly like a complete port, and the only symptom is a slot silently doing
 * nothing in url mode. There is no legitimate reason for the sets to differ,
 * so compare them directly.
 */
const slotQueriesOf = (file: string): string[] => {
  const source = readFileSync(join(__dirname, file), 'utf8');
  const names = [...source.matchAll(/contentChild\(\s*(RkLightbox\w+)/g)].map(
    (match) => match[1],
  );
  return [...new Set(names)].sort();
};

describe('lightbox slot parity', () => {
  it('queries the same slot directives in both overlays', () => {
    const gallery = slotQueriesOf('lightbox-overlay.component.ts');
    const url = slotQueriesOf('lightbox-url-overlay.component.ts');

    // Guards the comparison itself: an empty match would make it pass on
    // nothing, which is how a dead check looks from the outside.
    expect(gallery.length).toBeGreaterThan(0);
    expect(url).toEqual(gallery);
  });
});
