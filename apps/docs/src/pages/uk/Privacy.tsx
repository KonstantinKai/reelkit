import { ukPageMeta } from '../../i18n/pageMeta';

export const meta = () =>
  ukPageMeta({
    path: '/privacy',
    title: 'Політика конфіденційності · ReelKit',
    description:
      'Політика конфіденційності сайту документації ReelKit. Юридичний текст лишається англійською.',
  });

// The body stays in English on purpose — translated a privacy policy would
// be a second legal text to keep accurate, and only one of them can govern.
export { default } from '../Privacy';
