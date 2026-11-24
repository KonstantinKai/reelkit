import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { glob } from 'node:fs/promises';
import { HeroFilm, heroFilmPreloadLinks } from './HeroFilm';

const appDir = join(import.meta.dirname, '../..');

async function filesUnder(pattern: string) {
  const found: string[] = [];
  for await (const entry of glob(pattern, { cwd: appDir })) found.push(entry);
  return found.sort();
}

afterEach(() => {
  vi.restoreAllMocks();
});

// The server render is what the prerendered HTML carries, so the attributes a
// browser needs to start the film before hydration have to be in it.
describe('hero film as prerendered', () => {
  const html = renderToString(<HeroFilm label="Intro" />);

  it('autoplays muted and inline, the only way mobile browsers allow', () => {
    const [video = ''] = html.match(/<video[^>]*>/) ?? [];
    for (const attribute of ['autoplay', 'muted', 'loop', 'playsinline']) {
      expect(video).toContain(`${attribute}=""`);
    }
    expect(video).toContain('aria-label="Intro"');
  });

  it('offers the MP4 before the WebM, the smaller of the two', () => {
    const sources = [...html.matchAll(/<source src="([^"]+)" type="([^"]+)"/g)];
    expect(sources.map(([, , type]) => type)).toEqual([
      'video/mp4',
      'video/webm',
    ]);
    for (const [, src] of sources) expect(src).toContain('cdn.reelkit.dev');
  });

  it('preloads the same image the poster shows', () => {
    const poster = html.match(/poster="([^"]+)"/)?.[1];
    expect(heroFilmPreloadLinks()).toEqual([
      { rel: 'preload', as: 'image', href: poster, fetchpriority: 'high' },
    ]);
  });
});

describe('home page', () => {
  // One page serves every locale, so the hero preload is declared once and a
  // reader in any language gets it.
  it('preloads the film poster and shows the film in the hero', async () => {
    const homes = await filesUnder('pages/{,*/}Home.tsx');
    expect(homes).toHaveLength(1);
    const source = readFileSync(join(appDir, homes[0]), 'utf8');
    expect(source).toContain('export const links = heroFilmPreloadLinks;');
    expect(source).toContain('<HeroFilm label={home.hero.filmLabel} />');
  });
});
