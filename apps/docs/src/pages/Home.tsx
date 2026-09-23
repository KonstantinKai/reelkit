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
  Link2,
} from 'lucide-react';
import { CodeBlock } from '../components/ui/CodeBlock';
import {
  BasicSliderDemo,
  heroSlidePreloadLinks,
} from '../components/demos/BasicSliderDemo';
import { AnimatedLogo } from '../components/ui/AnimatedLogo';
import { AnimatedWordmark } from '../components/ui/AnimatedWordmark';
import { GitHubStarButton } from '../components/ui/GitHubStarButton';
import { VirtualizationDemo } from '../components/demos/VirtualizationDemo';
import { readLocaleFromPath } from '../i18n/locale';
import { messages } from '../i18n/messages';
import { localePageMeta } from '../i18n/pageMeta';
import { useLocalePath, useMessages } from '../i18n/useLocale';

export const links = heroSlidePreloadLinks;

/**
 * One page serves every language, so the locale comes from the URL the
 * router is rendering rather than from which file was imported.
 */
export const meta = ({ location }: { location: { pathname: string } }) => {
  const locale = readLocaleFromPath(location.pathname);
  const { title, description } = messages[locale].home.meta;
  return localePageMeta(locale, { path: '/', title, description });
};

/**
 * The look of each stat card, in the order the dictionary lists them. Colors
 * are not translated, so they stay here rather than in seven dictionaries.
 */
const highlightColors = [
  'text-primary-500',
  'text-accent-500',
  'text-emerald-500',
] as const;

/** Icon and color for each compact feature, positional against `more`. */
const moreFeatureMarks = [
  { icon: <Zap className="w-4 h-4" />, color: 'text-amber-500' },
  { icon: <Keyboard className="w-4 h-4" />, color: 'text-primary-500' },
  { icon: <Layers className="w-4 h-4" />, color: 'text-emerald-500' },
  { icon: <Code2 className="w-4 h-4" />, color: 'text-sky-500' },
  { icon: <Paintbrush className="w-4 h-4" />, color: 'text-accent-500' },
  { icon: <Blocks className="w-4 h-4" />, color: 'text-rose-400' },
  { icon: <Link2 className="w-4 h-4" />, color: 'text-violet-500' },
] as const;

/**
 * Package names and the labels beside them are product names: they read the
 * same in every language, so the tree is built here and only each binding's
 * one-line description comes from the dictionary.
 */
