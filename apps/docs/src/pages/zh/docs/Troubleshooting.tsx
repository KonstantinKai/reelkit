import { CodeBlock } from '../../../components/ui/CodeBlock';
import { Heading } from '../../../components/ui/Heading';
import { zhPageMeta } from '../../../i18n/pageMeta';

export const meta = () =>
  zhPageMeta({
    path: '/docs/troubleshooting',
    title: '疑难排查 · ReelKit',
    description:
      '常见问题与修复：iOS Safari、视频播放、键盘导航与通用集成陷阱。',
  });

// Every heading carries the English slug as an explicit id. The slug
// generator keeps ascii only, so a Chinese heading would produce an empty
// anchor and break the deep links the search index already points at.
export default function Troubleshooting() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">疑难排查</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          iOS Safari 的怪癖、视频播放、全屏与键盘导航的修复办法。
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
              视口没有铺满屏幕 / 底部出现黑边
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              Safari 可收起的地址栏会让{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                100vh
              </code>{' '}
              高于实际可见区域。改用{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                100dvh
              </code>
              ：
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
              横向滚动 / 内容溢出
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              在 iOS 上，{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                100vw
              </code>{' '}
              把滚动条宽度也算了进去，内容会被推出屏幕边缘。改用{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                100%
              </code>{' '}
              并锁住横向溢出：
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
              下拉刷新 / 橡皮筋回弹
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              Safari 的下拉刷新和弹性回弹会和竖向滑动手势打架。
              <strong>不要</strong>把{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                overscroll-behavior: none
              </code>{' '}
              加在{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                html, body
              </code>{' '}
              上，那会把正常的页面滚动也一起废掉。ReelPlayerOverlay、
              LightboxOverlay 和 StoriesPlayerOverlay
              会在各自的容器上处理好这件事。自定义布局请把它限定在自己的容器里：
            </p>
            <CodeBlock
              code={`.slider-container {
  overscroll-behavior: none;
}`}
              language="css"
            />
            <p className="text-slate-600 dark:text-slate-400 mt-3 mb-3">
              <strong>SwipeToClose 向下滑动的边界情况。</strong>任何{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                direction="down"
              </code>{' '}
              的{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                SwipeToClose
              </code>
              （Lightbox、Stories Player、自定义浮层）在 iOS Safari
              上都会被抢先处理 ——
              浏览器在包装层看到触摸事件之前，就已经从文档层级触发了下拉刷新。
              浮层虽然锁住了 body 滚动，但根节点的竖向拖拽仍然归浏览器管。
              只在浮层打开期间把{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                overscroll-behavior-y: contain
              </code>{' '}
              限定在{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                {'<html>'}
              </code>{' '}
              上，关闭时再还原：
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
              双指缩放干扰手势
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              关掉缩放，避免滑动过程中触发捏合和双击：
            </p>
            <CodeBlock
              code={`<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />`}
              language="html"
            />
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                viewport-fit=cover
              </code>{' '}
              会把布局延伸到灵动岛 / 刘海的安全区域里。
            </p>
          </div>

          <div>
            <Heading
              level={3}
              id="layout-broken-after-keyboard-dismisses"
              className="text-lg font-semibold mb-2"
            >
              键盘收起后布局错乱
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              键盘关闭后，Safari
              有时会让视口保持被压缩的状态。在失焦时强制重置：
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
          通用
        </Heading>

        <div className="space-y-8">
          <div>
            <Heading
              level={3}
              id="slides-render-at-0-0-size"
              className="text-lg font-semibold mb-2"
            >
              幻灯片渲染出来是 0×0
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              不传{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                size
              </code>{' '}
              属性时，滑动器会通过{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                ResizeObserver
              </code>{' '}
              读取容器尺寸。没有 CSS 高度的容器量出来就是
              0×0，于是什么都渲染不出来。要么传{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                size
              </code>
              ，要么给容器一个尺寸：
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
          视频
        </Heading>

        <div className="space-y-8">
          <div>
            <Heading
              level={3}
              id="video-doesn-t-autoplay"
              className="text-lg font-semibold mb-2"
            >
              视频不自动播放
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              浏览器会拦截非静音的自动播放。ReelKit 给每个 video 元素都设了{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                muted
              </code>{' '}
              和{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                playsInline
              </code>
              。视频以静音开始，用户点一下声音开关就能取消静音。
              请检查自定义幻灯片里有没有覆盖掉这两个属性。
            </p>
          </div>

          <div>
            <Heading
              level={3}
              id="video-thumbnail-frame-capture-is-blank"
              className="text-lg font-semibold mb-2"
            >
              视频缩略图 / 抽帧是空白
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              抽帧是把视频画到{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                {'<canvas>'}
              </code>{' '}
              上。跨域视频会污染画布，绘制会静默失败。你的视频 CDN 必须返回 CORS
              响应头：
            </p>
            <CodeBlock
              code={`Access-Control-Allow-Origin: *`}
              language="text"
            />
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
              ReelKit 默认会设置{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                crossOrigin="anonymous"
              </code>
              。如果你用的是自定义 video 元素，请自己加上。
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} id="fullscreen" className="text-2xl font-bold mb-4">
          全屏
        </Heading>

        <div className="space-y-8">
          <div>
            <Heading
              level={3}
              id="fullscreen-button-does-nothing-on-safari"
              className="text-lg font-semibold mb-2"
            >
              Safari 上全屏按钮没反应
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              ReelKit 在 Safari 上禁用了 Fullscreen API。iOS Safari 只允许{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                {'<video>'}
              </code>{' '}
              元素进入全屏；桌面版 Safari 在全屏状态下会弄坏{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                position: fixed
              </code>{' '}
              的浮层：元素会丢失层叠上下文，或者干脆消失。在 Safari 上，{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                requestFullscreen()
              </code>{' '}
              会当作空操作直接完成。
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
          键盘导航
        </Heading>

        <div className="space-y-8">
          <div>
            <Heading
              level={3}
              id="arrow-keys-don-t-navigate-after-providing-onnavkeypress"
              className="text-lg font-semibold mb-2"
            >
              传了 onNavKeyPress 之后方向键就不翻页了
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                onNavKeyPress
              </code>{' '}
              是<strong>替换</strong>掉默认的键盘导航。ReelKit 不再调用{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                next()
              </code>
              /
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                prev()
              </code>
              ，而是把控制权交给你。需要你自己调用它们：
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
              按 Escape 关不掉浮层
            </Heading>
            <p className="text-slate-600 dark:text-slate-400 mb-3">
              键盘控制器只负责方向键。ReelPlayerOverlay 和 LightboxOverlay
              各自单独监听 Escape。如果你自己写浮层，请在{' '}
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
                onClose
              </code>{' '}
              里加上自己的 Escape 处理。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
