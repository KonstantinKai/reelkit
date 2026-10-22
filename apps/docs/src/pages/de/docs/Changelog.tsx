import { localePageMeta } from '../../../i18n/pageMeta';

export const meta = () =>
  localePageMeta('de', {
    path: '/docs/changelog',
    title: 'Änderungsprotokoll · ReelKit',
    description:
      'Änderungsprotokoll aller Pakete von ReelKit. Der Text entsteht beim Veröffentlichen der Versionen und bleibt deshalb auf Englisch.',
  });

// The body stays in English on purpose — it is generated from the release
// notes, so there is nothing here for a translator to own.
export { default } from '../../docs/Changelog';
