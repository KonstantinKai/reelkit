import { zhPageMeta } from '../../i18n/pageMeta';

export const meta = () =>
  zhPageMeta({
    path: '/privacy',
    title: '隐私政策 · ReelKit',
    description: 'ReelKit 文档站的隐私政策。法律文本以英文为准。',
  });

// The body stays in English on purpose — a translated privacy policy would
// be a second legal text to keep accurate, and only one of them can govern.
export { default } from '../Privacy';
