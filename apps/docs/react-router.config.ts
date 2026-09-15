import type { Config } from '@react-router/dev/config';
import { prerenderPaths } from './src/content/sitePages';

export default {
  ssr: false,
  // Every page of the manifest in every locale, so no page is left to the
  // single-page fallback, whether the sitemap lists it or not.
  prerender: prerenderPaths(),
  appDirectory: 'src',
} satisfies Config;
