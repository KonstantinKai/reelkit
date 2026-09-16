import { localePageMeta } from '../../../i18n/pageMeta';

export const meta = () =>
  localePageMeta('pt', {
    path: '/docs/changelog',
    title: 'Histórico de versões · ReelKit',
    description:
      'Histórico de lançamentos de todos os pacotes do ReelKit. O texto é gerado pelo processo de publicação e permanece em inglês.',
  });

// The body stays in English on purpose — it is generated from the release
// notes, so there is nothing here for a translator to own.
export { default } from '../../docs/Changelog';