const bindings = [
  {
    key: 'react',
    framework: 'React',
    pkg: '@reelkit/react',
    color: 'sky',
    extensions: [
      { name: '@reelkit/react-reel-player', label: 'Reel Player' },
      { name: '@reelkit/react-lightbox', label: 'Lightbox' },
      { name: '@reelkit/react-stories-player', label: 'Stories Player' },
    ],
  },
  {
    key: 'angular',
    framework: 'Angular',
    pkg: '@reelkit/angular',
    color: 'rose',
    extensions: [
      { name: '@reelkit/angular-reel-player', label: 'Reel Player' },
      { name: '@reelkit/angular-lightbox', label: 'Lightbox' },
      { name: '@reelkit/angular-stories-player', label: 'Stories Player' },
    ],
  },
  {
    key: 'vue',
    framework: 'Vue',
    pkg: '@reelkit/vue',
    color: 'emerald',
    extensions: [
      { name: '@reelkit/vue-reel-player', label: 'Reel Player' },
      { name: '@reelkit/vue-lightbox', label: 'Lightbox' },
      { name: '@reelkit/vue-stories-player', label: 'Stories Player' },
    ],
  },
] as const;

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
  const { home } = useMessages();
  // Both calls to action point at the docs; a reader who arrived in Spanish
  // should stay in Spanish when they follow one.
  const localePath = useLocalePath();
  const gettingStarted = localePath('/docs/getting-started');

  return (
    <div className="min-h-screen">
      {/* Hero Section — two columns: text + live demo */}
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-primary-950/30 dark:via-slate-900 dark:to-accent-950/30">
        {/* Decorative blur blobs — soft corner accents, static */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary-300/25 dark:bg-primary-500/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent-300/25 dark:bg-accent-500/15 blur-3xl"
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left: Text */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 flex items-center justify-center lg:justify-start gap-3">
                <AnimatedLogo className="w-12 h-12 md:w-14 md:h-14" />
                <AnimatedWordmark />
              </h1>

              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-4 max-w-lg">
                {home.hero.taglineLead ? `${home.hero.taglineLead} ` : ''}
                <span className="text-primary-600 dark:text-primary-400 font-semibold">
                  {home.hero.taglineHighlight}
                </span>
                {home.hero.taglineTail ? ` ${home.hero.taglineTail}` : ''}
              </p>

              <p className="text-base text-slate-500 dark:text-slate-400 mb-6 max-w-lg">
                {home.hero.subtitle}
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
                  to={gettingStarted}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  {home.hero.getStarted}
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
                  <BasicSliderDemo priority />
                </div>
              </div>
              <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-3">
                {home.hero.demoCaption}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="border-b border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-900"
        aria-labelledby="virtualization-heading"
      >
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">
              {home.virtualization.eyebrow}
            </p>
            <h2
              id="virtualization-heading"
              className="mb-6 text-3xl font-bold tracking-tight md:text-4xl"
            >
              {home.virtualization.headingLead}
              <br />
              <span className="bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                {home.virtualization.headingHighlight}
              </span>
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              {home.virtualization.intro}
            </p>
            <ol className="space-y-6">
              {home.virtualization.steps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-50 font-mono text-sm text-primary-600 dark:bg-primary-950 dark:text-primary-400">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="mb-1 font-semibold text-slate-900 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
              {home.virtualization.footnote}
            </p>
          </div>
          <VirtualizationDemo />
        </div>
      </section>

      {/* Features Section — tiered hierarchy */}
      <section className="py-24 bg-slate-50 dark:bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {home.features.heading}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              {home.features.subheading}
            </p>
          </div>

          {/* Top 3: Stat-driven highlight cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {home.features.highlights.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/5 dark:hover:shadow-black/10"
              >
                <div className="flex items-baseline gap-1 mb-3">
                  <span
                    className={`text-4xl font-bold tabular-nums tracking-tight ${highlightColors[index]}`}
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
            {home.features.more.map((title, index) => (
              <div
                key={title}
                className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400"
              >
                <span className={moreFeatureMarks[index].color}>
                  {moreFeatureMarks[index].icon}
                </span>
                {title}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why "ReelKit"? Section */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {home.why.heading}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {home.why.reelTerm}
            </span>{' '}
            {home.why.reelBody}
          </p>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {home.why.kitTerm}
            </span>{' '}
            {home.why.kitBody}
          </p>
        </div>
      </section>

      {/* Code Example Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {home.api.heading}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              {home.api.subheading}
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
              {home.packages.heading}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              {home.packages.subheading}
            </p>
          </div>

          {/* Core — the foundation */}
          <div className="max-w-lg mx-auto mb-6">
            <div className="relative p-6 rounded-2xl border-2 border-primary-400 dark:border-primary-500 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-950/40 dark:to-accent-950/30 shadow-lg shadow-primary-500/10">
              <span className="absolute -top-3 left-6 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-widest bg-primary-500 text-white rounded-full">
                {home.packages.coreBadge}
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
                {home.packages.coreDescription}
              </p>
            </div>
          </div>

          {/* Framework bindings — vertical stacked tree */}
          <div className="max-w-3xl mx-auto space-y-0">
            {bindings.map(({ key, framework, pkg, color, extensions }, i) => (
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
                      {home.packages.bindings[key]}
                    </span>
                  </div>

                  {/* Extension packages as inline chips */}
                  <div className="flex flex-wrap gap-2 mt-3 ml-7">
                    {extensions.map((ext) => (
                      <a
                        key={ext.name}
                        href={`https://www.npmjs.com/package/${ext.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-${color}-200 dark:border-${color}-800 bg-white dark:bg-slate-800/60 text-xs hover:border-${color}-400 dark:hover:border-${color}-600 transition-colors`}
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
                      </a>
                    ))}
                  </div>
                </div>

                {i < bindings.length - 1 && (
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
            {home.cta.heading}
          </h2>
          <p className="text-slate-400 text-lg mb-8">{home.cta.body}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={gettingStarted}
              className="px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
            >
              {home.cta.readDocs}
            </Link>
            <GitHubStarButton variant="on-dark" />
          </div>
        </div>
      </section>
    </div>
  );
}
