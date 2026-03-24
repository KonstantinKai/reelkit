import { Link } from 'react-router-dom';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { Callout } from '../../components/ui/Callout';
import { Check } from 'lucide-react';

const packages: {
  name: string;

  desc: string;

  useCase: string;

  comingSoon?: boolean;
}[] = [
  {
    name: '@reelkit/core',
    desc: 'Framework-agnostic core',
    useCase: 'Custom integrations',
  },
  {
    name: '@reelkit/react',
    desc: 'React components',
    useCase: 'React 18+ applications',
  },
  {
    name: '@reelkit/react-reel-player',
    desc: 'Full-screen vertical reel player',
    useCase: 'Instagram/TikTok style player (React)',
  },
  {
    name: '@reelkit/react-lightbox',
    desc: 'Image gallery lightbox',
    useCase: 'Full-screen image preview (React)',
  },
  {
    name: '@reelkit/angular',
    desc: 'Angular standalone components',
    useCase: 'Angular 17+ applications',
  },
  {
    name: '@reelkit/angular-reel-player',
    desc: 'Full-screen vertical reel player',
    useCase: 'Instagram/TikTok style player (Angular)',
  },
  {
    name: '@reelkit/angular-lightbox',
    desc: 'Image gallery lightbox',
    useCase: 'Full-screen image preview (Angular)',
  },
];

const bundleSizes = [
  {
    name: '@reelkit/core',
    js: '9.9 kB',
    gzip: '4.1 kB',
    css: '-',
    cssGzip: '-',
  },
  {
    name: '@reelkit/react',
    js: '7.3 kB',
    gzip: '2.9 kB',
    css: '-',
    cssGzip: '-',
  },
  {
    name: '@reelkit/react-reel-player',
    js: '11.2 kB',
    gzip: '3.7 kB',
    css: '2.6 kB',
    cssGzip: '0.9 kB',
  },
  {
    name: '@reelkit/react-lightbox',
    js: '9.4 kB',
    gzip: '3.2 kB',
    css: '4.1 kB',
    cssGzip: '1.0 kB',
  },
  {
    name: '@reelkit/angular',
    js: '55.5 kB',
    gzip: '12.2 kB',
    css: '-',
    cssGzip: '-',
  },
  {
    name: '@reelkit/angular-reel-player',
    js: '93.6 kB',
    gzip: '15.8 kB',
    css: '-',
    cssGzip: '-',
  },
  {
    name: '@reelkit/angular-lightbox',
    js: '96.2 kB',
    gzip: '18.0 kB',
    css: '-',
    cssGzip: '-',
  },
];

const comparison = [
  {
    name: 'ReelKit (core + react)',
    gzip: '7.0 kB',
    virtualization: true,
    notes: 'Zero dependencies',
  },
  {
    name: 'ReelKit (core + angular)',
    gzip: '16.3 kB',
    virtualization: true,
    notes: 'Zero dependencies',
  },
  {
    name: 'Swiper',
    gzip: '~25 kB',
    virtualization: 'plugin',
    notes: 'Full bundle; tree-shakeable',
  },
  {
    name: 'Embla Carousel',
    gzip: '~7 kB',
    virtualization: false,
    notes: 'Lightweight, plugin-based',
  },
  {
    name: 'keen-slider',
    gzip: '~6 kB',
    virtualization: false,
    notes: 'Zero dependencies',
  },
];

