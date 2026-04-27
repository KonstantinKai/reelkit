import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import { setCdnBase } from '@reelkit/example-data';
import { ThemeProvider } from './context/ThemeContext';
import './styles.css';

if (import.meta.env.DEV) setCdnBase('/cdn');

export const links = () => [
  { rel: 'canonical', href: 'https://reelkit.dev/' },
  { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '32x32',
    href: '/favicon-32x32.png',
  },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '16x16',
    href: '/favicon-16x16.png',
  },
  { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Code+Pro:wght@400;500&display=swap',
  },
];

export const meta = () => [
  { charSet: 'utf-8' },
  { title: 'ReelKit - Headless Virtualized Slider for React' },
  { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  {
    name: 'description',
    content:
      'A headless, virtualized, zero-dependency slider engine for React. Build TikTok/Instagram Reels-style vertical feeds with 60fps touch gestures, keyboard navigation, and only 3 DOM nodes.',
  },
  {
    name: 'keywords',
    content:
      'react slider, vertical slider, tiktok slider, reels slider, virtualized carousel, swipe component, touch gestures, headless ui, zero dependencies',
  },
  { property: 'og:type', content: 'website' },
  {
    property: 'og:title',
    content: 'ReelKit - Headless Virtualized Slider for React',
  },
  {
    property: 'og:description',
    content:
      'Zero-dependency, virtualized slider engine. Build TikTok/Reels-style feeds with 60fps gestures and only 3 DOM nodes.',
  },
  { property: 'og:url', content: 'https://reelkit.dev/' },
  { property: 'og:site_name', content: 'ReelKit' },
  { property: 'og:image', content: 'https://reelkit.dev/og-image.png' },
  { name: 'twitter:card', content: 'summary_large_image' },
  {
    name: 'twitter:title',
    content: 'ReelKit - Headless Virtualized Slider for React',
  },
  {
    name: 'twitter:description',
    content:
      'Zero-dependency, virtualized slider engine. Build TikTok/Reels-style feeds with 60fps gestures and only 3 DOM nodes.',
  },
  { name: 'twitter:image', content: 'https://reelkit.dev/og-image.png' },
];

const _kBootstrapScript = `(function () {
  try {
    var theme =
      localStorage.getItem('rk-docs:theme') ||
      localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
  try {
    var url = new URLSearchParams(window.location.search).get('framework');
    var stored = localStorage.getItem('rk-docs:framework') ||
      localStorage.getItem('reelkit-docs-framework');
    var fw = ['react', 'angular', 'vue'].indexOf(url) !== -1
      ? url
      : ['react', 'angular', 'vue'].indexOf(stored) !== -1
      ? stored
      : 'react';
    document.documentElement.setAttribute('data-rk-fw', fw);
  } catch (e) {
    document.documentElement.setAttribute('data-rk-fw', 'react');
  }
})();`;

const _kStructuredData = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'SoftwareSourceCode',
  name: 'ReelKit',
  description:
    'A headless, virtualized, zero-dependency slider engine for React. Build TikTok/Instagram Reels-style vertical feeds.',
  url: 'https://reelkit.dev',
  codeRepository: 'https://github.com/KonstantinKai/reelkit',
  programmingLanguage: 'TypeScript',
  runtimePlatform: 'React',
  license: 'https://opensource.org/licenses/MIT',
  author: {
    '@type': 'Person',
    name: 'Konstantin Kai',
    url: 'https://github.com/KonstantinKai',
  },
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
});

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-rk-fw="react" suppressHydrationWarning>
      <head>
        <Meta />
        <Links />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: _kStructuredData }}
        />
        <script dangerouslySetInnerHTML={{ __html: _kBootstrapScript }} />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return (
    <ThemeProvider>
      <Outlet />
    </ThemeProvider>
  );
}
