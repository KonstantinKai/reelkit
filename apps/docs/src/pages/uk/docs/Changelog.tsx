import { ukPageMeta } from '../../../i18n/pageMeta';

export const meta = () =>
  ukPageMeta({
    path: '/docs/changelog',
    title: 'Журнал змін · ReelKit',
    description:
      'Історія релізів усіх пакетів ReelKit. Текст генерується процесом випуску й лишається англійською.',
  });

// The body stays in English on purpose — it is generated from the release
// notes, so there is nothing here for a translator to own.
export { default } from '../../docs/Changelog';
