import { localePageMeta } from '../../i18n/pageMeta';

export const meta = () =>
  localePageMeta('pt', {
    path: '/privacy',
    title: 'Política de privacidade · ReelKit',
    description:
      'Política de privacidade do site de documentação do ReelKit. O texto jurídico permanece em inglês.',
  });

// The body stays in English on purpose — translated a privacy policy would
// be a second legal text to keep accurate, and only one of them can govern.
export { default } from '../Privacy';
