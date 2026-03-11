import { CodeBlock } from '../../components/ui/CodeBlock';
import './docs.css';

export default function Installation() {
  return (
    <div className="docs-page">
      <h1 className="docs-title">Installation</h1>
      <p className="docs-description">
        Install reelkit packages and configure your project.
      </p>

      <section className="docs-section">
        <h2>Package Options</h2>
        <p>
          reelkit is available as multiple packages. Choose based on your framework:
        </p>

        <table className="api-table">
          <thead>
            <tr>
              <th>Package</th>
              <th>Description</th>
              <th>Use Case</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>@reelkit/react</code></td>
              <td>React components</td>
              <td>React 18+ applications</td>
            </tr>
            <tr>
              <td><code>@reelkit/react-reel-player</code></td>
              <td>Full-screen vertical reel player</td>
              <td>Instagram/TikTok style player</td>
            </tr>
            <tr>
              <td><code>@reelkit/react-lightbox</code></td>
              <td>Image gallery lightbox</td>
              <td>Full-screen image preview</td>
            </tr>
            <tr>
              <td><code>@reelkit/core</code></td>
              <td>Framework-agnostic core</td>
              <td>Custom integrations</td>
            </tr>
            <tr className="coming-soon-row">
              <td><code>@reelkit/vue</code> <span className="badge-coming-soon">Coming Soon</span></td>
              <td>Vue composables and components</td>
              <td>Vue 3 applications</td>
            </tr>
            <tr className="coming-soon-row">
              <td><code>@reelkit/svelte</code> <span className="badge-coming-soon">Coming Soon</span></td>
              <td>Svelte components</td>
              <td>Svelte 4+ applications</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="docs-section">
        <h2>Bundle Sizes</h2>
        <p>
          All packages are optimized for minimal bundle impact:
        </p>

        <table className="api-table">
          <thead>
            <tr>
              <th>Package</th>
              <th>JS</th>
              <th>JS (gzip)</th>
              <th>CSS</th>
              <th>CSS (gzip)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>@reelkit/core</code></td>
              <td>14.9 kB</td>
              <td>4.9 kB</td>
              <td>-</td>
              <td>-</td>
            </tr>
            <tr>
              <td><code>@reelkit/react</code></td>
              <td>9.1 kB</td>
              <td>3.1 kB</td>
              <td>-</td>
              <td>-</td>
            </tr>
            <tr>
              <td><code>@reelkit/react-reel-player</code></td>
              <td>13.5 kB</td>
              <td>3.9 kB</td>
              <td>1.8 kB</td>
              <td>0.7 kB</td>
            </tr>
            <tr>
              <td><code>@reelkit/react-lightbox</code></td>
              <td>8.9 kB</td>
              <td>2.8 kB</td>
              <td>3.1 kB</td>
              <td>0.8 kB</td>
            </tr>
          </tbody>
        </table>

        <h3>Comparison with Other Libraries</h3>
        <p>
          ReelKit renders only <strong>3 slides to DOM</strong> at any time, efficiently handling 10,000+ items.
          Most other carousel libraries render all slides, which can cause performance issues with large lists.
        </p>

        <table className="api-table">
          <thead>
            <tr>
              <th>Library</th>
              <th>JS (gzip)</th>
              <th>Virtualization</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>ReelKit</strong> (core + react)</td>
              <td>8.0 kB</td>
              <td>✅</td>
              <td>Zero dependencies</td>
            </tr>
            <tr>
              <td>Swiper</td>
              <td>~25 kB</td>
              <td>❌</td>
              <td>Full bundle; tree-shakeable</td>
            </tr>
            <tr>
              <td>Embla Carousel</td>
              <td>~7 kB</td>
              <td>❌</td>
              <td>Lightweight, plugin-based</td>
            </tr>
            <tr>
              <td>keen-slider</td>
              <td>~6 kB</td>
              <td>❌</td>
              <td>Zero dependencies</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="docs-section">
        <h2>npm</h2>
        <CodeBlock lang="bash" code="npm install @reelkit/react" />
      </section>

      <section className="docs-section">
        <h2>yarn</h2>
        <CodeBlock lang="bash" code="yarn add @reelkit/react" />
      </section>

      <section className="docs-section">
        <h2>pnpm</h2>
        <CodeBlock lang="bash" code="pnpm add @reelkit/react" />
      </section>

      <section className="docs-section">
        <h2>Peer Dependencies</h2>
        <p>
          Framework packages have peer dependencies that should already be in your project:
        </p>

        <h3>@reelkit/react</h3>
        <ul>
          <li><code>@reelkit/core</code></li>
          <li><code>react</code> &gt;= 17.0.0</li>
          <li><code>react-dom</code> &gt;= 17.0.0</li>
        </ul>

        <h3>@reelkit/react-reel-player</h3>
        <ul>
          <li><code>react</code> &gt;= 18.0.0</li>
          <li><code>react-dom</code> &gt;= 18.0.0</li>
          <li><code>@reelkit/core</code></li>
          <li><code>@reelkit/react</code></li>
          <li><code>lucide-react</code> &gt;= 0.400.0</li>
        </ul>

        <h3>@reelkit/react-lightbox</h3>
        <ul>
          <li><code>react</code> &gt;= 18.0.0</li>
          <li><code>react-dom</code> &gt;= 18.0.0</li>
          <li><code>@reelkit/core</code></li>
          <li><code>@reelkit/react</code></li>
          <li><code>lucide-react</code> &gt;= 0.400.0</li>
        </ul>
      </section>

      <section className="docs-section">
        <h2>TypeScript</h2>
        <p>
          All packages include TypeScript type definitions. No additional <code>@types</code> packages
          are needed.
        </p>
        <CodeBlock
          title="tsconfig.json"
          lang="json"
          code={`{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "esModuleInterop": true
  }
}`}
        />
      </section>

      <section className="docs-section">
        <h2>Browser Support</h2>
        <p>
          reelkit supports all modern browsers:
        </p>
        <ul>
          <li>Chrome/Edge 88+</li>
          <li>Firefox 78+</li>
          <li>Safari 14+</li>
          <li>iOS Safari 14+</li>
          <li>Android Chrome 88+</li>
        </ul>
      </section>
    </div>
  );
}
