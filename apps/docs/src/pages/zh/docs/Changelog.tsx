import { zhPageMeta } from '../../../i18n/pageMeta';

export const meta = () =>
  zhPageMeta({
    path: '/docs/changelog',
    title: '更新日志 · ReelKit',
    description: 'ReelKit 各个包的版本发布记录。正文由发布流程生成，保持英文。',
  });

// The body stays in English on purpose — it is generated from the release
// notes, so there is nothing here for a translator to own.
export { default } from '../../docs/Changelog';
