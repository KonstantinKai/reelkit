import { localePageMeta } from '../../i18n/pageMeta';

export const meta = () =>
  localePageMeta('ja', {
    path: '/privacy',
    title: 'プライバシーポリシー · ReelKit',
    description:
      'ReelKit ドキュメントサイトのプライバシーポリシーです。法的な本文は英語のままです。',
  });

// The body stays in English on purpose — translated a privacy policy would
// be a second legal text to keep accurate, and only one of them can govern.
export { default } from '../Privacy';
