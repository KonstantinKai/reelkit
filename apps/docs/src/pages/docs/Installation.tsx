import { Observe } from '@reelkit/react';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { Callout } from '../../components/ui/Callout';
import { Check } from 'lucide-react';
import { NextSteps } from '../../components/NextSteps';
import {
  frameworkSignal,
  renderFramework,
  type Framework,
} from '../../data/frameworkSignal';

interface PackageInfo {
  name: string;
  desc: string;
  useCase: string;
  framework?: Framework;
  comingSoon?: boolean;
}

const packages: PackageInfo[] = [
  {
    name: '@reelkit/core',
    desc: 'Framework-agnostic core',
    useCase: 'Custom integrations',
  },
  {
    name: '@reelkit/react',
    desc: 'React components',
    useCase: 'React 18+ applications',
    framework: 'react',
  },
  {
    name: '@reelkit/react-reel-player',
    desc: 'Full-screen vertical reel player',
    useCase: 'Instagram/TikTok style player',
    framework: 'react',
  },
  {
    name: '@reelkit/react-lightbox',
    desc: 'Image gallery lightbox',
    useCase: 'Full-screen image preview',
    framework: 'react',
  },
  {
    name: '@reelkit/react-stories-player',
    desc: 'Instagram-style stories player',
    useCase: 'Stories with auto-advance and gestures',
    framework: 'react',
  },
  {
    name: '@reelkit/angular',
    desc: 'Angular standalone components',
    useCase: 'Angular 17+ applications',
    framework: 'angular',
  },
  {
    name: '@reelkit/angular-reel-player',
    desc: 'Full-screen vertical reel player',
    useCase: 'Instagram/TikTok style player',
    framework: 'angular',
  },
  {
    name: '@reelkit/angular-lightbox',
    desc: 'Image gallery lightbox',
    useCase: 'Full-screen image preview',
    framework: 'angular',
  },
  {
    name: '@reelkit/vue',
    desc: 'Vue 3 components and composables',
    useCase: 'Vue 3 applications',
    framework: 'vue',
  },
];

const bundleSizes: {
  name: string;
  js: string;
  gzip: string;
  css: string;
  cssGzip: string;
  framework?: Framework;
}[] = [
  {
    name: '@reelkit/core',
    js: '15.4 kB',
    gzip: '6.0 kB',
    css: '-',
    cssGzip: '-',
  },
  {
    name: '@reelkit/react',
    js: '10.7 kB',
    gzip: '3.9 kB',
    css: '-',
    cssGzip: '-',
    framework: 'react',
  },
  {
    name: '@reelkit/react-reel-player',
    js: '13.7 kB',
    gzip: '4.3 kB',
    css: '2.8 kB',
    cssGzip: '0.9 kB',
    framework: 'react',
  },
  {
    name: '@reelkit/react-lightbox',
    js: '9.2 kB',
    gzip: '3.1 kB',
    css: '4.0 kB',
    cssGzip: '1.1 kB',
    framework: 'react',
  },
  {
    name: '@reelkit/react-stories-player',
    js: '17.7 kB',
    gzip: '5.6 kB',
    css: '3.7 kB',
    cssGzip: '1.1 kB',
    framework: 'react',
  },
  {
    name: '@reelkit/angular',
    js: '63.2 kB',
    gzip: '13.8 kB',
    css: '-',
    cssGzip: '-',
    framework: 'angular',
  },
  {
    name: '@reelkit/angular-reel-player',
    js: '109.8 kB',
    gzip: '17.3 kB',
    css: '-',
    cssGzip: '-',
    framework: 'angular',
  },
  {
    name: '@reelkit/angular-lightbox',
    js: '82.8 kB',
    gzip: '14.0 kB',
    css: '-',
    cssGzip: '-',
    framework: 'angular',
  },
  {
    name: '@reelkit/vue',
    js: '20.4 kB',
    gzip: '5.9 kB',
    css: '-',
    cssGzip: '-',
    framework: 'vue',
  },
];

