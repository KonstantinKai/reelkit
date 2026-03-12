import { Link } from 'react-router-dom';
import {
  Github,
  Zap,
  Layers,
  Smartphone,
  Keyboard,
  Infinity,
  MousePointer,
  ArrowRight,
  Play,
} from 'lucide-react';
import { CodeBlock } from '../components/ui/CodeBlock';
import logoSvg from '../assets/logo.svg';

const features = [
  {
    icon: <Layers className="w-6 h-6" />,
    title: 'Framework Agnostic',
    description:
      'Core logic works with any framework. Official React bindings available.',
  },
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: 'Touch First',
    description:
      'Native touch gestures with momentum scrolling and snap points.',
  },
  {
    icon: <Infinity className="w-6 h-6" />,
    title: 'Virtualized',
    description:
      'Handle 10,000+ items efficiently. Only 3 slides rendered to DOM at any time.',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Performant',
    description:
      'Optimized animations with requestAnimationFrame. No layout thrashing.',
  },
  {
    icon: <Keyboard className="w-6 h-6" />,
    title: 'Keyboard Navigation',
    description:
      'Full keyboard support with Arrow keys and Escape to close overlays.',
  },
  {
    icon: <MousePointer className="w-6 h-6" />,
    title: 'Wheel Scroll',
    description: 'Optional mouse wheel scrolling with configurable debounce.',
  },
];

const codeExample = `import { Reel, ReelIndicator } from '@reelkit/react';

function App() {
  const items = ['Slide 1', 'Slide 2', 'Slide 3'];

  return (
    <Reel
      count={items.length}
      size={[400, 600]}
      itemBuilder={(index) => (
        <div className="slide">{items[index]}</div>
      )}
    >
      <ReelIndicator count={items.length} />
    </Reel>
  );
}`;

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        {/* Subtle background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary-500/10 via-accent-500/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent-500/10 via-primary-500/5 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 flex items-center justify-center gap-4">
              <img
                src={logoSvg}
                alt=""
                className="w-14 h-14 md:w-20 md:h-20 rounded-2xl shadow-lg shadow-primary-500/25"
              />
              <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
                reelkit
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
              Single-item slider for{' '}
              <span className="text-primary-600 dark:text-primary-400 font-semibold">
                TikTok/Instagram-style
              </span>{' '}
              experiences
            </p>

            <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
              A framework-agnostic <strong>one-item-at-a-time</strong> slider
              library. Perfect for vertical video feeds, story viewers, and
              fullscreen galleries. Built for touch devices with{' '}
              <span className="text-primary-600 dark:text-primary-400 font-semibold">
                virtualization for infinite lists
              </span>
              .
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/docs/getting-started"
                className="btn-primary inline-flex items-center gap-2"
              >
                Get Started
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/docs/react/guide"
                className="btn-secondary inline-flex items-center gap-2"
              >
                <Play size={18} />
                View Examples
              </Link>
            </div>
          </div>

          {/* Install Section */}
          <div className="mt-16 max-w-xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl blur-lg opacity-30" />
              <div className="relative bg-slate-900 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Install via npm
                  </span>
                </div>
                <code className="text-primary-400 font-mono">
                  npm install @reelkit/react
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent" />
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Built with performance and developer experience in mind
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Example Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple API</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Get started with just a few lines of code
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <CodeBlock code={codeExample} language="typescript" />
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Available Packages
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Everything you need to build one-item sliders with React
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: '@reelkit/core',
                desc: 'Framework-agnostic core with all slider logic',
              },
              { name: '@reelkit/react', desc: 'React components and hooks' },
              {
                name: '@reelkit/react-reel-player',
                desc: 'Full-screen Instagram/TikTok-style player',
              },
              {
                name: '@reelkit/react-lightbox',
                desc: 'Full-screen image gallery lightbox',
              },
            ].map((pkg) => (
              <div
                key={pkg.name}
                className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
              >
                <h3 className="font-mono text-sm font-semibold text-primary-600 dark:text-primary-400 mb-2">
                  {pkg.name}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {pkg.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary-600 to-accent-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-primary-100 text-lg mb-8">
            Check out the documentation and examples to build your first slider.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/docs/getting-started"
              className="px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-colors"
            >
              Read the Docs
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary-700 text-white font-semibold rounded-xl hover:bg-primary-800 transition-colors"
            >
              <Github size={20} />
              GitHub
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
