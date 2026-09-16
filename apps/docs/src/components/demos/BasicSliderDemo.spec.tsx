import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { glob } from 'node:fs/promises';
import { BasicSliderDemo, heroSlidePreloadLinks } from './BasicSliderDemo';
import { kLocales } from '../../i18n/locale';

const appDir = join(import.meta.dirname, '../..');

const imagesIn = (html: string) => html.match(/<img[^>]*>/g) ?? [];

async function filesUnder(pattern: string) {
  const found: string[] = [];
  for await (const entry of glob(pattern, { cwd: appDir })) found.push(entry);
  return found.sort();
}

afterEach(() => {
  vi.restoreAllMocks();
});

// The server render is what the prerendered HTML carries, so it is where the
// browser has to find the home page's largest image.
describe('basic slider demo as prerendered', () => {
  it('ships the first home slide as an image fetched early', () => {
    const errors = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const images = imagesIn(renderToString(<BasicSliderDemo priority />));
    expect(images).toHaveLength(1);
    const [image] = images;
    expect(image).toContain('slide-1');
    expect(image).toContain('.webp');
    expect(image).toContain('fetchpriority="high"');
    expect(image).toMatch(/width="\d+"/);
    expect(image).toMatch(/height="\d+"/);
    expect(image).not.toContain('loading="lazy"');
    expect(errors).not.toHaveBeenCalled();
  });

  // The React guide shows the demo in the middle of a long page, in a wide
  // preview the portrait home slides would not fill.
  it('keeps the CDN image loaded lazily everywhere else', () => {
    const images = imagesIn(renderToString(<BasicSliderDemo />));
    expect(images).toHaveLength(1);
    const [image] = images;
    expect(image).toContain('cdn.reelkit.dev');
    expect(image).toContain('loading="lazy"');
    expect(image).not.toContain('fetchpriority');
  });

  it('preloads the same image the first slide shows', () => {
    const [image = ''] = imagesIn(renderToString(<BasicSliderDemo priority />));
    const src = image.match(/src="([^"]+)"/)?.[1];
    expect(heroSlidePreloadLinks()).toEqual([
      { rel: 'preload', as: 'image', href: src, fetchpriority: 'high' },
    ]);
  });
});

describe('home pages', () => {
  it('preload the hero slide and give the demo priority in every locale', async () => {
    const homes = await filesUnder('pages/{,*/}Home.tsx');
    expect(homes).toHaveLength(kLocales.length);
    for (const home of homes) {
      const source = readFileSync(join(appDir, home), 'utf8');
      expect(source, home).toContain(
        'export const links = heroSlidePreloadLinks;',
      );
      expect(source, home).toContain('<BasicSliderDemo priority />');
    }
  });

  it('leave the demo on the React guide without priority', async () => {
    const guides = await filesUnder('content/*/docs/react/guide.mdx');
    expect(guides.length).toBeGreaterThan(0);
    for (const guide of guides) {
      const source = readFileSync(join(appDir, guide), 'utf8');
      expect(source, guide).toContain('<BasicSliderDemo />');
    }
  });
});
