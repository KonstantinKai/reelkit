import { CodeBlock } from '../../../components/ui/CodeBlock';
import { Callout } from '../../../components/ui/Callout';
import { Check } from 'lucide-react';
import { NextSteps } from '../../../components/NextSteps';
import { type Framework } from '../../../data/frameworkSignal';
import { FrameworkBlocks } from '../../../components/ui/FrameworkVariant';
import { Heading } from '../../../components/ui/Heading';
import { zhPageMeta } from '../../../i18n/pageMeta';

export const meta = () =>
  zhPageMeta({
    path: '/docs/installation',
    title: '安装 · ReelKit',
    description:
      '用 npm、yarn 或 pnpm 安装 ReelKit。包的选择、打包体积、同级依赖与 TypeScript 支持。',
  });

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
    desc: '与框架无关的核心',
    useCase: '自定义集成',
  },
  {
    name: '@reelkit/react',
    desc: 'React 组件',
    useCase: 'React 18+ 应用',
    framework: 'react',
  },
  {
    name: '@reelkit/react-reel-player',
    desc: '全屏竖向 Reel Player',
    useCase: 'Instagram / TikTok 风格播放器',
    framework: 'react',
  },
  {
    name: '@reelkit/react-lightbox',
    desc: '图片画廊Lightbox',
    useCase: '全屏图片预览',
    framework: 'react',
  },
  {
    name: '@reelkit/react-stories-player',
    desc: 'Instagram 风格 Stories Player',
    useCase: '带自动播放与手势的 Stories',
    framework: 'react',
  },
  {
    name: '@reelkit/angular',
    desc: 'Angular 独立组件',
    useCase: 'Angular 17+ 应用',
    framework: 'angular',
  },
  {
    name: '@reelkit/angular-reel-player',
    desc: '全屏竖向 Reel Player',
    useCase: 'Instagram / TikTok 风格播放器',
    framework: 'angular',
  },
  {
    name: '@reelkit/angular-lightbox',
    desc: '图片画廊Lightbox',
    useCase: '全屏图片预览',
    framework: 'angular',
  },
  {
    name: '@reelkit/vue',
    desc: 'Vue 3 组件与组合式函数',
    useCase: 'Vue 3 应用',
    framework: 'vue',
  },
  {
    name: '@reelkit/vue-reel-player',
    desc: '全屏竖向 Reel Player',
    useCase: 'Instagram / TikTok 风格播放器',
    framework: 'vue',
  },
  {
    name: '@reelkit/vue-lightbox',
    desc: '图片画廊Lightbox',
    useCase: '全屏图片预览',
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
    js: '23.7 kB',
    gzip: '9.0 kB',
    css: '-',
    cssGzip: '-',
  },
  {
    name: '@reelkit/react',
    js: '12.8 kB',
    gzip: '4.7 kB',
    css: '-',
    cssGzip: '-',
    framework: 'react',
  },
  {
    name: '@reelkit/react-reel-player',
    js: '17.0 kB',
    gzip: '5.4 kB',
    css: '9.7 kB',
    cssGzip: '2.1 kB',
    framework: 'react',
  },
  {
    name: '@reelkit/react-lightbox',
    js: '10.0 kB',
    gzip: '3.4 kB',
    css: '7.7 kB',
    cssGzip: '1.6 kB',
    framework: 'react',
  },
  {
    name: '@reelkit/react-stories-player',
    js: '18.8 kB',
    gzip: '5.8 kB',
    css: '7.5 kB',
    cssGzip: '1.7 kB',
    framework: 'react',
  },
  {
    name: '@reelkit/angular',
    js: '66.6 kB',
    gzip: '15.1 kB',
    css: '-',
    cssGzip: '-',
    framework: 'angular',
  },
  {
    name: '@reelkit/angular-reel-player',
    js: '149.3 kB',
    gzip: '24.4 kB',
    css: '-',
    cssGzip: '-',
    framework: 'angular',
  },
  {
    name: '@reelkit/angular-lightbox',
    js: '93.5 kB',
    gzip: '15.4 kB',
    css: '-',
    cssGzip: '-',
    framework: 'angular',
  },
  {
    name: '@reelkit/vue',
    js: '14.2 kB',
    gzip: '4.9 kB',
    css: '-',
    cssGzip: '-',
    framework: 'vue',
  },
  {
    name: '@reelkit/vue-reel-player',
    js: '21.1 kB',
    gzip: '6.2 kB',
    css: '9.7 kB',
    cssGzip: '2.1 kB',
    framework: 'vue',
  },
  {
    name: '@reelkit/vue-lightbox',
    js: '14.4 kB',
    gzip: '4.1 kB',
    css: '6.8 kB',
    cssGzip: '1.4 kB',
    framework: 'vue',
  },
];

