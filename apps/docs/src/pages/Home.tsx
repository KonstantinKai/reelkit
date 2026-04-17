import { Link } from 'react-router-dom';
import {
  Zap,
  Layers,
  Keyboard,
  Code2,
  Paintbrush,
  Blocks,
  ArrowRight,
  Box,
  Film,
  Image,
} from 'lucide-react';
import { CodeBlock } from '../components/ui/CodeBlock';
import { BasicSliderDemo } from '../components/demos/BasicSliderDemo';
import { AnimatedLogo } from '../components/ui/AnimatedLogo';
import { GitHubStarButton } from '../components/ui/GitHubStarButton';

const highlights = [
  {
    stat: '3',
    unit: 'in DOM',
    title: 'Virtualized',
    description: 'Handle 10,000+ items. Only 3 slides rendered at any time.',
    color: 'text-primary-500',
  },
  {
    stat: '0',
    unit: 'deps',
    title: 'Zero Dependencies',
    description: 'No runtime dependencies. Core is ~4 kB gzipped.',
    color: 'text-accent-500',
  },
  {
    stat: '60',
    unit: 'fps',
    title: 'Touch First',
    description: 'Native swipe gestures with momentum and snap points.',
    color: 'text-emerald-500',
  },
];

const moreFeatures = [
  {
    icon: <Zap className="w-4 h-4" />,
    title: 'Performant',
    color: 'text-amber-500',
  },
  {
    icon: <Keyboard className="w-4 h-4" />,
    title: 'Keyboard Navigation',
    color: 'text-primary-500',
  },
  {
    icon: <Layers className="w-4 h-4" />,
    title: 'Framework Agnostic',
    color: 'text-emerald-500',
  },
  {
    icon: <Code2 className="w-4 h-4" />,
    title: 'TypeScript First',
    color: 'text-sky-500',
  },
  {
    icon: <Paintbrush className="w-4 h-4" />,
    title: 'Headless + Styled',
    color: 'text-accent-500',
  },
  {
    icon: <Blocks className="w-4 h-4" />,
    title: 'Ready-made Components',
    color: 'text-rose-400',
  },
];

