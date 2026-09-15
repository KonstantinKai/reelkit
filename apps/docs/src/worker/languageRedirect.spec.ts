import { describe, expect, it, vi } from 'vitest';
import worker, { type Env } from './index';

const browser =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';

const env = (): Env => ({
  ASSETS: {
    fetch: vi.fn(
      async () =>
        new Response('<html>page as built</html>', {
          headers: { 'Content-Type': 'text/html', Vary: 'Accept-Encoding' },
        }),
    ),
  },
});

const get = (path: string, headers: Record<string, string> = {}) =>
  new Request(`https://reelkit.dev${path}`, {
    headers: { 'User-Agent': browser, ...headers },
  });

describe('language redirect at the edge', () => {
  it('sends a reader to their language with a temporary, uncached redirect', async () => {
    const bindings = env();
    const response = await worker.fetch(
      get('/docs/ssr?framework=vue', { 'Accept-Language': 'uk-UA,uk;q=0.9' }),
      bindings,
    );
    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('/uk/docs/ssr?framework=vue');
    expect(response.headers.get('Vary')).toBe('Accept-Language, Cookie');
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(bindings.ASSETS.fetch).not.toHaveBeenCalled();
  });

  // A redirect that stored its guess would keep a reader in the wrong
  // language until they found the switcher and the cookie it writes.
  it('sets no cookie on the redirect', async () => {
    const response = await worker.fetch(
      get('/', { 'Accept-Language': 'zh-CN' }),
      env(),
    );
    expect(response.status).toBe(302);
    expect(response.headers.get('Set-Cookie')).toBe(null);
  });

  it('serves the English page, marked as varying by language, when no redirect applies', async () => {
    const bindings = env();
    const response = await worker.fetch(
      get('/docs/ssr', { 'Accept-Language': 'en-US', Cookie: 'rk-locale=en' }),
      bindings,
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('<html>page as built</html>');
    expect(response.headers.get('Vary')).toBe(
      'Accept-Encoding, Accept-Language, Cookie',
    );
    expect(response.headers.get('Content-Type')).toBe('text/html');
  });

  it('never redirects a request that is not a page read', async () => {
    const bindings = env();
    const response = await worker.fetch(
      new Request('https://reelkit.dev/docs/ssr', {
        method: 'POST',
        headers: { 'User-Agent': browser, 'Accept-Language': 'uk' },
      }),
      bindings,
    );
    expect(response.status).toBe(200);
  });

  it('never redirects a prefixed page, whatever the browser prefers', async () => {
    const response = await worker.fetch(
      get('/uk/docs/ssr', { 'Accept-Language': 'zh-CN' }),
      env(),
    );
    expect(response.status).toBe(200);
  });
});