export default function Installation() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Installation</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Install reelkit packages and configure your project.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Package Options</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Install only what you use:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Package</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
                <th className="text-left py-3 px-4 font-semibold">Use Case</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <tr
                  key={pkg.name}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4">
                    <code className="text-sm font-mono text-primary-600 dark:text-primary-400">
                      {pkg.name}
                    </code>
                    {pkg.comingSoon && (
                      <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                        Coming Soon
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {pkg.desc}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {pkg.useCase}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Bundle Sizes</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          All packages are optimized for minimal bundle impact:
        </p>

        <div className="overflow-x-auto mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Package</th>
                <th className="text-left py-3 px-4 font-semibold">JS</th>
                <th className="text-left py-3 px-4 font-semibold">JS (gzip)</th>
                <th className="text-left py-3 px-4 font-semibold">CSS</th>
                <th className="text-left py-3 px-4 font-semibold">
                  CSS (gzip)
                </th>
              </tr>
            </thead>
            <tbody>
              {bundleSizes.map((pkg) => (
                <tr
                  key={pkg.name}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {pkg.name}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {pkg.js}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {pkg.gzip}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {pkg.css}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {pkg.cssGzip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold mb-3">
          Comparison with Other Libraries
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          ReelKit renders only <strong>3 slides to DOM</strong> at any time,
          efficiently handling 10,000+ items. Most other carousel libraries
          render all slides, which can cause performance issues with large
          lists.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Library</th>
                <th className="text-left py-3 px-4 font-semibold">JS (gzip)</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Virtualization
                </th>
                <th className="text-left py-3 px-4 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((lib) => (
                <tr
                  key={lib.name}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-semibold">{lib.name}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {lib.gzip}
                  </td>
                  <td className="py-3 px-4">
                    {lib.virtualization === true ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : lib.virtualization === 'plugin' ? (
                      <span className="text-yellow-600 dark:text-yellow-400 text-sm">
                        Plugin
                      </span>
                    ) : (
                      <span className="text-red-500">✗</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {lib.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">npm</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-2">React:</p>
        <CodeBlock code="npm install @reelkit/react" language="bash" />
        <p className="text-slate-600 dark:text-slate-400 mb-2 mt-4">Angular:</p>
        <CodeBlock code="npm install @reelkit/angular" language="bash" />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">yarn</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-2">React:</p>
        <CodeBlock code="yarn add @reelkit/react" language="bash" />
        <p className="text-slate-600 dark:text-slate-400 mb-2 mt-4">Angular:</p>
        <CodeBlock code="yarn add @reelkit/angular" language="bash" />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">pnpm</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-2">React:</p>
        <CodeBlock code="pnpm add @reelkit/react" language="bash" />
        <p className="text-slate-600 dark:text-slate-400 mb-2 mt-4">Angular:</p>
        <CodeBlock code="pnpm add @reelkit/angular" language="bash" />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Peer Dependencies</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Framework packages have peer dependencies that should already be in
          your project:
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">@reelkit/react</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
              <li>
                <code className="text-sm font-mono">react</code> {'>= 17.0.0'}
              </li>
              <li>
                <code className="text-sm font-mono">react-dom</code>{' '}
                {'>= 17.0.0'}
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">
              @reelkit/react-reel-player
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
              <li>
                <code className="text-sm font-mono">@reelkit/react</code>
              </li>
              <li>
                <code className="text-sm font-mono">react</code> {'>= 18.0.0'}
              </li>
              <li>
                <code className="text-sm font-mono">react-dom</code>{' '}
                {'>= 18.0.0'}
              </li>
              <li>
                <code className="text-sm font-mono">lucide-react</code>{' '}
                {'>= 0.400.0'}
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">
              @reelkit/react-lightbox
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
              <li>
                <code className="text-sm font-mono">@reelkit/react</code>
              </li>
              <li>
                <code className="text-sm font-mono">react</code> {'>= 18.0.0'}
              </li>
              <li>
                <code className="text-sm font-mono">react-dom</code>{' '}
                {'>= 18.0.0'}
              </li>
              <li>
                <code className="text-sm font-mono">lucide-react</code>{' '}
                {'>= 0.400.0'}
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">@reelkit/angular</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
              <li>
                <code className="text-sm font-mono">@angular/core</code>{' '}
                {'>= 17.0.0'}
              </li>
              <li>
                <code className="text-sm font-mono">@angular/common</code>{' '}
                {'>= 17.0.0'}
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">
              @reelkit/angular-reel-player
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
              <li>
                <code className="text-sm font-mono">@reelkit/angular</code>
              </li>
              <li>
                <code className="text-sm font-mono">@angular/core</code>{' '}
                {'>= 17.0.0'}
              </li>
              <li>
                <code className="text-sm font-mono">
                  @angular/platform-browser
                </code>{' '}
                {'>= 17.0.0'}
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">
              @reelkit/angular-lightbox
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
              <li>
                <code className="text-sm font-mono">@reelkit/angular</code>
              </li>
              <li>
                <code className="text-sm font-mono">@angular/core</code>{' '}
                {'>= 17.0.0'}
              </li>
              <li>
                <code className="text-sm font-mono">lucide-angular</code>{' '}
                {'>= 0.400.0'}
              </li>
            </ul>
          </div>
        </div>

        <Callout type="info" className="mt-4">
          <code className="text-sm font-mono">lucide-react</code> is only needed
          for the default control icons. If you provide your own controls via{' '}
          <code className="text-sm font-mono">renderControls</code>, you can
          skip installing it.
        </Callout>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">TypeScript</h2>
        <p className="text-slate-600 dark:text-slate-400">
          All packages ship with TypeScript type definitions. No additional{' '}
          {'@types'} packages needed.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Browser Support</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          reelkit supports all modern browsers:
        </p>
        <ul className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" /> Chrome/Edge 88+
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" /> Firefox 78+
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" /> Safari 14+
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" /> iOS Safari 14+
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" /> Android Chrome 88+
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
        <ul className="space-y-3">
          <li>
            <Link
              to="/docs/core/guide"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              Core Guide
            </Link>
            <span className="text-slate-500"> - framework-agnostic engine</span>
          </li>
          <li>
            <Link
              to="/docs/react/guide"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              React Guide
            </Link>
            <span className="text-slate-500">
              {' '}
              - live demos and virtualization
            </span>
          </li>
          <li>
            <Link
              to="/docs/angular/guide"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              Angular Guide
            </Link>
            <span className="text-slate-500">
              {' '}
              - signals-based Angular integration
            </span>
          </li>
          <li>
            <Link
              to="/docs/reel-player"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              React Reel Player
            </Link>
            <span className="text-slate-500">
              {' '}
              - TikTok/Reels-style video player
            </span>
          </li>
          <li>
            <Link
              to="/docs/lightbox"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              React Lightbox
            </Link>
            <span className="text-slate-500"> - image &amp; video gallery</span>
          </li>
          <li>
            <Link
              to="/docs/angular-reel-player"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              Angular Reel Player
            </Link>
            <span className="text-slate-500">
              {' '}
              - TikTok/Reels-style video player
            </span>
          </li>
          <li>
            <Link
              to="/docs/angular-lightbox"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              Angular Lightbox
            </Link>
            <span className="text-slate-500"> - image &amp; video gallery</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
