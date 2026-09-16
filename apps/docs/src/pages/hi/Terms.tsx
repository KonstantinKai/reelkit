import { localePageMeta } from '../../i18n/pageMeta';

export const meta = () =>
  localePageMeta('hi', {
    path: '/terms',
    title: 'उपयोग की शर्तें · ReelKit',
    description:
      'ReelKit डॉक्स साइट के उपयोग की शर्तें। कानूनी पाठ अंग्रेज़ी में ही रहता है।',
  });

// The body stays in English on purpose — translated terms of service would
// be a second legal text to keep accurate, and only one of them can govern.
export { default } from '../Terms';
