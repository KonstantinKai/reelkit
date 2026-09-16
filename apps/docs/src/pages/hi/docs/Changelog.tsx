import { localePageMeta } from '../../../i18n/pageMeta';

export const meta = () =>
  localePageMeta('hi', {
    path: '/docs/changelog',
    title: 'बदलावों की सूची · ReelKit',
    description:
      'ReelKit के सभी पैकेज का रिलीज़ इतिहास। यह पाठ रिलीज़ की प्रक्रिया से बनता है, इसलिए अंग्रेज़ी में ही रहता है।',
  });

// The body stays in English on purpose — it is generated from the release
// notes, so there is nothing here for a translator to own.
export { default } from '../../docs/Changelog';