const comparison = [
  {
    name: 'ReelKit (core + react)',
    gzip: '9.9 kB',
    virtualization: true,
    notes: 'Zero dependencies',
  },
  {
    name: 'ReelKit (core + angular)',
    gzip: '19.8 kB',
    virtualization: true,
    notes: 'Zero dependencies',
  },
  {
    name: 'ReelKit (core + vue)',
    gzip: '11.9 kB',
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
            <Observe signals={[frameworkSignal]}>
              {() => (
                <tbody>
                  {packages
                    .filter(
                      (pkg) =>
                        !pkg.framework ||
                        pkg.framework === frameworkSignal.value,
                    )
                    .map((pkg) => (
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
              )}
            </Observe>
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
            <Observe signals={[frameworkSignal]}>
              {() => (
                <tbody>
                  {bundleSizes
                    .filter(
                      (pkg) =>
                        !pkg.framework ||
                        pkg.framework === frameworkSignal.value,
                    )
                    .map((pkg) => (
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
              )}
            </Observe>
          </table>
        </div>

        <h3 className="text-lg font-semibold mb-3">
          Comparison with Other Libraries
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          ReelKit renders <strong>3 slides to DOM</strong> at any time and
          handles 10,000+ items. Other carousel libraries render all slides,
          which stalls on large lists.
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

      <Observe signals={[frameworkSignal]}>
        {() => {
          const fw = frameworkSignal.value;
          const pkg =
            fw === 'react'
              ? '@reelkit/react'
              : fw === 'angular'
                ? '@reelkit/angular'
                : '@reelkit/vue';
          return (
            <>
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">npm</h2>
                <CodeBlock code={`npm install ${pkg}`} language="bash" />
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">yarn</h2>
                <CodeBlock code={`yarn add ${pkg}`} language="bash" />
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4">pnpm</h2>
                <CodeBlock code={`pnpm add ${pkg}`} language="bash" />
              </section>
            </>
          );
        }}
      </Observe>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Peer Dependencies</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Framework packages have peer dependencies that should already be in
          your project:
        </p>

        <Observe signals={[frameworkSignal]}>
          {() =>
            renderFramework({
              react: () => (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      @reelkit/react
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                      <li>
                        <code className="text-sm font-mono">react</code>{' '}
                        {'>= 18.0.0'}
                      </li>
                      <li>
                        <code className="text-sm font-mono">react-dom</code>{' '}
                        {'>= 18.0.0'}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      @reelkit/react-reel-player
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                      <li>
                        <code className="text-sm font-mono">
                          @reelkit/react
                        </code>
                      </li>
                      <li>
                        <code className="text-sm font-mono">react</code>{' '}
                        {'>= 18.0.0'}
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
                        <code className="text-sm font-mono">
                          @reelkit/react
                        </code>
                      </li>
                      <li>
                        <code className="text-sm font-mono">react</code>{' '}
                        {'>= 18.0.0'}
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
                      @reelkit/react-stories-player
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                      <li>
                        <code className="text-sm font-mono">
                          @reelkit/react
                        </code>
                      </li>
                      <li>
                        <code className="text-sm font-mono">react</code>{' '}
                        {'>= 18.0.0'}
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
                </div>
              ),
              angular: () => (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      @reelkit/angular
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                      <li>
                        <code className="text-sm font-mono">@angular/core</code>{' '}
                        {'>= 17.0.0'}
                      </li>
                      <li>
                        <code className="text-sm font-mono">
                          @angular/common
                        </code>{' '}
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
                        <code className="text-sm font-mono">
                          @reelkit/angular
                        </code>
                      </li>
                      <li>
                        <code className="text-sm font-mono">@angular/core</code>{' '}
                        {'>= 19.0.0'}
                      </li>
                      <li>
                        <code className="text-sm font-mono">
                          lucide-angular
                        </code>{' '}
                        {'>= 0.460.0'}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      @reelkit/angular-lightbox
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                      <li>
                        <code className="text-sm font-mono">
                          @reelkit/angular
                        </code>
                      </li>
                      <li>
                        <code className="text-sm font-mono">@angular/core</code>{' '}
                        {'>= 17.0.0'}
                      </li>
                      <li>
                        <code className="text-sm font-mono">
                          lucide-angular
                        </code>{' '}
                        {'>= 0.400.0'}
                      </li>
                    </ul>
                  </div>
                </div>
              ),
              vue: () => (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">@reelkit/vue</h3>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                      <li>
                        <code className="text-sm font-mono">vue</code>{' '}
                        {'>= 3.0.0'}
                      </li>
                    </ul>
                  </div>
                </div>
              ),
            })
          }
        </Observe>

        <Observe signals={[frameworkSignal]}>
          {() =>
            renderFramework({
              react: () => (
                <Callout type="info" className="mt-4">
                  <code className="text-sm font-mono">lucide-react</code> is
                  only needed for the default control icons. If you provide your
                  own controls via{' '}
                  <code className="text-sm font-mono">renderControls</code>, you
                  can skip installing it.
                </Callout>
              ),
              angular: () => (
                <Callout type="info" className="mt-4">
                  <code className="text-sm font-mono">lucide-angular</code> is
                  only needed for the default control icons. If you provide your
                  own controls via{' '}
                  <code className="text-sm font-mono">rkPlayerControls</code>,
                  you can skip installing it.
                </Callout>
              ),
            })
          }
        </Observe>
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

      <NextSteps
        items={[
          {
            label: 'Core Guide',
            path: '/docs/core/guide',
            description: 'framework-agnostic engine',
          },
          {
            label: 'Framework Guide',
            path: {
              react: '/docs/react/guide',
              angular: '/docs/angular/guide',
              vue: '/docs/vue/guide',
            },
            description: 'components, demos, and integration',
          },
          {
            label: 'Reel Player',
            path: {
              react: '/docs/reel-player',
              angular: '/docs/angular-reel-player',
              vue: '/docs/vue-reel-player',
            },
            description: 'TikTok/Reels-style video player',
          },
          {
            label: 'Lightbox',
            path: {
              react: '/docs/lightbox',
              angular: '/docs/angular-lightbox',
              vue: '/docs/vue-lightbox',
            },
            description: 'image & video gallery',
          },
          {
            label: 'Stories Player',
            path: {
              react: '/docs/stories-player',
              angular: '/docs/angular-stories-player',
              vue: '/docs/vue-stories-player',
            },
            description: 'Instagram-style stories viewer',
          },
        ]}
      />
    </div>
  );
}
