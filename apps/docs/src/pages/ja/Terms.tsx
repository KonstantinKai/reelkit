import { localePageMeta } from '../../i18n/pageMeta';

export const meta = () =>
  localePageMeta('ja', {
    path: '/terms',
    title: '利用規約 · ReelKit',
    description:
      'ReelKit ドキュメントサイトの利用規約です。法的な本文は英語のままです。',
  });

// The body stays in English on purpose — translated terms of service would
// be a second legal text to keep accurate, and only one of them can govern.
export { default } from '../Terms';
