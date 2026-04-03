interface Env {
  BUCKET: R2Bucket;
  ALLOWED_ORIGINS: string;
  DEV_TOKEN: string;
  STACKBLITZ_TOKEN: string;
}

const CACHE_CONTROL = 'public, max-age=31536000, immutable';

function parseRange(header: string): R2Range | undefined {
  const match = header.match(/bytes=(\d+)-(\d*)/);
  if (!match) return undefined;

  const offset = parseInt(match[1], 10);
  if (match[2]) {
    return { offset, length: parseInt(match[2], 10) - offset + 1 };
  }
  return { offset };
}

function isAllowed(request: Request, env: Env): boolean {
  const origin = request.headers.get('Origin') || '';
  const referer = request.headers.get('Referer') || '';
  const source = origin || referer;

  if (!source) return false;

  try {
    const url = new URL(source);
    const hostname = url.hostname;

    if (hostname === 'reelkit.dev' || hostname.endsWith('.reelkit.dev')) {
      return true;
    }

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const token = request.headers.get('X-RK-Token');
      return token === env.DEV_TOKEN;
    }

    if (
      hostname.endsWith('.stackblitz.io') ||
      hostname.endsWith('.webcontainer.io')
    ) {
      const token = request.headers.get('X-RK-Token');
      return token === env.STACKBLITZ_TOKEN;
    }

    return false;
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Range, X-RK-Token',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    if (!isAllowed(request, env)) {
      return new Response('Forbidden', { status: 403 });
    }

    const url = new URL(request.url);
    const key = url.pathname.slice(1);

    if (!key) {
      return new Response('Not Found', { status: 404 });
    }

    const rangeHeader = request.headers.get('Range');
    const object = await env.BUCKET.get(key, {
      range: rangeHeader ? parseRange(rangeHeader) : undefined,
    });

    if (!object) {
      return new Response('Not Found', { status: 404 });
    }

    const headers = new Headers();
    headers.set(
      'Content-Type',
      object.httpMetadata?.contentType || 'application/octet-stream',
    );
    headers.set('Cache-Control', CACHE_CONTROL);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Accept-Ranges', 'bytes');
    headers.set('ETag', object.httpEtag);

    if (object.range) {
      const r = object.range as { offset: number; length: number };
      headers.set(
        'Content-Range',
        `bytes ${r.offset}-${r.offset + r.length - 1}/${object.size}`,
      );
      headers.set('Content-Length', String(r.length));
      return new Response(object.body, { status: 206, headers });
    }

    headers.set('Content-Length', String(object.size));
    return new Response(object.body, { headers });
  },
} satisfies ExportedHandler<Env>;
