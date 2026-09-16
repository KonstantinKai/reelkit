import { localePageMeta } from '../../../i18n/pageMeta';

export const meta = () =>
  localePageMeta('es', {
    path: '/docs/changelog',
    title: 'Historial de versiones · ReelKit',
    description:
      'Historial de versiones de todos los paquetes de ReelKit. El texto se genera con el proceso de publicación, así que se mantiene en inglés.',
  });

// The body stays in English on purpose — it is generated from the release
// notes, so there is nothing here for a translator to own.
export { default } from '../../docs/Changelog';