const comparison = [
  {
    name: 'ReelKit (core + react)',
    gzip: '13.7 kB',
    virtualization: true,
    notes: '零依赖',
  },
  {
    name: 'ReelKit (core + angular)',
    gzip: '24.1 kB',
    virtualization: true,
    notes: '零依赖',
  },
  {
    name: 'ReelKit (core + vue)',
    gzip: '13.9 kB',
    virtualization: true,
    notes: '零依赖',
  },
  {
    name: 'Swiper',
    gzip: '~25 kB',
    virtualization: 'plugin',
    notes: '完整包体；支持 tree-shaking',
  },
  {
    name: 'Embla Carousel',
    gzip: '~7 kB',
    virtualization: false,
    notes: '轻量，基于插件',
  },
  {
    name: 'keen-slider',
    gzip: '~6 kB',
    virtualization: false,
    notes: '零依赖',
  },
];

function InstallCommands({ pkg }: { pkg: string }) {
  return (
    <>
      <section className="mb-12">
        <Heading level={2} id="npm" className="text-2xl font-bold mb-4">
          npm
        </Heading>
        <CodeBlock code={`npm install ${pkg}`} language="bash" />
      </section>

      <section className="mb-12">
        <Heading level={2} id="yarn" className="text-2xl font-bold mb-4">
          yarn
        </Heading>
        <CodeBlock code={`yarn add ${pkg}`} language="bash" />
      </section>

      <section className="mb-12">
        <Heading level={2} id="pnpm" className="text-2xl font-bold mb-4">
          pnpm
        </Heading>
        <CodeBlock code={`pnpm add ${pkg}`} language="bash" />
      </section>
    </>
  );
}

