import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * React and Vue put an `<svg>` straight into a button, so the stylesheet's
 * `align-items: center` centres it. Angular renders `<lucide-angular>`, an
 * element the stylesheet has never heard of, and an unknown element with a
 * default `display: inline` blockifies unpredictably as a flex item — the
 * icon lands off centre. The two sibling Angular overlays each carry a rule
 * collapsing that wrapper; this package has to as well, for every box that
 * holds one.
 */
const libDir = join(__dirname, '..');

const readAll = (dir: string, match: RegExp): string[] => {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...readAll(path, match));
    else if (match.test(entry.name)) out.push(readFileSync(path, 'utf8'));
  }
  return out;
};

/** Classes whose element renders an icon wrapper directly inside it. */
const boxesHoldingAnIcon = (): string[] => {
  const found = new Set<string>();
  for (const source of readAll(libDir, /\.component\.ts$/)) {
    for (const match of source.matchAll(/<lucide-angular/g)) {
      const before = source.slice(0, match.index);
      const owner = [...before.matchAll(/class="(rk-stories-[a-z-]+)"/g)].pop();
      if (owner) found.add(owner[1]);
    }
  }
  return [...found].sort();
};

const stylesheets = () => readAll(join(libDir, 'styles'), /\.css$/).join('\n');

describe('icon centring', () => {
  it('collapses the icon wrapper in every box that holds one', () => {
    const boxes = boxesHoldingAnIcon();
    const css = stylesheets();

    // Guards the check itself: no boxes found would pass on nothing, which
    // is how a dead test looks from the outside.
    expect(boxes.length).toBeGreaterThan(0);

    for (const box of boxes) {
      expect(css).toContain(`.${box} > lucide-angular`);
    }
  });

  // A catch-all child selector also reshapes whatever else sits in the box,
  // such as the text beside the icon in the error panel.
  it('reaches the icon wrapper only, not every child of the box', () => {
    const css = stylesheets();

    for (const box of boxesHoldingAnIcon()) {
      expect(css).not.toContain(`.${box} > *`);
    }
  });
});