const codeExample = `import { Reel, ReelIndicator } from '@reelkit/react';

const items = ['Slide 1', 'Slide 2', 'Slide 3'];

function App() {
  return (
    <Reel
      count={items.length}
      size={[400, 600]}
      itemBuilder={(index) => (
        <div className="slide">{items[index]}</div>
      )}
    >
      <ReelIndicator />
    </Reel>
  );
}`;

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section — two columns: text + live demo */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left: Text */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 flex items-center justify-center lg:justify-start gap-3">
                <AnimatedLogo className="w-12 h-12 md:w-14 md:h-14" />
                <span>
                  <span className="text-slate-900 dark:text-white">Reel</span>
                  <span className="bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                    Kit
                  </span>
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-4 max-w-lg">
                Single-item slider for{' '}
                <span className="text-primary-600 dark:text-primary-400 font-semibold">
                  TikTok/Instagram Reels-style
                </span>{' '}
                experiences
              </p>

              <p className="text-base text-slate-500 dark:text-slate-400 mb-6 max-w-lg">
                Framework-agnostic, virtualized, touch-first. Built for vertical
                video feeds, story viewers, and fullscreen galleries.
              </p>

              <div className="flex items-center justify-center lg:justify-start gap-5 mb-8">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex items-center justify-center">
                    <svg
                      viewBox="-11.5 -10.232 23 20.463"
                      className="w-7 h-7 text-sky-500"
                    >
                      <circle r="2.05" fill="currentColor" />
                      <g stroke="currentColor" fill="none" strokeWidth="1">
                        <ellipse rx="11" ry="4.2" />
                        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
                        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
                      </g>
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    React
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-center">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-7 h-7 text-rose-500"
                      fill="currentColor"
                    >
                      <path d="M9.931 12.645h4.138l-2.07-4.908m0-7.737L.68 3.982l1.726 14.771L12 24l9.596-5.242L23.32 3.984 11.999.001zm7.064 18.31h-2.638l-1.422-3.503H8.996l-1.422 3.504h-2.64L12 2.65z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Angular
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-7 h-7 text-emerald-500"
                      fill="currentColor"
                    >
                      <path d="M2 3h3.5L12 15l6.5-12H22L12 21 2 3zm4.5 0H10l2 3.6L14 3h3.5L12 13.2 6.5 3z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Vue
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3">
                <Link
                  to="/docs/getting-started"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  Get Started
                  <ArrowRight size={18} />
                </Link>
                <GitHubStarButton />
              </div>
            </div>

            {/* Right: Live phone demo */}
            <div className="flex-shrink-0">
              <div
                className="relative rounded-[2.5rem] border-[3px] border-slate-300 dark:border-slate-600 bg-black shadow-2xl shadow-slate-900/20 dark:shadow-black/40 overflow-hidden"
                style={{ width: 260, height: 460 }}
              >
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-b-2xl z-20" />
                {/* Home indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/30 rounded-full z-20" />
                {/* Demo */}
                <div className="w-full h-full rounded-[2.25rem] overflow-hidden">
                  <BasicSliderDemo />
                </div>
              </div>
              <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-3">
                Live demo — use the arrows
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section — tiered hierarchy */}
      <section className="py-24 bg-slate-50 dark:bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for performance
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Virtualized rendering, zero dependencies, 60fps transitions
            </p>
          </div>

          {/* Top 3: Stat-driven highlight cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {highlights.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/5 dark:hover:shadow-black/10"
              >
                <div className="flex items-baseline gap-1 mb-3">
                  <span
                    className={`text-4xl font-bold tabular-nums tracking-tight ${feature.color}`}
                  >
                    {feature.stat}
                  </span>
                  <span className="text-sm font-medium text-slate-400 dark:text-slate-500">
                    {feature.unit}
                  </span>
                </div>
                <h3 className="text-base font-semibold mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom 6: Compact inline features */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4 max-w-3xl mx-auto">
            {moreFeatures.map((feature) => (
              <div
                key={feature.title}
                className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400"
              >
                <span className={feature.color}>{feature.icon}</span>
                {feature.title}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why "ReelKit"? Section */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Why "ReelKit"?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Reel
            </span>{' '}
            — vertical video feeds like Instagram Reels and TikTok. One piece of
            content at a time, swipe to advance.
          </p>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Kit
            </span>{' '}
            — a modular set of packages. Use the headless core for full control,
            framework bindings for quick setup, or ready-made overlays for video
            players and image galleries.
          </p>
        </div>
      </section>

      {/* Code Example Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple API</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Get started with just a few lines of code
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <CodeBlock code={codeExample} language="tsx" />
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Available Packages
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              A modular ecosystem — pick what you need
            </p>
          </div>

          {/* Core — the foundation */}
          <div className="max-w-lg mx-auto mb-6">
            <div className="relative p-6 rounded-2xl border-2 border-primary-400 dark:border-primary-500 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-950/40 dark:to-accent-950/30 shadow-lg shadow-primary-500/10">
              <span className="absolute -top-3 left-6 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-widest bg-primary-500 text-white rounded-full">
                Core
              </span>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-500/10 dark:bg-primary-400/10">
                  <Box className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <a
                  href="https://www.npmjs.com/package/@reelkit/core"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm font-semibold text-primary-700 dark:text-primary-300 hover:underline"
                >
                  @reelkit/core
                </a>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm ml-12">
                Framework-agnostic slider engine — virtualization, gestures,
                keyboard, wheel, signals. Zero dependencies.
              </p>
            </div>
          </div>

          {/* Framework bindings — vertical stacked tree */}
          <div className="max-w-3xl mx-auto space-y-0">
            {[
              {
                framework: 'React',
                pkg: '@reelkit/react',
                desc: 'Components, hooks, and signal bridges',
                color: 'sky',
                extensions: [
                  { name: '@reelkit/react-reel-player', label: 'Reel Player' },
                  { name: '@reelkit/react-lightbox', label: 'Lightbox' },
                  {
                    name: '@reelkit/react-stories-player',
                    label: 'Stories Player',
                  },
                ],
              },
              {
                framework: 'Angular',
                pkg: '@reelkit/angular',
                desc: 'Standalone components with signal-based reactivity',
                color: 'rose',
                extensions: [
                  {
                    name: '@reelkit/angular-reel-player',
                    label: 'Reel Player',
                  },
                  { name: '@reelkit/angular-lightbox', label: 'Lightbox' },
                  {
                    name: '@reelkit/angular-stories-player',
                    label: 'Stories Player',
                    comingSoon: true,
                  },
                ],
              },
              {
                framework: 'Vue',
                pkg: '@reelkit/vue',
                desc: 'Components and composables for Vue 3',
                color: 'emerald',
                extensions: [
                  {
                    name: '@reelkit/vue-reel-player',
                    label: 'Reel Player',
                    comingSoon: true,
                  },
                  {
                    name: '@reelkit/vue-lightbox',
                    label: 'Lightbox',
                    comingSoon: true,
                  },
                  {
                    name: '@reelkit/vue-stories-player',
                    label: 'Stories Player',
                    comingSoon: true,
                  },
                ],
              },
            ].map(({ framework, pkg, desc, color, extensions }, i, arr) => (
              <div key={framework}>
                <div className="flex justify-center">
                  <div className="w-px h-6 bg-slate-300 dark:bg-slate-600" />
                </div>

                {/* Binding card with inline extensions */}
                <div
                  className={`relative rounded-2xl border border-${color}-300 dark:border-${color}-700 bg-${color}-50/60 dark:bg-${color}-950/20 p-5`}
                >
                  <span
                    className={`absolute -top-3 left-5 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-widest bg-${color}-500 text-white rounded-full`}
                  >
                    {framework}
                  </span>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-x-3 gap-y-0.5 mb-1">
                    <div className="flex items-center gap-3">
                      <Blocks
                        className={`w-4 h-4 text-${color}-600 dark:text-${color}-400 shrink-0`}
                      />
                      <a
                        href={`https://www.npmjs.com/package/${pkg}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`font-mono text-sm font-semibold text-${color}-700 dark:text-${color}-300 hover:underline`}
                      >
                        {pkg}
                      </a>
                    </div>
                    <span className="text-slate-500 dark:text-slate-400 text-sm ml-7 sm:ml-0">
                      <span className="hidden sm:inline">— </span>
                      {desc}
                    </span>
                  </div>

                  {/* Extension packages as inline chips */}
                  <div className="flex flex-wrap gap-2 mt-3 ml-7">
                    {extensions.map((ext) => (
                      <a
                        key={ext.name}
                        href={
                          'comingSoon' in ext && ext.comingSoon
                            ? undefined
                            : `https://www.npmjs.com/package/${ext.name}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-${color}-200 dark:border-${color}-800 bg-white dark:bg-slate-800/60 text-xs ${!('comingSoon' in ext && ext.comingSoon) ? `hover:border-${color}-400 dark:hover:border-${color}-600 transition-colors` : ''}`}
                      >
                        {ext.name.includes('player') ? (
                          <Film className={`w-3 h-3 text-${color}-500`} />
                        ) : (
                          <Image className={`w-3 h-3 text-${color}-500`} />
                        )}
                        <span
                          className={`font-mono font-medium text-${color}-700 dark:text-${color}-300`}
                        >
                          {ext.label}
                        </span>
                        {'comingSoon' in ext && ext.comingSoon && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                            soon
                          </span>
                        )}
                      </a>
                    ))}
                  </div>
                </div>

                {i < arr.length - 1 && (
                  <div className="flex justify-center">
                    <div className="w-px h-2 bg-slate-300 dark:bg-slate-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section — confident and simple, no gradient */}
      <section className="py-20 bg-slate-900 dark:bg-slate-800/50 border-t border-slate-800 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Check out the documentation and examples to build your first slider.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/docs/getting-started"
              className="px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
            >
              Read the Docs
            </Link>
            <GitHubStarButton variant="on-dark" />
          </div>
        </div>
      </section>
    </div>
  );
}