// Headings carry the English slug as an explicit id — the slug generator is
// ascii-only, so a Chinese heading would produce an empty anchor.
export default function Installation() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">安装</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          安装 reelkit 的各个包，并完成项目配置。
        </p>
      </div>

      <section className="mb-12">
        <Heading
          level={2}
          id="package-options"
          className="text-2xl font-bold mb-4"
        >
          包的选择
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          用到哪个装哪个：
        </p>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">包名</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
                <th className="text-left py-3 px-4 font-semibold">适用场景</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <tr
                  key={pkg.name}
                  data-rk-fw={pkg.framework}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4">
                    <code className="text-sm font-mono text-primary-600 dark:text-primary-400">
                      {pkg.name}
                    </code>
                    {pkg.comingSoon && (
                      <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                        即将推出
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
        <Heading
          level={2}
          id="bundle-sizes"
          className="text-2xl font-bold mb-4"
        >
          打包体积
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          所有包都针对最小的体积影响做过优化：
        </p>

        <div className="overflow-x-auto mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">包名</th>
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
                  data-rk-fw={pkg.framework}
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

        <Heading
          level={3}
          id="comparison-with-other-libraries"
          className="text-lg font-semibold mb-3"
        >
          与其他库的对比
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          ReelKit 任何时候只往 DOM 里渲染 <strong>3 张幻灯片</strong>，可以扛住
          10,000+ 条目。其他轮播库会渲染全部幻灯片，列表一大就卡。
        </p>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">库</th>
                <th className="text-left py-3 px-4 font-semibold">JS (gzip)</th>
                <th className="text-left py-3 px-4 font-semibold">虚拟化</th>
                <th className="text-left py-3 px-4 font-semibold">备注</th>
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
                        插件
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

      <FrameworkBlocks
        react={<InstallCommands pkg="@reelkit/react" />}
        angular={<InstallCommands pkg="@reelkit/angular" />}
        vue={<InstallCommands pkg="@reelkit/vue" />}
      />

      <section className="mb-12">
        <Heading
          level={2}
          id="peer-dependencies"
          className="text-2xl font-bold mb-4"
        >
          同级依赖
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          框架相关的包都有同级依赖，通常你的项目里已经装好了：
        </p>

        <FrameworkBlocks
          react={
            <div className="space-y-6">
              <div>
                <Heading
                  level={3}
                  id="reelkit-react"
                  className="text-lg font-semibold mb-2"
                >
                  @reelkit/react
                </Heading>
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
                <Heading
                  level={3}
                  id="reelkit-react-reel-player"
                  className="text-lg font-semibold mb-2"
                >
                  @reelkit/react-reel-player
                </Heading>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                  <li>
                    <code className="text-sm font-mono">@reelkit/react</code>
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
                <Heading
                  level={3}
                  id="reelkit-react-lightbox"
                  className="text-lg font-semibold mb-2"
                >
                  @reelkit/react-lightbox
                </Heading>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                  <li>
                    <code className="text-sm font-mono">@reelkit/react</code>
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
                <Heading
                  level={3}
                  id="reelkit-react-stories-player"
                  className="text-lg font-semibold mb-2"
                >
                  @reelkit/react-stories-player
                </Heading>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                  <li>
                    <code className="text-sm font-mono">@reelkit/react</code>
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
          }
          angular={
            <div className="space-y-6">
              <div>
                <Heading
                  level={3}
                  id="reelkit-angular"
                  className="text-lg font-semibold mb-2"
                >
                  @reelkit/angular
                </Heading>
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
                <Heading
                  level={3}
                  id="reelkit-angular-reel-player"
                  className="text-lg font-semibold mb-2"
                >
                  @reelkit/angular-reel-player
                </Heading>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                  <li>
                    <code className="text-sm font-mono">@reelkit/angular</code>
                  </li>
                  <li>
                    <code className="text-sm font-mono">@angular/core</code>{' '}
                    {'>= 19.0.0'}
                  </li>
                  <li>
                    <code className="text-sm font-mono">lucide-angular</code>{' '}
                    {'>= 0.460.0'}
                  </li>
                </ul>
              </div>
              <div>
                <Heading
                  level={3}
                  id="reelkit-angular-lightbox"
                  className="text-lg font-semibold mb-2"
                >
                  @reelkit/angular-lightbox
                </Heading>
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
          }
          vue={
            <div className="space-y-6">
              <div>
                <Heading
                  level={3}
                  id="reelkit-vue"
                  className="text-lg font-semibold mb-2"
                >
                  @reelkit/vue
                </Heading>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                  <li>
                    <code className="text-sm font-mono">vue</code> {'>= 3.0.0'}
                  </li>
                </ul>
              </div>
            </div>
          }
        />

        <FrameworkBlocks
          react={
            <Callout type="info" className="mt-4">
              <code className="text-sm font-mono">lucide-react</code>{' '}
              只用于默认的控制图标。如果你通过{' '}
              <code className="text-sm font-mono">renderControls</code>{' '}
              提供自己的控件，就可以不装它。
            </Callout>
          }
          angular={
            <Callout type="info" className="mt-4">
              <code className="text-sm font-mono">lucide-angular</code>{' '}
              只用于默认的控制图标。如果你通过{' '}
              <code className="text-sm font-mono">rkPlayerControls</code>{' '}
              提供自己的控件，就可以不装它。
            </Callout>
          }
          vue={null}
        />
      </section>

      <section className="mb-12">
        <Heading level={2} id="typescript" className="text-2xl font-bold mb-4">
          TypeScript
        </Heading>
        <p className="text-slate-600 dark:text-slate-400">
          所有包都自带 TypeScript 类型定义，不需要额外安装 {'@types'} 包。
        </p>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="browser-support"
          className="text-2xl font-bold mb-4"
        >
          浏览器支持
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          reelkit 支持所有现代浏览器：
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
            label: '核心指南',
            path: '/docs/core/guide',
            description: '与框架无关的引擎',
          },
          {
            label: '框架指南',
            path: {
              react: '/docs/react/guide',
              angular: '/docs/angular/guide',
              vue: '/docs/vue/guide',
            },
            description: '组件、演示与集成方式',
          },
          {
            label: 'Reel Player',
            path: {
              react: '/docs/reel-player',
              angular: '/docs/angular-reel-player',
              vue: '/docs/vue-reel-player',
            },
            description: 'TikTok / Reels 风格的视频播放器',
          },
          {
            label: 'Lightbox',
            path: {
              react: '/docs/lightbox',
              angular: '/docs/angular-lightbox',
              vue: '/docs/vue-lightbox',
            },
            description: '图片与视频画廊',
          },
          {
            label: 'Stories Player',
            path: {
              react: '/docs/stories-player',
              angular: '/docs/angular-stories-player',
              vue: '/docs/vue-stories-player',
            },
            description: 'Instagram 风格的 Stories 浏览器',
          },
        ]}
      />
    </div>
  );
}
