import { localePageMeta } from '../../i18n/pageMeta';

export const meta = () =>
  localePageMeta('de', {
    path: '/privacy',
    title: 'Datenschutzerklärung · ReelKit',
    description:
      'Datenschutzerklärung der Dokumentationsseite von ReelKit. Der Rechtstext bleibt auf Englisch.',
  });

// The body stays in English on purpose — a translated privacy policy would
// be a second legal text to keep accurate, and only one of them can govern.
export { default } from '../Privacy';
