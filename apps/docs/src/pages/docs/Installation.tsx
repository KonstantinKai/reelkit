import { CodeBlock } from '../../components/ui/CodeBlock';
import { Check } from 'lucide-react';

const packages = [
  {
    name: '@reelkit/react',
    desc: 'React components',
    useCase: 'React 18+ applications',
  },
  {
    name: '@reelkit/react-reel-player',
    desc: 'Full-screen vertical reel player',
    useCase: 'Instagram/TikTok style player',
  },
  {
    name: '@reelkit/react-lightbox',
    desc: 'Image gallery lightbox',
    useCase: 'Full-screen image preview',
  },
  {
    name: '@reelkit/core',
    desc: 'Framework-agnostic core',
    useCase: 'Custom integrations',
  },
  {
    name: '@reelkit/vue',
    desc: 'Vue composables and components',
    useCase: 'Vue 3 applications',
    comingSoon: true,
  },
];

const bundleSizes = [
  {
    name: '@reelkit/core',
    js: '14.9 kB',
    gzip: '4.9 kB',
    css: '-',
    cssGzip: '-',
  },
  {
    name: '@reelkit/react',
    js: '9.1 kB',
    gzip: '3.1 kB',
    css: '-',
    cssGzip: '-',
  },
  {
    name: '@reelkit/react-reel-player',
    js: '13.5 kB',
    gzip: '3.9 kB',
    css: '1.8 kB',
    cssGzip: '0.7 kB',
  },
  {
    name: '@reelkit/react-lightbox',
    js: '8.9 kB',
    gzip: '2.8 kB',
    css: '3.1 kB',
    cssGzip: '0.8 kB',
  },
];

const comparison = [
  {
    name: 'ReelKit (core + react)',
    gzip: '8.0 kB',
    virtualization: true,
    notes: 'Zero dependencies',
  },
  {
    name: 'Swiper',
    gzip: '~25 kB',
    virtualization: false,
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
          reelkit is available as multiple packages. Choose based on your
          framework:
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
              {packages.map((pkg, i) => (
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
                    {lib.virtualization ? (
                      <Check className="w-5 h-5 text-green-500" />
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
        <CodeBlock code="npm install @reelkit/react" language="bash" />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">yarn</h2>
        <CodeBlock code="yarn add @reelkit/react" language="bash" />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">pnpm</h2>
        <CodeBlock code="pnpm add @reelkit/react" language="bash" />
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
                <code className="text-sm font-mono">@reelkit/core</code>
              </li>
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
                <code className="text-sm font-mono">react</code> {'>= 18.0.0'}
              </li>
              <li>
                <code className="text-sm font-mono">react-dom</code>{' '}
                {'>= 18.0.0'}
              </li>
              <li>
                <code className="text-sm font-mono">@reelkit/core</code>
              </li>
              <li>
                <code className="text-sm font-mono">@reelkit/react</code>
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
                <code className="text-sm font-mono">react</code> {'>= 18.0.0'}
              </li>
              <li>
                <code className="text-sm font-mono">react-dom</code>{' '}
                {'>= 18.0.0'}
              </li>
              <li>
                <code className="text-sm font-mono">@reelkit/core</code>
              </li>
              <li>
                <code className="text-sm font-mono">@reelkit/react</code>
              </li>
              <li>
                <code className="text-sm font-mono">lucide-react</code>{' '}
                {'>= 0.400.0'}
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">TypeScript</h2>
        <p className="text-slate-600 dark:text-slate-400">
          All packages include TypeScript type definitions out of the box. No
          additional {'@types'} packages are needed.
        </p>
      </section>

      <section>
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
    </div>
  );
}
