/**
 * Edge script for the docs site on Cloudflare Workers. The build is served as
 * static assets, which answer almost every request without this script. It
 * runs only for the English page routes listed under
 * `assets.run_worker_first` in `wrangler.jsonc`, and for those it serves the
 * page as built unless the language redirect answers first.
 */
import { languageRedirect, varyByLanguage } from './languageRedirect';

/** The static assets binding, reduced to the one method this script calls. */
export interface AssetsBinding {
  fetch(request: Request): Promise<Response>;
}

export interface Env {
  ASSETS: AssetsBinding;
}

/**
 * Decides a page request. A response is sent as it is; no response means the
 * page is served as built.
 */
export type PageRoute = (
  request: Request,
  env: Env,
) => Response | null | Promise<Response | null>;

const servePageAsBuilt: PageRoute = () => null;

/**
 * Answers a page request. A route that throws must never take the page down
 * with it, so any failure falls back to the page as built.
 */
export async function handlePage(
  request: Request,
  env: Env,
  route: PageRoute = servePageAsBuilt,
): Promise<Response> {
  try {
    const response = await route(request, env);
    if (response) return response;
  } catch (error) {
    console.error('docs page route failed, serving the page as built', error);
  }
  return env.ASSETS.fetch(request);
}

export default {
  fetch: async (request: Request, env: Env) =>
    varyByLanguage(await handlePage(request, env, languageRedirect)),
};
