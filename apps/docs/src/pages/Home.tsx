import { Link } from 'react-router-dom';
import { Github, Zap, Layers, Smartphone, Keyboard, Infinity, MousePointer } from 'lucide-react';
import { CodeBlock } from '../components/ui/CodeBlock';
import './Home.css';

const features = [
  {
    icon: <Layers size={24} />,
    title: 'Framework Agnostic',
    description: 'Core logic works with any framework. Official React bindings available.',
  },
  {
    icon: <Smartphone size={24} />,
    title: 'Touch First',
    description: 'Native touch gestures with momentum scrolling and snap points.',
  },
  {
    icon: <Infinity size={24} />,
    title: 'Virtualized',
    description: 'Handle 10,000+ items efficiently. Only 3 slides rendered to DOM at any time.',
  },
  {
    icon: <Zap size={24} />,
    title: 'Performant',
    description: 'Optimized animations with requestAnimationFrame. No layout thrashing.',
  },
  {
    icon: <Keyboard size={24} />,
    title: 'Keyboard Navigation',
    description: 'Full keyboard support with Arrow keys, Home, End, and Page Up/Down.',
  },
  {
    icon: <MousePointer size={24} />,
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
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="hero-icon">⚡</span>
            reelkit
          </h1>
          <p className="hero-tagline">
            Single-item slider for TikTok/Instagram-style experiences
          </p>
          <p className="hero-description">
            A framework-agnostic <strong>one-item-at-a-time</strong> slider library.
            Perfect for vertical video feeds, story viewers, and fullscreen galleries.
            Built for touch devices with virtualization for infinite lists.
          </p>
          <div className="hero-buttons">
            <Link to="/docs/getting-started" className="btn btn-primary">
              Get Started
            </Link>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              <Github size={18} />
              GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Install Section */}
      <section className="install-section">
        <div className="install-content">
          <div className="install-tabs">
            <span className="install-label">npm</span>
          </div>
          <pre className="install-code">
            <code>npm install @reelkit/react</code>
          </pre>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Features</h2>
        <div className="features-grid">
          {features.map((feature) => (
            <div key={feature.title} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Code Example Section */}
      <section className="code-section">
        <h2 className="section-title">Simple API</h2>
        <p className="section-description">
          Get started with just a few lines of code
        </p>
        <CodeBlock code={codeExample} />
      </section>

      {/* Packages Section */}
      <section className="packages-section">
        <h2 className="section-title">Available Packages</h2>
        <div className="packages-grid">
          <div className="package-card">
            <h3 className="package-name">@reelkit/core</h3>
            <p className="package-description">Framework-agnostic core with all slider logic</p>
          </div>
          <div className="package-card">
            <h3 className="package-name">@reelkit/react</h3>
            <p className="package-description">React components and hooks</p>
          </div>
          <div className="package-card">
            <h3 className="package-name">@reelkit/react-reel-player</h3>
            <p className="package-description">Full-screen Instagram/TikTok-style player</p>
          </div>
          <div className="package-card">
            <h3 className="package-name">@reelkit/react-lightbox</h3>
            <p className="package-description">Full-screen image gallery lightbox</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2 className="cta-title">Ready to get started?</h2>
        <p className="cta-description">
          Check out the documentation and examples to build your first slider.
        </p>
        <div className="cta-buttons">
          <Link to="/docs/getting-started" className="btn btn-primary">
            Read the Docs
          </Link>
          <Link to="/docs/examples/basic" className="btn btn-secondary">
            View Examples
          </Link>
        </div>
      </section>
    </div>
  );
}
