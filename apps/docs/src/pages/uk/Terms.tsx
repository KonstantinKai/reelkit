import { ukPageMeta } from '../../i18n/pageMeta';

export const meta = () =>
  ukPageMeta({
    path: '/terms',
    title: 'Умови користування · ReelKit',
    description:
      'Умови користування сайтом документації ReelKit. Юридичний текст лишається англійською.',
  });

// The body stays in English on purpose — translated terms of service would
// be a second legal text to keep accurate, and only one of them can govern.
export { default } from '../Terms';
