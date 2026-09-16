import { localePageMeta } from '../../i18n/pageMeta';

export const meta = () =>
  localePageMeta('pt', {
    path: '/terms',
    title: 'Termos de uso · ReelKit',
    description:
      'Termos de uso do site de documentação do ReelKit. O texto jurídico permanece em inglês.',
  });

// The body stays in English on purpose — translated terms of service would
// be a second legal text to keep accurate, and only one of them can govern.
export { default } from '../Terms';
