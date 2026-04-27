import { CodeBlock } from '../../components/ui/CodeBlock';
import { Heading } from '../../components/ui/Heading';

export default function Troubleshooting() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Troubleshooting</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Fixes for iOS Safari quirks, video playback, fullscreen, and keyboard
          navigation.
        </p>
      </div>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          iOS Safari
        </Heading>

        <div className="space-y-8">
          <div>
            <Heading level={3} className="text-lg font-semibold mb-2">
              Viewport doesn't fill screen / bottom black space
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              Safari's collapsible address bar makes{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                100vh
              </code>{' '}
              taller than the visible area. Use{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                100dvh
              </code>
              :
            </p>
            <CodeBlock
              code={`.slider-container {
  height: 100dvh; /* not 100vh */
}`}
              language="css"
            />
          </div>

          <div>
            <Heading level={3} className="text-lg font-semibold mb-2">
              Horizontal scroll / content overflow
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                100vw
              </code>{' '}
              includes scrollbar width on iOS, pushing content past the edge.
              Use{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                100%
              </code>{' '}
              and lock horizontal overflow:
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
            <Heading level={3} className="text-lg font-semibold mb-2">
              Pull-to-refresh / rubber-band bounce
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              Safari's pull-to-refresh and elastic bounce fight vertical swipe
              gestures. Do <strong>not</strong> put{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                overscroll-behavior: none
              </code>{' '}
              on{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                html, body
              </code>
              . That kills normal page scroll. ReelPlayerOverlay,
              LightboxOverlay, and StoriesPlayerOverlay handle this on their own
              containers. For custom layouts, scope it:
            </p>
            <CodeBlock
              code={`.slider-container {
  overscroll-behavior: none;
}`}
              language="css"
            />
            <p className="text-slate-600 dark:text-slate-400 mt-3 mb-3">
              <strong>SwipeToClose downward edge case.</strong> Any{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                SwipeToClose
              </code>{' '}
              with{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                direction="down"
              </code>{' '}
              (lightbox, stories player, custom overlays) is preempted on iOS
              Safari — the browser fires pull-to-refresh from the document level
              before the wrapper sees the touch. The overlay locks body scroll
              but the browser still owns vertical-pan handling at the root.
              Scope{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                overscroll-behavior-y: contain
              </code>{' '}
              on{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                {'<html>'}
              </code>{' '}
              only while the overlay is open and restore on close:
            </p>
            <CodeBlock
              code={`useEffect(() => {
  if (!isOpen) return;
  const html = document.documentElement;
  const prev = html.style.overscrollBehaviorY;
  html.style.overscrollBehaviorY = 'contain';
  return () => {
    html.style.overscrollBehaviorY = prev;
  };
}, [isOpen]);`}
              language="tsx"
            />
          </div>

          <div>
            <Heading level={3} className="text-lg font-semibold mb-2">
              Pinch-to-zoom interferes with gestures
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              Disable zoom to stop pinch and double-tap from firing during
              swipes:
            </p>
            <CodeBlock
              code={`<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />`}
              language="html"
            />
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                viewport-fit=cover
              </code>{' '}
              extends your layout into the Dynamic Island / notch safe area.
            </p>
          </div>

          <div>
            <Heading level={3} className="text-lg font-semibold mb-2">
              Layout broken after keyboard dismisses
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              Safari sometimes leaves the viewport compressed after the keyboard
              closes. Force a reset on blur:
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
        <Heading level={2} className="text-2xl font-bold mb-4">
          General
        </Heading>

        <div className="space-y-8">
          <div>
            <Heading level={3} className="text-lg font-semibold mb-2">
              Slides render at 0×0 size
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              Without a{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                size
              </code>{' '}
              prop, the slider reads its container dimensions through{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                ResizeObserver
              </code>
              . A container with no CSS height measures 0×0, so nothing renders.
              Pass{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                size
              </code>{' '}
              or give the container dimensions:
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

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Video
        </Heading>

        <div className="space-y-8">
          <div>
            <Heading level={3} className="text-lg font-semibold mb-2">
              Video doesn't autoplay
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              Browsers block unmuted autoplay. ReelKit sets{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                muted
              </code>{' '}
              and{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                playsInline
              </code>{' '}
              on every video element. Videos start muted; users unmute with the
              sound toggle after a tap. Check that you're not overriding these
              attributes in a custom slide.
            </p>
          </div>

          <div>
            <Heading level={3} className="text-lg font-semibold mb-2">
              Video thumbnail / frame capture is blank
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              Frame capture draws the video onto a{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                {'<canvas>'}
              </code>
              . Cross-origin videos taint the canvas, so the draw silently
              fails. Your video CDN must return CORS headers:
            </p>
            <CodeBlock
              code={`Access-Control-Allow-Origin: *`}
              language="text"
            />
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
              ReelKit sets{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                crossOrigin="anonymous"
              </code>{' '}
              by default. If you use a custom video element, add it yourself.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Fullscreen
        </Heading>

        <div className="space-y-8">
          <div>
            <Heading level={3} className="text-lg font-semibold mb-2">
              Fullscreen button does nothing on Safari
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              ReelKit disables the Fullscreen API on Safari. iOS Safari
              restricts fullscreen to{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                {'<video>'}
              </code>{' '}
              elements only. Desktop Safari breaks{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                position: fixed
              </code>{' '}
              overlays in fullscreen: elements lose stacking context or vanish.{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                requestFullscreen()
              </code>{' '}
              resolves as a no-op on Safari.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Keyboard Navigation
        </Heading>

        <div className="space-y-8">
          <div>
            <Heading level={3} className="text-lg font-semibold mb-2">
              Arrow keys don't navigate after providing onNavKeyPress
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                onNavKeyPress
              </code>{' '}
              <strong>replaces</strong> default keyboard navigation. ReelKit
              stops calling{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                next()
              </code>
              /
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                prev()
              </code>{' '}
              and hands control to you. Call them yourself:
            </p>
            <CodeBlock
              code={`<Reel
  onNavKeyPress={(increment) => {
    // Your custom logic here
    console.log('Nav key:', increment);
    // You must trigger navigation yourself:
    apiRef.current?.[increment === 1 ? 'next' : 'prev']();
  }}
/>`}
              language="tsx"
            />
          </div>

          <div>
            <Heading level={3} className="text-lg font-semibold mb-2">
              Escape key doesn't close the overlay
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              The keyboard controller handles arrow keys only. ReelPlayerOverlay
              and LightboxOverlay listen for Escape separately. If you build a
              custom overlay, add your own Escape handler in{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                onClose
              </code>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
