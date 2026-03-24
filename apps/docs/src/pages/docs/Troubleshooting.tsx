import { CodeBlock } from '../../components/ui/CodeBlock';

export default function Troubleshooting() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Troubleshooting</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Common issues and fixes, especially on iOS Safari.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">iOS Safari</h2>

        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Viewport doesn't fill screen / bottom black space
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                100vh
              </code>{' '}
              doesn't account for Safari's collapsible address bar. Use{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                100dvh
              </code>{' '}
              (dynamic viewport height) instead:
            </p>
            <CodeBlock
              code={`.slider-container {
  height: 100dvh; /* not 100vh */
}`}
              language="css"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">
              Horizontal scroll / content overflow
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              Avoid{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                100vw
              </code>{' '}
              — it includes scrollbar width and can extend past the viewport on
              iOS. Use{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                100%
              </code>{' '}
              instead. Also lock horizontal overflow on the body:
            </p>
            <CodeBlock
              code={`html, body {
  overflow-x: hidden;
}

.slider-container {
  width: 100%; /* not 100vw */
}`}
              language="css"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">
              Pull-to-refresh / rubber-band bounce
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              Safari's pull-to-refresh and elastic bounce interfere with
              vertical swipe gestures. Disable both:
            </p>
            <CodeBlock
              code={`html, body {
  overscroll-behavior: none;
}`}
              language="css"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">
              Pinch-to-zoom interferes with gestures
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              For full-screen slider apps, disable zoom so pinch and double-tap
              don't fire during swipes:
            </p>
            <CodeBlock
              code={`<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />`}
              language="html"
            />
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
              <strong>Note:</strong>{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                viewport-fit=cover
              </code>{' '}
              extends the layout into the Dynamic Island / notch safe area.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">
              Layout broken after keyboard dismisses
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              When the iOS keyboard hides, Safari sometimes doesn't restore the
              viewport height. Reset on blur:
            </p>
            <CodeBlock
              code={`// React
<input
  onBlur={() => {
    window.scrollTo(0, 0);
    apiRef.current?.adjust();
  }}
/>

// Angular
(blur)="onInputBlur()"

onInputBlur() {
  window.scrollTo(0, 0);
  this.reelApi?.adjust();
}`}
              language="tsx"
            />
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">General</h2>

        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Slides render at 0×0 size
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              The slider measures its container via{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                ResizeObserver
              </code>
              . If the container has no CSS-defined size, measurement returns
              0×0 and no slides render. Either pass an explicit{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                size
              </code>{' '}
              prop or ensure the container has dimensions via CSS:
            </p>
            <CodeBlock
              code={`/* The parent must have a height for auto-sizing to work */
.slider-container {
  width: 100%;
  height: 100dvh;
}`}
              language="css"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
