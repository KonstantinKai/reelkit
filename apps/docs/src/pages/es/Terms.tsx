import { localePageMeta } from '../../i18n/pageMeta';

export const meta = () =>
  localePageMeta('es', {
    path: '/terms',
    title: 'Condiciones de uso · ReelKit',
    description:
      'Condiciones de uso del sitio de documentación de ReelKit. El texto legal se mantiene en inglés.',
  });

// The body stays in English on purpose — translated terms of service would
// be a second legal text to keep accurate, and only one of them can govern.
export { default } from '../Terms';
