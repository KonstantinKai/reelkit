import { localePageMeta } from '../../i18n/pageMeta';

export const meta = () =>
  localePageMeta('de', {
    path: '/terms',
    title: 'Nutzungsbedingungen · ReelKit',
    description:
      'Nutzungsbedingungen der Dokumentationsseite von ReelKit. Der Rechtstext bleibt auf Englisch.',
  });

// The body stays in English on purpose — translated terms of service would
// be a second legal text to keep accurate, and only one of them can govern.
export { default } from '../Terms';
