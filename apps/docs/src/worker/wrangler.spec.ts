import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';
import { kDefaultLocale, kLocales, localePrefix } from '../i18n/locale';
import { englishPagePaths } from '../content/sitePages';
import worker, { handlePage, type Env } from './index';

const configPath = join(import.meta.dirname, '../../wrangler.jsonc');
const parsed = ts.parseConfigFileTextToJson(
  configPath,
  readFileSync(configPath, 'utf8'),
);
const config = parsed.config as {
  main: string;
  assets: { binding: string; run_worker_first: string[] };
};

describe('edge script scope', () => {
  it('reads the wrangler config', () => {
    expect(parsed.error).toBeUndefined();
  });

  // The script runs only where it can matter, the English page routes. Every
  // other request stays a free static asset request, and one the Workers
  // quota can never turn into an error.
  it('runs for exactly the English page routes of the manifest', () => {
    expect(config.assets.run_worker_first).toEqual(englishPagePaths());
  });

  it('lists exact paths, within the platform limit', () => {
    const routes = config.assets.run_worker_first;
    expect(routes.length).toBeLessThanOrEqual(100);
    for (const route of routes) {
      expect(route, route).toMatch(/^\/[a-z0-9/-]*$/);
      expect(route === '/' || !route.endsWith('/'), route).toBe(true);
    }
  });

  it('never runs for a prefixed locale page', () => {
    const prefixes = kLocales
      .filter((locale) => locale !== kDefaultLocale)
      .map(localePrefix);
    for (const route of config.assets.run_worker_first) {
      for (const prefix of prefixes) {
        expect(route === prefix || route.startsWith(`${prefix}/`), route).toBe(
          false,
        );
      }
    }
  });

  it('points at this script and binds the assets it falls back to', () => {
    expect(config.main).toBe('src/worker/index.ts');
    expect(config.assets.binding).toBe('ASSETS');
  });
});

describe('edge script', () => {
  const page = new Response('<html>page as built</html>');
  const env = (): Env => ({
    ASSETS: { fetch: vi.fn(async () => page.clone()) },
  });
  const request = new Request('https://reelkit.dev/docs/ssr');

  it('serves the page as built when no route answers', async () => {
    const bindings = env();
    const response = await worker.fetch(request, bindings);
    expect(await response.text()).toBe('<html>page as built</html>');
    expect(bindings.ASSETS.fetch).toHaveBeenCalledWith(request);
  });

  it('sends the response a route returns', async () => {
    const bindings = env();
    const response = await handlePage(
      request,
      bindings,
      () => new Response(null, { status: 302, headers: { location: '/uk' } }),
    );
    expect(response.status).toBe(302);
    expect(bindings.ASSETS.fetch).not.toHaveBeenCalled();
  });

  // A bug in the edge code must cost the reader at most the feature it adds,
  // never the page they asked for.
  it('serves the page as built when a route throws', async () => {
    const bindings = env();
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const response = await handlePage(request, bindings, () => {
      throw new Error('broken route');
    });
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('<html>page as built</html>');
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });
});
