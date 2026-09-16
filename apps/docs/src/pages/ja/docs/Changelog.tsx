import { localePageMeta } from '../../../i18n/pageMeta';

export const meta = () =>
  localePageMeta('ja', {
    path: '/docs/changelog',
    title: '変更履歴 · ReelKit',
    description:
      'ReelKit のすべてのパッケージのリリース履歴です。本文はリリースの手順で生成されるため、英語のままです。',
  });

// The body stays in English on purpose — it is generated from the release
// notes, so there is nothing here for a translator to own.
export { default } from '../../docs/Changelog';
