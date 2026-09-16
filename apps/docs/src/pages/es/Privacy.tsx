import { localePageMeta } from '../../i18n/pageMeta';

export const meta = () =>
  localePageMeta('es', {
    path: '/privacy',
    title: 'Política de privacidad · ReelKit',
    description:
      'Política de privacidad del sitio de documentación de ReelKit. El texto legal se mantiene en inglés.',
  });

// The body stays in English on purpose — translated a privacy policy would
// be a second legal text to keep accurate, and only one of them can govern.
export { default } from '../Privacy';
