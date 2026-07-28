import { CodeBlock } from '../../../components/ui/CodeBlock';
import { Heading } from '../../../components/ui/Heading';
import { ukPageMeta } from '../../../i18n/pageMeta';

export const meta = () =>
  ukPageMeta({
    path: '/docs/troubleshooting',
    title: 'Усунення несправностей · ReelKit',
    description:
      'Типові проблеми та їх розв’язання: iOS Safari, відтворення відео, навігація з клавіатури й загальні пастки інтеграції.',
  });

// Headings keep the English slug as an explicit id — the generator is
// ascii-only, so a translated heading would produce an empty anchor.

export default function Troubleshooting() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Усунення несправностей</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Розв’язання проблем iOS Safari, відтворення відео, повного екрана та
          навігації з клавіатури.
        </p>
      </div>

      <section className="mb-12">
        <Heading level={2} id="ios-safari" className="text-2xl font-bold mb-4">
          iOS Safari
        </Heading>

        <div className="space-y-8">
          <div>
            <Heading
              level={3}
              id="viewport-doesn-t-fill-screen-bottom-black-space"
              className="text-lg font-semibold mb-2"
            >
              Область перегляду не заповнює екран / чорна смуга внизу
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              Панель адреси Safari, що згортається, робить{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                100vh
              </code>{' '}
              вищим за видиму область. Використовуйте{' '}
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
            <Heading
              level={3}
              id="horizontal-scroll-content-overflow"
              className="text-lg font-semibold mb-2"
            >
              Горизонтальне прокручування / вміст виходить за межі
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                100vw
              </code>{' '}
              враховує ширину смуги прокручування на iOS, і вміст виходить за
              край. Використовуйте{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                100%
              </code>{' '}
              і заблокуйте горизонтальне переповнення:
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
            <Heading
              level={3}
              id="pull-to-refresh-rubber-band-bounce"
              className="text-lg font-semibold mb-2"
            >
              Оновлення потягуванням / пружний відскок
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              Оновлення потягуванням і пружний відскок у Safari конфліктують із
              вертикальними свайпами. У жодному разі <strong>не</strong> ставте{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                overscroll-behavior: none
              </code>{' '}
              на{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                html, body
              </code>
              . Це вимикає звичайне прокручування сторінки. ReelPlayerOverlay,
              LightboxOverlay і StoriesPlayerOverlay роблять це на власних
              контейнерах. Для власних макетів обмежте область дії:
            </p>
            <CodeBlock
              code={`.slider-container {
  overscroll-behavior: none;
}`}
              language="css"
            />
            <p className="text-slate-600 dark:text-slate-400 mt-3 mb-3">
              <strong>Крайній випадок SwipeToClose вниз.</strong> Будь-який{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                SwipeToClose
              </code>{' '}
              з{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                direction="down"
              </code>{' '}
              (Lightbox, плеєр історій, власні оверлеї) перехоплюється в iOS
              Safari — браузер запускає оновлення потягуванням на рівні
              документа раніше, ніж обгортка побачить дотик. Оверлей блокує
              прокручування body, але вертикальні жести в корені лишаються за
              браузером. Обмежте{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                overscroll-behavior-y: contain
              </code>{' '}
              на{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                {'<html>'}
              </code>{' '}
              лише поки оверлей відкритий, і поверніть як було на закритті:
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
            <Heading
              level={3}
              id="pinch-to-zoom-interferes-with-gestures"
              className="text-lg font-semibold mb-2"
            >
              Масштабування щипком заважає жестам
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              Вимкніть масштабування, щоб щипок і подвійний дотик не
              спрацьовували під час свайпів:
            </p>
            <CodeBlock
              code={`<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />`}
              language="html"
            />
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                viewport-fit=cover
              </code>{' '}
              розширює ваш макет у безпечну зону Dynamic Island / вирізу.
            </p>
          </div>

          <div>
            <Heading
              level={3}
              id="layout-broken-after-keyboard-dismisses"
              className="text-lg font-semibold mb-2"
            >
              Макет ламається після приховування клавіатури
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              Іноді Safari лишає область перегляду стиснутою після закриття
              клавіатури. Скиньте її на blur:
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
        <Heading level={2} id="general" className="text-2xl font-bold mb-4">
          Загальне
        </Heading>

        <div className="space-y-8">
          <div>
            <Heading
              level={3}
              id="slides-render-at-0-0-size"
              className="text-lg font-semibold mb-2"
            >
              Слайди рендеряться розміром 0×0
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              Без пропса{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                size
              </code>{' '}
              слайдер читає розміри контейнера через{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                ResizeObserver
              </code>
              . Контейнер без висоти в CSS має розмір 0×0, тож нічого не
              рендериться. Передайте{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                size
              </code>{' '}
              або задайте контейнеру розміри:
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
        <Heading level={2} id="video" className="text-2xl font-bold mb-4">
          Відео
        </Heading>

        <div className="space-y-8">
          <div>
            <Heading
              level={3}
              id="video-doesn-t-autoplay"
              className="text-lg font-semibold mb-2"
            >
              Відео не відтворюється автоматично
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              Браузери блокують автовідтворення зі звуком. ReelKit виставляє{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                muted
              </code>{' '}
              і{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                playsInline
              </code>{' '}
              на кожному відеоелементі. Відео починається без звуку; користувач
              вмикає його перемикачем після дотику. Перевірте, чи не
              перевизначаєте ці атрибути у власному слайді.
            </p>
          </div>

          <div>
            <Heading
              level={3}
              id="video-thumbnail-frame-capture-is-blank"
              className="text-lg font-semibold mb-2"
            >
              Мініатюра відео / знімок кадру порожній
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              Знімок кадру малює відео на{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                {'<canvas>'}
              </code>
              . Відео з іншого джерела «забруднює» canvas, і малювання тихо не
              спрацьовує. Ваш CDN для відео має повертати заголовки CORS:
            </p>
            <CodeBlock
              code={`Access-Control-Allow-Origin: *`}
              language="text"
            />
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
              ReelKit виставляє{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                crossOrigin="anonymous"
              </code>{' '}
              за замовчуванням. Якщо використовуєте власний відеоелемент,
              додайте його самі.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} id="fullscreen" className="text-2xl font-bold mb-4">
          Повний екран
        </Heading>

        <div className="space-y-8">
          <div>
            <Heading
              level={3}
              id="fullscreen-button-does-nothing-on-safari"
              className="text-lg font-semibold mb-2"
            >
              Кнопка повного екрана нічого не робить у Safari
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              ReelKit вимикає Fullscreen API в Safari. iOS Safari дозволяє
              повний екран лише для{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                {'<video>'}
              </code>{' '}
              елементів. Десктопний Safari ламає{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                position: fixed
              </code>{' '}
              оверлеї в повному екрані: елементи втрачають контекст накладання
              або зникають.{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                requestFullscreen()
              </code>{' '}
              у Safari завершується без жодної дії.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <Heading
          level={2}
          id="keyboard-navigation"
          className="text-2xl font-bold mb-4"
        >
          Навігація з клавіатури
        </Heading>

        <div className="space-y-8">
          <div>
            <Heading
              level={3}
              id="arrow-keys-don-t-navigate-after-providing-onnavkeypress"
              className="text-lg font-semibold mb-2"
            >
              Стрілки не гортають після передавання onNavKeyPress
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                onNavKeyPress
              </code>{' '}
              <strong>замінює</strong> стандартну навігацію з клавіатури.
              ReelKit перестає викликати{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                next()
              </code>
              /
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                prev()
              </code>{' '}
              і передає керування вам. Викликайте їх самі:
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
            <Heading
              level={3}
              id="escape-key-doesn-t-close-the-overlay"
              className="text-lg font-semibold mb-2"
            >
              Клавіша Escape не закриває оверлей
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              Контролер клавіатури обробляє лише стрілки. ReelPlayerOverlay і
              LightboxOverlay слухають Escape окремо. Якщо будуєте власний
              оверлей, додайте власний обробник Escape у{' '}
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
