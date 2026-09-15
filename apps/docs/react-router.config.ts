import type { Config } from '@react-router/dev/config';
import { prerenderPaths } from './src/content/sitePages';

export default {
  ssr: false,
  // Every sitemap entry in every locale, from the page manifest — the same
  // list the emitted `sitemap.xml` carries, so a listed page is never left
  // to the single-page fallback.
  prerender: prerenderPaths(),
  appDirectory: 'src',
} satisfies Config;
