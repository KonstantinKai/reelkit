import { zhPageMeta } from '../../i18n/pageMeta';

export const meta = () =>
  zhPageMeta({
    path: '/terms',
    title: '服务条款 · ReelKit',
    description: 'ReelKit 文档站的服务条款。法律文本以英文为准。',
  });

// The body stays in English on purpose — translated terms of service would
// be a second legal text to keep accurate, and only one of them can govern.
export { default } from '../Terms';
