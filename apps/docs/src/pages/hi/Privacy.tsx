import { localePageMeta } from '../../i18n/pageMeta';

export const meta = () =>
  localePageMeta('hi', {
    path: '/privacy',
    title: 'निजता नीति · ReelKit',
    description:
      'ReelKit डॉक्स साइट की निजता नीति। कानूनी पाठ अंग्रेज़ी में ही रहता है।',
  });

// The body stays in English on purpose — translated a privacy policy would
// be a second legal text to keep accurate, and only one of them can govern.
export { default } from '../Privacy';
