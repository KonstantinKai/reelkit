import { Link } from 'react-router-dom';
import { Callout } from '../../../components/ui/Callout';
import { CodeBlock } from '../../../components/ui/CodeBlock';
import { Sandbox } from '../../../components/ui/Sandbox';
import { FeatureCardGrid } from '../../../components/ui/FeatureCard';
import { StoriesPlayerDemo } from '../../../components/demos/StoriesPlayerDemo';
import {
  Zap,
  Play,
  Layout,
  Clock,
  Timer,
  Image,
  Monitor,
  Settings,
  Code,
  Layers,
  Heart,
  Circle,
  Link2,
} from 'lucide-react';
import { Heading } from '../../../components/ui/Heading';
import { zhPageMeta } from '../../../i18n/pageMeta';

export const meta = () =>
  zhPageMeta({
    path: '/docs/stories-player',
    title: 'React Stories Player · ReelKit',
    description:
      '全屏 Stories 播放浮层：StoriesApi、双击点赞、自定义 Story 类型、进度条与主题定制。',
  });

// Headings carry the English slug as an explicit id — the slug generator
// is ascii-only, so a Chinese heading would produce an empty anchor.

const fullCode = `import { useState, useMemo } from 'react';
import {
  StoriesOverlay,
  StoriesRingList,
  type StoriesGroup,
} from '@reelkit/react-stories-player';
import '@reelkit/react-stories-player/styles.css';

const groups: StoriesGroup[] = [
  {
    author: {
      id: 'user-1',
      name: 'Alice',
      avatar: '/cdn/samples/avatars/avatar-06.jpg',
      verified: true,
    },
    stories: [
      {
        id: 's1-1',
        mediaType: 'image',
        src: '/cdn/samples/images/stories/story-001.jpg',
      },
      {
        id: 's1-2',
        mediaType: 'image',
        src: '/cdn/samples/images/stories/story-002.jpg',
      },
      {
        id: 's1-3',
        mediaType: 'image',
        src: '/cdn/samples/images/stories/story-003.jpg',
      },
    ],
  },
  {
    author: {
      id: 'user-2',
      name: 'Bob',
      avatar: '/cdn/samples/avatars/avatar-07.jpg',
    },
    stories: [
      {
        id: 's2-1',
        mediaType: 'image',
        src: '/cdn/samples/images/stories/story-004.jpg',
      },
      {
        id: 's2-2',
        mediaType: 'image',
        src: '/cdn/samples/images/stories/story-005.jpg',
      },
    ],
  },
  {
    author: {
      id: 'user-3',
      name: 'Charlie',
      avatar: '/cdn/samples/avatars/avatar-08.jpg',
      verified: true,
    },
    stories: [
      {
        id: 's3-1',
        mediaType: 'image',
        src: '/cdn/samples/images/stories/story-006.jpg',
      },
    ],
  },
];

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(0);
  const viewedState = useMemo(() => new Map<string, number>(), []);

  const openStories = (groupIndex: number) => {
    setSelectedGroup(groupIndex);
    setIsOpen(true);
  };

  return (
    <div style={{ padding: 16, background: '#0f172a', minHeight: '100vh' }}>
      <StoriesRingList
        groups={groups}
        viewedState={viewedState}
        onSelect={openStories}
      />

      <StoriesOverlay
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        groups={groups}
        initialGroupIndex={selectedGroup}
        onStoryViewed={(gi, si) => {
          const author = groups[gi].author;
          const current = viewedState.get(author.id) ?? 0;
          viewedState.set(author.id, Math.max(current, si + 1));
        }}
      />
    </div>
  );
}`;

const storiesOverlayProps = [
  {
    prop: 'isOpen',
    type: 'boolean',
    default: '必填',
    description: '控制浮层的显示。为 true 时会锁住 body 滚动。',
  },
  {
    prop: 'groups',
    type: 'StoriesGroup<T>[]',
    default: '必填',
    description: '要展示的 story 分组数组',
  },
  {
    prop: 'onClose',
    type: '() => void',
    default: '必填',
    description: '关闭浮层的回调',
  },
  {
    prop: 'ariaLabel',
    type: 'string',
    default: "'Stories player'",
    description: '对话框区域的无障碍标签；浮层打开时由屏幕阅读器播报',
  },
  {
    prop: 'initialGroupIndex',
    type: 'number',
    default: '0',
    description: '初始可见分组的索引（从 0 开始）',
  },
  {
    prop: 'initialStoryIndex',
    type: 'number',
    default: '0',
    description: '分组内初始可见 story 的索引（从 0 开始）',
  },
  {
    prop: 'groupTransition',
    type: 'TransitionTransformFn',
    default: 'cubeTransition',
    description: '外层（分组）滑动器的过渡效果',
  },
  {
    prop: 'defaultImageDuration',
    type: 'number',
    default: '5000',
    description: '图片类 story 的默认自动播放时长（毫秒）',
  },
  {
    prop: 'tapZoneSplit',
    type: 'number',
    default: '0.3',
    description:
      '\u70b9\u51fb\u533a\u57df\u7684\u5206\u5272\u6bd4\u4f8b\uff080\u20131\uff09\u3002\u5de6\u4fa7\u89e6\u53d1\u4e0a\u4e00\u4e2a\uff0c\u53f3\u4fa7\u89e6\u53d1\u4e0b\u4e00\u4e2a\u3002',
  },
  {
    prop: 'hideUIOnPause',
    type: 'boolean',
    default: 'true',
    description: '长按暂停时是否隐藏 story 界面（页眉、页脚）',
  },
  {
    prop: 'enableKeyboard',
    type: 'boolean',
    default: 'true',
    description: '启用键盘导航（左右方向键、Escape）',
  },
  {
    prop: 'innerTransitionDuration',
    type: 'number',
    default: '200',
    description: '内层（story）过渡动画的时长（毫秒）',
  },
  {
    prop: 'minSegmentWidth',
    type: 'number',
    default: '8',
    description: '进度条分段的最小宽度（像素）',
  },
  {
    prop: 'apiRef',
    type: 'MutableRefObject<StoriesApi | null>',
    default: '-',
    description: '用于访问命令式 StoriesApi 的 ref',
  },
  {
    prop: 'renderHeader',
    type: '(props: HeaderRenderProps<T>) => ReactNode',
    default: '-',
    description: '自定义页眉渲染器。接收作者、story 以及暂停 / 静音状态。',
  },
  {
    prop: 'renderFooter',
    type: '(props: FooterRenderProps<T>) => ReactNode',
    default: '-',
    description: '自定义页脚渲染器。接收作者和 story 信息。',
  },
  {
    prop: 'renderSlide',
    type: '(props: SlideRenderProps<T>) => ReactNode',
    default: '-',
    description: '自定义幻灯片渲染器，替换默认的图片 / 视频幻灯片。',
  },
  {
    prop: 'renderNavigation',
    type: '(props: NavigationRenderProps) => ReactNode',
    default: '-',
    description: '自定义桌面端导航。替换默认的上一张 / 下一张箭头按钮。',
  },
  {
    prop: 'renderProgressBar',
    type: '(props: ProgressBarRenderProps<T>) => ReactNode',
    default: '-',
    description: '自定义进度条。替换默认的 canvas 进度条。',
  },
  {
    prop: 'renderLoading',
    type: '(props: LoadingRenderProps<T>) => ReactNode',
    default: '-',
    description: '自定义加载界面渲染器。不提供时显示默认的页眉转圈动画。',
  },
  {
    prop: 'renderError',
    type: '(props: ErrorRenderProps<T>) => ReactNode',
    default: '-',
    description: '自定义错误界面渲染器。不提供时显示默认的错误图标浮层。',
  },
];

const storiesCallbacks = [
  {
    prop: 'onClose',
    type: '() => void',
    description:
      '播放器关闭时调用。在 StoriesOverlay 上是必填的（打开状态归你管，所以关闭也得你处理）；在 StoriesUrlOverlay 上是可选的，那里由 URL 驱动关闭 —— 只在你需要关闭后做点什么时才传。',
  },
  {
    prop: 'onStoryChange',
    type: '(groupIndex: number, storyIndex: number) => void',
    description: '当前 story 变化时触发',
  },
  {
    prop: 'onGroupChange',
    type: '(groupIndex: number) => void',
    description: '当前分组变化时触发',
  },
  {
    prop: 'onStoryViewed',
    type: '(groupIndex: number, storyIndex: number) => void',
    description: '某个 story 变为可见时触发',
  },
  {
    prop: 'onStoryComplete',
    type: '(groupIndex: number, storyIndex: number) => void',
    description: "Fired when a story's timer completes",
  },
  {
    prop: 'onDoubleTap',
    type: '(groupIndex: number, storyIndex: number) => void',
    description: '双击手势时触发',
  },
  {
    prop: 'onPause',
    type: '() => void',
    description: '播放器暂停时触发',
  },
  {
    prop: 'onResume',
    type: '() => void',
    description: '播放器恢复时触发',
  },
];

const storiesApiMethods = [
  {
    method: 'nextStory()',
    type: '() => void',
    description: '在当前分组内前进到下一个 story',
  },
  {
    method: 'prevStory()',
    type: '() => void',
    description: '在当前分组内回到上一个 story',
  },
  {
    method: 'nextGroup()',
    type: '() => void',
    description: '切到下一个用户分组',
  },
  {
    method: 'prevGroup()',
    type: '() => void',
    description: '切到上一个用户分组',
  },
  {
    method: 'goToGroup(index)',
    type: '(index: number) => void',
    description: '按索引跳到指定分组',
  },
  {
    method: 'pause()',
    type: '() => void',
    description: '暂停自动播放和进度计时',
  },
  {
    method: 'resume()',
    type: '() => void',
    description: '恢复自动播放和进度计时',
  },
];

const cssClasses = [
  // Overlay
  {
    className: '.rk-stories-overlay',
    component: 'Overlay',
    description: '固定的全屏背景层（背景、z-index）',
  },
  {
    className: '.rk-stories-swipe-wrapper',
    component: 'Overlay',
    description: '滑动关闭的包装层（容纳导航按钮 + canvas）',
  },
  {
    className: '.rk-stories-container',
    component: 'Overlay',
    description: '圆角的 story 画布（定位、溢出）',
  },
  {
    className: '.rk-stories-ui-layer',
    component: 'Overlay',
    description: '界面浮层容器（页眉、进度、导航）',
  },
  {
    className: '.rk-stories-ui-layer--hidden',
    component: 'Overlay',
    description: '界面隐藏状态（由 hideUIOnPause 切换）',
  },
  {
    className: '.rk-stories-error',
    component: 'Overlay',
    description: '错误状态（居中图标 + 文字）',
  },
  {
    className: '.rk-stories-error-text',
    component: 'Overlay',
    description: '错误信息文字',
  },

  // Navigation
  {
    className: '.rk-stories-nav-btn',
    component: '导航',
    description: '桌面端上一张 / 下一张箭头',
  },

  // ProgressBar
  {
    className: '.rk-stories-progress-bar',
    component: 'ProgressBar',
    description: 'canvas 进度条的定位包装层',
  },

  // Group / Story
  {
    className: '.rk-stories-slide-wrapper',
    component: 'Group',
    description: '一个 story 分组（外层幻灯片）',
  },
  {
    className: '.rk-stories-story',
    component: 'Story',
    description: '单个 story（内层幻灯片根节点）',
  },

  // StoryHeader
  {
    className: '.rk-stories-header',
    component: 'StoryHeader',
    description: '页眉栏（头像、名称、操作）',
  },
  {
    className: '.rk-stories-header--hidden',
    component: 'StoryHeader',
    description: '页眉隐藏状态（visible=false）',
  },
  {
    className: '.rk-stories-header-avatar',
    component: 'StoryHeader',
    description: '作者头像图片',
  },
  {
    className: '.rk-stories-header-name',
    component: 'StoryHeader',
    description: '作者名称文字',
  },
  {
    className: '.rk-stories-header-verified',
    component: 'StoryHeader',
    description: '认证徽章容器',
  },
  {
    className: '.rk-stories-header-time',
    component: 'StoryHeader',
    description: '相对时间文字',
  },
  {
    className: '.rk-stories-header-actions',
    component: 'StoryHeader',
    description: '右侧操作（关闭、静音、暂停）',
  },
  {
    className: '.rk-stories-header-btn',
    component: 'StoryHeader',
    description: '页眉操作按钮',
  },
  {
    className: '.rk-stories-header-spinner',
    component: 'StoryHeader',
    description: '视频缓冲转圈动画',
  },

  // ImageStorySlide
  {
    className: '.rk-stories-image',
    component: 'ImageStorySlide',
    description: '图片 story 元素',
  },

  // VideoStorySlide
  {
    className: '.rk-stories-video',
    component: 'VideoStorySlide',
    description: '视频 story 容器',
  },
  {
    className: '.rk-stories-video-element',
    component: 'VideoStorySlide',
    description: '共享的 <video> 元素',
  },
  {
    className: '.rk-stories-video-poster',
    component: 'VideoStorySlide',
    description: '视频封面图（播放时淡出）',
  },
  {
    className: '.rk-stories-video-poster--visible',
    component: 'VideoStorySlide',
    description: '封面图可见状态（播放前）',
  },

  // HeartAnimation
  {
    className: '.rk-stories-heart',
    component: 'HeartAnimation',
    description: '双击时的爱心弹出动画',
  },

  // StoriesRing
  {
    className: '.rk-stories-ring',
    component: 'StoriesRing',
    description: 'story 圆环（带动画渐变边框的头像）',
  },
  {
    className: '.rk-stories-ring--active',
    component: 'StoriesRing',
    description: '含未读 story 的圆环（会动）',
  },
  {
    className: '.rk-stories-ring-avatar',
    component: 'StoriesRing',
    description: '圆环内部的头像图片',
  },

  // StoriesRingList
  {
    className: '.rk-stories-ring-list',
    component: 'StoriesRingList',
    description: '横向圆环列表容器',
  },
  {
    className: '.rk-stories-ring-list-item',
    component: 'StoriesRingList',
    description: '圆环 + 名称的一列',
  },
  {
    className: '.rk-stories-ring-list-name',
    component: 'StoriesRingList',
    description: '每个圆环下方的作者名称',
  },
];

const themeTokens = [
  // Overlay
  {
    token: '--rk-stories-overlay-bg',
    default: '#000',
    controls: 'Full-screen backdrop color',
  },
  {
    token: '--rk-stories-overlay-z',
    default: '9999',
    controls: 'Overlay z-index',
  },
  {
    token: '--rk-stories-container-radius',
    default: '12px',
    controls: 'Rounded corners on the story canvas (desktop)',
  },
  {
    token: '--rk-stories-swipe-gap',
    default: '16px',
    controls: 'Gap between nav buttons and the story canvas',
  },

  // UI layer + top shade
  {
    token: '--rk-stories-top-shade-height',
    default: '120px',
    controls: 'Top gradient scrim height behind the header',
  },
  {
    token: '--rk-stories-top-shade-bg',
    default: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)',
    controls: 'Top gradient scrim color',
  },
  {
    token: '--rk-stories-ui-transition',
    default: '200ms',
    controls: 'Fade duration when hideUIOnPause toggles',
  },

  // Nav buttons (desktop)
  {
    token: '--rk-stories-nav-size',
    default: '44px',
    controls: 'Desktop prev/next button size',
  },
  {
    token: '--rk-stories-nav-bg',
    default: 'rgba(255, 255, 255, 0.1)',
    controls: 'Desktop nav button background',
  },
  {
    token: '--rk-stories-nav-bg-hover',
    default: 'rgba(255, 255, 255, 0.2)',
    controls: 'Desktop nav button hover background',
  },
  {
    token: '--rk-stories-nav-fg',
    default: 'rgba(255, 255, 255, 0.7)',
    controls: 'Desktop nav button icon color',
  },
  {
    token: '--rk-stories-nav-fg-hover',
    default: '#fff',
    controls: 'Desktop nav button hover icon color',
  },

  // Error state
  {
    token: '--rk-stories-error-bg',
    default: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    controls: 'Error state background gradient',
  },
  {
    token: '--rk-stories-error-fg',
    default: 'rgba(255, 255, 255, 0.5)',
    controls: 'Error icon and text color',
  },
  {
    token: '--rk-stories-error-text-size',
    default: '13px',
    controls: 'Error message font size',
  },

  // Story media
  {
    token: '--rk-stories-video-bg',
    default: '#000',
    controls: 'Letterbox background behind <video>',
  },
  {
    token: '--rk-stories-video-poster-transition',
    default: '200ms',
    controls: 'Poster fade duration when the video starts playing',
  },

  // Story header
  {
    token: '--rk-stories-header-top',
    default: '18px',
    controls: 'Vertical offset of the header from the top of the story',
  },
  {
    token: '--rk-stories-header-padding',
    default: '12px 16px',
    controls: 'Inner padding of the header row',
  },
  {
    token: '--rk-stories-header-avatar-size',
    default: '32px',
    controls: 'Avatar width/height',
  },
  {
    token: '--rk-stories-header-name-fg',
    default: '#fff',
    controls: 'Author name color',
  },
  {
    token: '--rk-stories-header-name-size',
    default: '14px',
    controls: 'Author name font size',
  },
  {
    token: '--rk-stories-header-time-fg',
    default: 'rgba(255, 255, 255, 0.6)',
    controls: 'Time-ago text color',
  },
  {
    token: '--rk-stories-header-btn-fg',
    default: '#fff',
    controls: 'Header action icon color (close, mute, pause)',
  },

  // Heart animation (double-tap like)
  {
    token: '--rk-stories-heart-duration',
    default: '800ms',
    controls: 'Pop-in/fade-out animation duration',
  },

  // Ring (avatar with animated border)
  {
    token: '--rk-stories-ring-spin-duration',
    default: '4s',
    controls: 'Active ring gradient rotation duration',
  },

  // Ring list (horizontal feed above the player)
  {
    token: '--rk-stories-ring-list-gap',
    default: '12px',
    controls: 'Spacing between rings in the list',
  },
  {
    token: '--rk-stories-ring-list-padding',
    default: '12px',
    controls: 'Inner padding around the ring list',
  },
  {
    token: '--rk-stories-ring-list-name-size',
    default: '12px',
    controls: 'Author name font size below each ring',
  },
];

export default function StoriesPlayerPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Stories Player</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          一个面向 React 的 Instagram 风格 Stories 播放浮层，基于{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react-stories-player
          </code>
          .
        </p>
        <a
          href="https://react-demo.reelkit.dev/stories-player?utm_source=docs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
        >
          查看在线演示 &rarr;
        </a>
      </div>

      {/* Features */}
      <section className="mb-12">
        <Heading level={2} id="features" className="text-2xl font-bold mb-4">
          特性
        </Heading>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FeatureCardGrid
            items={[
              {
                icon: Zap,
                label: '嵌套导航',
                desc: '点击切换 story，滑动切换分组',
              },
              {
                icon: Play,
                label: '视频 story',
                desc: '自动播放，带声音开关',
              },
              {
                icon: Timer,
                label: '自动播放',
                desc: '每个 story 可配置计时',
              },
              {
                icon: Layout,
                label: '3D 过渡',
                desc: '立方体、翻转、淡入、缩放、滑动',
              },
              {
                icon: Clock,
                label: '进度条',
                desc: '基于 canvas 的分段进度',
              },
              {
                icon: Image,
                label: '图片与视频',
                desc: '两种媒体类型都支持',
              },
              {
                icon: Layers,
                label: '虚拟化',
                desc: 'DOM 里只有 3 张幻灯片',
              },
              {
                icon: Heart,
                label: '双击点赞',
                desc: '双击时的爱心动画',
              },
              {
                icon: Monitor,
                label: '桌面端导航',
                desc: '桌面端的箭头按钮',
              },
              {
                icon: Circle,
                label: 'story 圆环',
                desc: 'Instagram 风格的头像圆环',
              },
              {
                icon: Code,
                label: '泛型类型',
                desc: '用自定义数据扩展 StoryItem',
              },
              {
                icon: Settings,
                label: 'Render Props',
                desc: '每个界面元素都可定制',
              },
              {
                icon: Link2,
                label: 'URL 状态',
                desc: '可分享的 ?story=group.story 链接',
              },
            ]}
          />
        </div>
      </section>

      {/* Installation */}
      <section className="mb-12">
        <Heading
          level={2}
          id="installation"
          className="text-2xl font-bold mb-4"
        >
          安装
        </Heading>
        <CodeBlock
          code="npm i @reelkit/react-stories-player @reelkit/react lucide-react"
          language="bash"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">
          别忘了引入样式：
        </p>
        <CodeBlock
          code={`import '@reelkit/react-stories-player/styles.css';`}
          language="typescript"
        />
        <Callout type="info" title="图标" className="mt-4">
          默认页眉使用{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            lucide-react
          </code>{' '}
          作为图标。如果你想换一套图标库，可以用{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            renderHeader
          </code>{' '}
          和{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            renderNavigation
          </code>{' '}
          提供自己的实现。
        </Callout>
      </section>

      {/* Sandbox */}
      <section className="mb-12">
        <Heading level={2} id="quick-start" className="text-2xl font-bold mb-4">
          快速上手
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          {' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            StoriesOverlay
          </code>{' '}
          组件渲染一个全屏 Stories Player。搭配{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            StoriesRingList
          </code>{' '}
          作为 Instagram 风格的入口。传入一组{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            StoriesGroup
          </code>{' '}
          对象，并用{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            isOpen
          </code>
          .
        </p>
        <CodeBlock code={fullCode} language="tsx" />
      </section>

      {/* Live Demo */}
      <section className="mb-12">
        <Heading level={2} id="live-demo" className="text-2xl font-bold mb-4">
          在线演示
        </Heading>
        <Sandbox
          code={fullCode}
          title="StoriesPlayer.tsx"
          height={200}
          stackblitzDeps={['@reelkit/react-stories-player', '@reelkit/react']}
        >
          <StoriesPlayerDemo />
        </Sandbox>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          点圆环打开播放器。点左右两侧切换 story，滑动切换用户。
        </p>
      </section>

      {/* URL State */}
      <section className="mb-12">
        <Heading level={2} id="url-state" className="text-2xl font-bold mb-4">
          URL 状态
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            StoriesUrlOverlay
          </code>{' '}
          是一个独立组件，它的打开状态存放在地址栏里。两条轴共用一个参数 ——{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ?story=&lt;group&gt;.&lt;story&gt;
          </code>{' '}
          —— 于是正在播放的 story 就有了可分享、可收藏、能用返回键关闭的链接。用{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            useOverlayUrlState
          </code>{' '}
          和{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            urlIndexTwoAxisKey
          </code>
          构建控制器，再作为{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            controller
          </code>
          .
        </p>
        <Callout type="info" title="内置的 key" className="mb-4">
          Stories 是双轴的，所以请把双轴 key 展开进控制器：{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            urlIndexTwoAxisKey
          </code>{' '}
          （分组和 story 都按位置）或{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            urlStableIdTwoAxisKey
          </code>{' '}
          （分组按稳定的{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            id
          </code>
          ）—— 两者都从{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react
          </code>
          . See the{' '}
          <Link
            to="/zh/docs/core/guide#url-state"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            URL 状态指南
          </Link>{' '}
          和{' '}
          <Link
            to="/zh/docs/core/api#url-state"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            核心 API
          </Link>
          .
        </Callout>
        <CodeBlock
          code={`import {
  StoriesUrlOverlay,
  useOverlayUrlState,
  urlIndexTwoAxisKey,
} from '@reelkit/react-stories-player';
import { Link } from 'react-router-dom';

const stories = useOverlayUrlState({
  param: 'story',
  ...urlIndexTwoAxisKey({
    outerCount: () => groups.length,
    innerCounts: () => groups.map((g) => g.stories.length),
  }),
});

// Opening a user is a link — the overlay reads the URL and opens itself.
{groups.map((g, i) => (
  <Link key={g.author.id} to={\`?story=\${i}.0\`}>{g.author.name}</Link>
))}

<StoriesUrlOverlay controller={stories} groups={groups} />`}
          language="tsx"
        />
        <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400 mt-4 mb-4">
          <li>
            打开时压入 <strong>一条</strong> 历史记录。滑动 story <em>和</em>{' '}
            切换用户都是 <strong>替换</strong> 它，因此导航 N
            次也不会多出记录，退一步永远就是关闭播放器。返回键关闭播放器，不会逐个后退
            story。
          </li>
          <li>
            <strong>内层导航也会被记录。</strong> story
            索引不会被冻结在分组粒度上 —— 在某个用户的 story 之间前进时会更新{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              ?story=2.<em>n</em>
            </code>{' '}
            ，因此深链能精确落到那一个 story。
          </li>
          <li>
            只有在应用内部打开播放器时返回键才会关闭它 ——
            因为那次链接压入了一条记录。在新标签页里直接打开的分享链接背后没有历史，浏览器返回会离开站点；这时用
            ✕ 按钮或 Escape 就地移除参数并留在页面上。
          </li>
          <li>
            指向不存在的分组或 story 的参数 ——
            过期的书签、手改的值、超出分组末尾的 story —— 会从 URL
            中移除，而不是打开相邻的那个。
          </li>
        </ul>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>带路由的应用 —— 请传入适配器。</strong> 绕过路由器直接写{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            history.pushState
          </code>{' '}
          会让它的 location 过期，下一次导航就会把参数丢掉：
        </p>
        <CodeBlock
          code={`import { useReactRouterUrlAdapter } from '@reelkit/react/react-router-url-adapter';

const adapter = useReactRouterUrlAdapter();
const stories = useOverlayUrlState({
  param: 'story',
  adapter,
  ...urlIndexTwoAxisKey({
    outerCount: () => groups.length,
    innerCounts: () => groups.map((g) => g.stories.length),
  }),
});

<StoriesUrlOverlay controller={stories} groups={groups} />`}
          language="tsx"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          <strong>稳定的链接。</strong> 分组默认是按位置的，所以收藏下来的{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ?story=2.0
          </code>{' '}
          在信息流重新排序后就会打开另一个用户。请改用稳定 id 来寻址分组 ——{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            outerCodec
          </code>{' '}
          把 id 写进 URL，{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            outerLocator
          </code>{' '}
          负责找到它在哪。story 那一半仍然是解析出的分组内的普通索引。
        </p>
        <CodeBlock
          code={`const stories = useOverlayUrlState({
  param: 'story',
  ...urlIndexTwoAxisKey({
    outerCount: () => groups.length,
    innerCounts: () => groups.map((g) => g.stories.length),
    // ?story=user_42.3
    outerCodec: { decode: (raw) => raw, encode: (id) => id },
    outerLocator: {
      locate: (id) => groups.findIndex((g) => g.author.id === id),
      identify: (index) => groups[index].author.id,
    },
  }),
});`}
          language="tsx"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-4">
          <strong>无限信息流。</strong> 翻页是{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            outerLocator
          </code>{' '}
          该管的事，与编解码器无关。{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locate
          </code>{' '}
          是同步的，因此只能回答已经加载过的分组 —— 只加载了 20 个时，指向第 400
          个分组的分享链接就查不到。{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locateAsync
          </code>{' '}
          是兜底，只有在{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locate
          </code>{' '}
          未命中时才调用；story 会以最终落到的那个分组重新校准上界。
        </p>
        <Callout
          type="info"
          title="同一个 locateAsync，作用在外层轴"
          className="mb-4"
        >
          这和单轴 key 接受的{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locateAsync
          </code>{' '}
          翻页器是同一个 —— 在双轴 key 上它跟随你传入的{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            outerLocator
          </code>{' '}
          ，因此分组这条轴负责翻页，而 story 仍是解析出的分组内的局部索引。
        </Callout>
        <CodeBlock
          code={`const stories = useOverlayUrlState({
  param: 'story',
  ...urlIndexTwoAxisKey({
    outerCount: () => groups.length,
    innerCounts: () => groups.map((g) => g.stories.length),
    outerLocator: {
      locate: (index) => (index < groups.length ? index : null),
      identify: (index) => index,
      locateAsync: async (index) => {
        const loaded = await loadUntilGroup(index); // page up to it
        if (!loaded) return null; // exhausted — link names no group
        setGroups(loaded); // commit — the overlay renders from this state
        return index;
      },
    },
  }),
});`}
          language="tsx"
        />
        <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400 mt-4">
          <li>
            在{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              locateAsync
            </code>{' '}
            未完成期间，播放器保持关闭，参数也不动，因此深链能熬过这次请求。返回{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              null
            </code>{' '}
            或请求被拒绝则会移除参数。
          </li>
          <li>
            如果结果在 URL
            已经变化、播放器已关闭或组件已卸载之后才到达，就会被丢弃 ——
            慢请求不能打开一个没人要的 story。
          </li>
          <li>
            完整的{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              useOverlayUrlState
            </code>{' '}
            选项见{' '}
            <Link
              to="/zh/docs/react/api#useoverlayurlstate"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              React API 参考
            </Link>
            ，完整讲解见{' '}
            <Link
              to="/zh/docs/react/guide#url-state"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              React 指南
            </Link>
            .
          </li>
        </ul>
      </section>

      {/* Props Table */}
      <section className="mb-12">
        <Heading
          level={2}
          id="api-reference"
          className="text-2xl font-bold mb-4"
        >
          API 参考
        </Heading>

        <Heading
          level={3}
          id="storiesoverlayprops"
          className="text-xl font-semibold mt-6 mb-4"
        >
          StoriesOverlayProps
        </Heading>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-mono">
          StoriesOverlayProps&lt;T&gt;
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">属性</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">默认值</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              {storiesOverlayProps.map((p) => (
                <tr
                  key={p.prop}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {p.prop}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {p.type}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-sm">
                    {p.default}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {p.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Heading
          level={3}
          id="storiesurloverlayprops"
          className="text-xl font-semibold mt-8 mb-4"
        >
          StoriesUrlOverlayProps
        </Heading>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-mono">
          StoriesUrlOverlayProps&lt;T&gt;
        </p>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          接受{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            StoriesOverlay
          </code>{' '}
          的所有属性，除了打开状态那三个 ——{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            isOpen
          </code>
          ,{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            initialGroupIndex
          </code>
          ,{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            initialStoryIndex
          </code>{' '}
          —— 它们改由控制器提供。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">属性</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">默认值</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  controller
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  UrlStateController&lt;TwoAxisPosition&gt;
                </td>
                <td className="py-3 px-4 text-slate-500 text-sm">必填</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  来自 useOverlayUrlState 并展开了 urlIndexTwoAxisKey
                  的控制器。它的 position —— 一个 {'{ outer, inner }'} 对象 ——
                  决定播放器是否打开、打开到哪里；浮层会在每次导航和关闭时写回。
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Heading
          level={3}
          id="callbacks"
          className="text-xl font-semibold mt-8 mb-4"
        >
          回调
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">属性</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              {storiesCallbacks.map((p) => (
                <tr
                  key={p.prop}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {p.prop}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {p.type}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {p.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Transitions */}
      <section className="mb-12">
        <Heading level={2} id="transitions" className="text-2xl font-bold mb-4">
          过渡动画
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          {' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            groupTransition
          </code>{' '}
          属性控制在用户分组之间滑动时的 3D 过渡效果。过渡函数请从{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react
          </code>
          :
        </p>
        <CodeBlock
          code={`import {
  cubeTransition,   // default \u2014 3D cube rotation
  flipTransition,   // card flip
  fadeTransition,   // crossfade
  zoomTransition,   // zoom in/out
  slideTransition,  // horizontal slide
} from '@reelkit/react';

<StoriesOverlay
  isOpen={isOpen}
  onClose={handleClose}
  groups={groups}
  groupTransition={flipTransition}
/>`}
          language="tsx"
        />
      </section>

      {/* Content Loading Lifecycle */}
      <section className="mb-12">
        <Heading
          level={2}
          id="content-loading-lifecycle"
          className="text-2xl font-bold mb-4"
        >
          内容加载生命周期
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          每个 story 幻灯片都通过{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            SlideRenderProps
          </code>
          :
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">回调</th>
                <th className="text-left py-3 px-4 font-semibold">何时</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onReady
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  内容就绪（图片已加载、视频在播放）。进度计时开始。
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onWaiting
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  内容卡住（视频播放途中缓冲）。显示转圈动画并暂停计时。
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onError
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  内容加载失败。显示错误浮层。
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onDurationReady
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  上报媒体的真实时长（例如来自视频元数据），以便用正确的时长重启计时。
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onEnded
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  表示媒体已播完（例如视频结束）。会前进到下一个 story。
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout type="info" title="预加载缓存" className="mt-4">
          内置的{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ImageStorySlide
          </code>{' '}
          和{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            VideoStorySlide
          </code>{' '}
          组件会在后台预加载下一个 story。用户切到已预加载的 story
          时，内容会立刻出现，不会有加载动画。
        </Callout>
      </section>

      {/* Render Props */}
      <section className="mb-12">
        <Heading
          level={2}
          id="render-props"
          className="text-2xl font-bold mb-4"
        >
          Render Props
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          每个界面元素都可以通过 render props
          替换。每个都会收到带类型的属性，包含所需的全部状态和回调。
        </p>

        <Heading
          level={3}
          id="renderheader"
          className="text-xl font-semibold mt-6 mb-4"
        >
          renderHeader
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          替换默认页眉（作者信息、暂停 / 静音按钮、关闭按钮）：
        </p>
        <CodeBlock
          code={`<StoriesOverlay
  isOpen={isOpen}
  onClose={handleClose}
  groups={groups}
  renderHeader={({ author, story, isPaused, isMuted, isVideo, onToggleSound, onTogglePause, onClose }) => (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      padding: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      zIndex: 10,
    }}>
      <img src={author.avatar} style={{ width: 32, height: 32, borderRadius: '50%' }} />
      <span style={{ color: '#fff', fontWeight: 600 }}>{author.name}</span>
      {isVideo && <button onClick={onToggleSound}>{isMuted ? 'Unmute' : 'Mute'}</button>}
      <button onClick={onClose} style={{ marginLeft: 'auto' }}>Close</button>
    </div>
  )}
/>`}
          language="tsx"
        />

        <Heading
          level={3}
          id="renderfooter"
          className="text-xl font-semibold mt-8 mb-4"
        >
          renderFooter
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          在 story 内容下方加一个页脚：
        </p>
        <CodeBlock
          code={`<StoriesOverlay
  isOpen={isOpen}
  onClose={handleClose}
  groups={groups}
  renderFooter={({ author, story, storyIndex }) => (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
      color: '#fff',
      zIndex: 10,
    }}>
      <span>{author.name} \u2014 Story {storyIndex + 1}</span>
    </div>
  )}
/>`}
          language="tsx"
        />

        <Heading
          level={3}
          id="renderslide"
          className="text-xl font-semibold mt-8 mb-4"
        >
          renderSlide
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          完全替换默认的图片 / 视频幻灯片。可以用{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ImageStorySlide
          </code>{' '}
          和{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            VideoStorySlide
          </code>{' '}
          这些子组件来复用内置的媒体处理：
        </p>
        <CodeBlock
          code={`import {
  StoriesOverlay,
  ImageStorySlide,
  VideoStorySlide,
} from '@reelkit/react-stories-player';

<StoriesOverlay
  isOpen={isOpen}
  onClose={handleClose}
  groups={groups}
  renderSlide={({ story, index, groupIndex, size, activeGroupIndex, activeStoryIndex, onDurationReady, onReady, onWaiting, onError, onEnded }) => {
    const [w, h] = size;

    if (story.mediaType === 'video') {
      return (
        <div style={{ width: w, height: h, background: '#000' }}>
          <VideoStorySlide
            src={story.src}
            poster={story.poster}
            groupIndex={groupIndex}
            storyIndex={index}
            activeGroupIndex={activeGroupIndex}
            activeStoryIndex={activeStoryIndex}
            onDurationReady={onDurationReady}
            onPlaying={onReady}
            onWaiting={onWaiting}
            onEnded={onEnded}
            onError={onError}
          />
        </div>
      );
    }

    return (
      <div style={{ width: w, height: h, background: '#000' }}>
        <ImageStorySlide src={story.src} onLoad={onReady} onError={onError} />
      </div>
    );
  }}
/>`}
          language="tsx"
        />

        <Heading
          level={3}
          id="rendernavigation"
          className="text-xl font-semibold mt-8 mb-4"
        >
          renderNavigation
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          替换默认的桌面端箭头按钮：
        </p>
        <CodeBlock
          code={`<StoriesOverlay
  isOpen={isOpen}
  onClose={handleClose}
  groups={groups}
  renderNavigation={({ onPrevStory, onNextStory, onPrevGroup, onNextGroup }) => (
    <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 8, zIndex: 10 }}>
      <button onClick={onPrevGroup}>Prev Group</button>
      <button onClick={onPrevStory}>Prev</button>
      <button onClick={onNextStory}>Next</button>
      <button onClick={onNextGroup}>Next Group</button>
    </div>
  )}
/>`}
          language="tsx"
        />

        <Heading
          level={3}
          id="renderprogressbar"
          className="text-xl font-semibold mt-8 mb-4"
        >
          renderProgressBar
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          用自定义实现替换默认的 canvas 进度条。{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            progress
          </code>{' '}
          信号发出 0 到 1 的值：
        </p>
        <CodeBlock
          code={`import { Observe } from '@reelkit/react';

<StoriesOverlay
  isOpen={isOpen}
  onClose={handleClose}
  groups={groups}
  renderProgressBar={({ totalStories, activeIndex, progress }) => (
    <div style={{ display: 'flex', gap: 4, padding: '8px 16px' }}>
      {Array.from({ length: totalStories }, (_, i) => (
        <div key={i} style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.3)', borderRadius: 1, overflow: 'hidden' }}>
          <Observe signals={[activeIndex, progress]}>
            {() => {
              const fill = i < activeIndex.value ? 1 : i === activeIndex.value ? progress.value : 0;
              return <div style={{ width: \`\${fill * 100}%\`, height: '100%', background: '#fff' }} />;
            }}
          </Observe>
        </div>
      ))}
    </div>
  )}
/>`}
          language="tsx"
        />

        <Heading
          level={3}
          id="renderloading"
          className="text-xl font-semibold mt-8 mb-4"
        >
          renderLoading
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          内容加载期间的自定义加载提示：
        </p>
        <CodeBlock
          code={`<StoriesOverlay
  isOpen={isOpen}
  onClose={handleClose}
  groups={groups}
  renderLoading={({ story, storyIndex, groupIndex }) => (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
    }}>
      <span>Loading story {storyIndex + 1}...</span>
    </div>
  )}
/>`}
          language="tsx"
        />

        <Heading
          level={3}
          id="rendererror"
          className="text-xl font-semibold mt-8 mb-4"
        >
          renderError
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          内容加载失败时的自定义错误浮层：
        </p>
        <CodeBlock
          code={`<StoriesOverlay
  isOpen={isOpen}
  onClose={handleClose}
  groups={groups}
  renderError={({ story, storyIndex, groupIndex }) => (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      color: '#fff',
      background: 'rgba(0,0,0,0.8)',
    }}>
      <span style={{ fontSize: 48 }}>!</span>
      <span>Failed to load story</span>
    </div>
  )}
/>`}
          language="tsx"
        />
      </section>

      {/* StoriesApi */}
      <section className="mb-12">
        <Heading level={2} id="storiesapi" className="text-2xl font-bold mb-4">
          StoriesApi
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use the{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            apiRef
          </code>{' '}
          属性做命令式控制：
        </p>
        <CodeBlock
          code={`import { useRef } from 'react';
import { StoriesOverlay, type StoriesApi } from '@reelkit/react-stories-player';

function App() {
  const apiRef = useRef<StoriesApi | null>(null);

  return (
    <>
      <button onClick={() => apiRef.current?.nextStory()}>Next Story</button>
      <button onClick={() => apiRef.current?.nextGroup()}>Next Group</button>
      <button onClick={() => apiRef.current?.pause()}>Pause</button>

      <StoriesOverlay
        isOpen={isOpen}
        onClose={handleClose}
        groups={groups}
        apiRef={apiRef}
      />
    </>
  );
}`}
          language="tsx"
        />

        <Heading
          level={3}
          id="methods"
          className="text-xl font-semibold mt-8 mb-4"
        >
          方法
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">方法</th>
                <th className="text-left py-3 px-4 font-semibold">类型</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              {storiesApiMethods.map((m) => (
                <tr
                  key={m.method}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {m.method}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {m.type}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {m.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Double-Tap & Likes */}
      <section className="mb-12">
        <Heading
          level={2}
          id="double-tap-likes"
          className="text-2xl font-bold mb-4"
        >
          双击与点赞
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          双击时会播放内置的爱心动画，给出即时的视觉反馈。{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            onDoubleTap
          </code>{' '}
          回调会带上分组和 story
          索引，你可以据此把点赞存进自己的状态里（调接口、本地存储等等）。播放器内部并不管理点赞状态。
        </p>

        <CodeBlock
          code={`<StoriesOverlay
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  groups={groups}
  onDoubleTap={(groupIndex, storyIndex) => {
    // Built-in heart animation plays automatically.
    // Handle the like in your own state:
    const story = groups[groupIndex].stories[storyIndex];
    toggleLike(story.id);
  }}
/>`}
          language="tsx"
        />

        <Heading
          level={3}
          id="customizing-the-heart-animation"
          className="text-xl font-semibold mt-8 mb-4"
        >
          定制爱心动画
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          通过{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            --rk-stories-heart-duration
          </code>{' '}
          变量调整动画速度（见{' '}
          <Link
            to={{ hash: '#theming' }}
            className="text-primary-500 hover:text-primary-600 font-medium"
          >
            主题定制
          </Link>
          ）。要改颜色、尺寸或者干脆隐藏爱心，请直接针对{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            .rk-stories-heart
          </code>{' '}
          类。{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            HeartAnimation
          </code>{' '}
          组件也单独导出，可以独立使用。
        </p>

        <CodeBlock
          code={`/* Speed up the pop via the token */
:root {
  --rk-stories-heart-duration: 1s;
}

/* Restyle color and size via the class */
.rk-stories-heart {
  color: #ff3b5c;
  font-size: 80px;
}

/* Or hide the built-in heart entirely */
.rk-stories-heart {
  display: none;
}`}
          language="css"
        />

        <Callout type="info" className="mt-4">
          内置的爱心动画目前还不能通过 render prop 替换。你可以用 CSS
          改样式，或者用{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            display: none
          </code>{' '}
          把它隐藏，然后在{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            onDoubleTap
          </code>{' '}
          回调里做自己的动画。如果你需要一个{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            renderDoubleTap
          </code>{' '}
          render prop，欢迎通过{' '}
          <a
            href="https://github.com/KonstantinKai/reelkit/issues"
            className="text-primary-600 dark:text-primary-400 underline"
          >
            GitHub Issues
          </a>
          .
        </Callout>
      </section>

      {/* Sub-Components */}
      <section className="mb-12">
        <Heading
          level={2}
          id="sub-components"
          className="text-2xl font-bold mb-4"
        >
          子组件
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          对外导出的可复用积木，用于在自定义 render props 中组合：
        </p>

        <Heading
          level={3}
          id="canvasprogressbar"
          className="text-lg font-semibold mt-6 mb-2"
        >
          CanvasProgressBar
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          基于 canvas 的高性能分段进度条。为每个 story 渲染一段，并用{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            requestAnimationFrame
          </code>
          为当前段做填充动画。story 很多的分组会启用滑动窗口。
        </p>
        <CodeBlock
          code={`import { CanvasProgressBar } from '@reelkit/react-stories-player';

<CanvasProgressBar
  totalStories={group.stories.length}
  activeIndex={activeIndexSignal}
  progress={progressSignal}
  minSegmentWidth={8}
  gap={2}
  barHeight={2}
/>`}
          language="tsx"
        />

        <Heading
          level={3}
          id="storyheader"
          className="text-lg font-semibold mt-6 mb-2"
        >
          StoryHeader
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          默认页眉，包含作者头像、名称、认证徽章、相对时间、暂停 /
          播放开关、静音开关、加载动画和关闭按钮。未提供{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderHeader
          </code>{' '}
          时自动使用。
        </p>
        <CodeBlock
          code={`import { StoryHeader } from '@reelkit/react-stories-player';

<StoryHeader
  author={{ id: '1', name: 'Alice', avatar: '/avatar.jpg', verified: true }}
  createdAt={new Date(Date.now() - 3600_000)}
  onClose={handleClose}
  isPaused={false}
  onTogglePause={togglePause}
  isMuted={true}
  onToggleSound={toggleSound}
  isVideo={true}
  isLoading={false}
/>`}
          language="tsx"
        />

        <Heading
          level={3}
          id="imagestoryslide"
          className="text-lg font-semibold mt-6 mb-2"
        >
          ImageStorySlide
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          铺满的图片幻灯片，使用{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            object-fit: cover
          </code>
          。通过回调上报加载 / 错误状态以便跟踪生命周期。
        </p>
        <CodeBlock
          code={`import { ImageStorySlide } from '@reelkit/react-stories-player';

<ImageStorySlide
  src="/photo.jpg"
  aspectRatio={9 / 16}
  onLoad={() => console.log('loaded')}
  onError={() => console.log('failed')}
/>`}
          language="tsx"
        />

        <Heading
          level={3}
          id="videostoryslide"
          className="text-lg font-semibold mt-6 mb-2"
        >
          VideoStorySlide
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          视频幻灯片，使用共享的{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            {'<video>'}
          </code>{' '}
          元素以保证 iOS
          上声音连续。它负责自动播放、封面帧、声音同步，并上报时长和播放生命周期事件。
        </p>
        <CodeBlock
          code={`import { VideoStorySlide } from '@reelkit/react-stories-player';

<VideoStorySlide
  src="/clip.mp4"
  poster="/clip-poster.jpg"
  groupIndex={0}
  storyIndex={2}
  activeGroupIndex={activeGroupSignal}
  activeStoryIndex={activeStorySignal}
  onDurationReady={(ms) => console.log('duration:', ms)}
  onPlaying={() => console.log('playing')}
  onWaiting={() => console.log('buffering')}
  onEnded={() => console.log('ended')}
  onError={() => console.log('error')}
/>`}
          language="tsx"
        />

        <Heading
          level={3}
          id="storiesring"
          className="text-lg font-semibold mt-6 mb-2"
        >
          StoriesRing
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          带 Instagram 风格渐变圆环的圆形头像。分段表示已读 / 未读 story ——
          未读是渐变色，已读是灰色。
        </p>
        <CodeBlock
          code={`import { StoriesRing } from '@reelkit/react-stories-player';

<StoriesRing
  author={{ id: '1', name: 'Alice', avatar: '/avatar.jpg' }}
  totalStories={5}
  viewedCount={2}
  onClick={() => openStories(0)}
/>`}
          language="tsx"
        />

        <Heading
          level={3}
          id="storiesringlist"
          className="text-lg font-semibold mt-6 mb-2"
        >
          StoriesRingList
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          可横向滚动的一排{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            StoriesRing
          </code>{' '}
          组件，带作者名称。每个分组一个圆环。
        </p>
        <CodeBlock
          code={`import { StoriesRingList } from '@reelkit/react-stories-player';

<StoriesRingList
  groups={groups}
  viewedState={viewedMap}
  onSelect={(groupIndex) => openStories(groupIndex)}
/>`}
          language="tsx"
        />

        <Heading
          level={3}
          id="heartanimation"
          className="text-lg font-semibold mt-6 mb-2"
        >
          HeartAnimation
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          双击触发的爱心动画浮层。在 800 毫秒内放大并淡出。可通过 CSS
          定制（见“双击与点赞”一节）。
        </p>
        <CodeBlock
          code={`import { HeartAnimation } from '@reelkit/react-stories-player';

<HeartAnimation onComplete={() => console.log('animation done')} />`}
          language="tsx"
        />
      </section>

      {/* Types */}
      <section className="mb-12">
        <Heading level={2} id="types" className="text-2xl font-bold mb-4">
          类型
        </Heading>

        <Heading
          level={3}
          id="storyitem"
          className="text-lg font-semibold mb-2"
        >
          StoryItem
        </Heading>
        <CodeBlock
          code={`interface StoryItem {
  id: string;
  mediaType: 'image' | 'video';
  src: string;
  poster?: string;
  duration?: number;       // ms, images default to 5000, videos use natural duration
  createdAt?: string | Date;
  aspectRatio?: number;    // width / height
}`}
          language="typescript"
        />

        <Heading
          level={3}
          id="authorinfo"
          className="text-lg font-semibold mt-6 mb-2"
        >
          AuthorInfo
        </Heading>
        <CodeBlock
          code={`interface AuthorInfo {
  id: string;
  name: string;
  avatar: string;
  verified?: boolean;
}`}
          language="typescript"
        />

        <Heading level={3} className="text-lg font-semibold mt-6 mb-2">
          StoriesGroup{'<T>'}
        </Heading>
        <CodeBlock
          code={`interface StoriesGroup<T extends StoryItem = StoryItem> {
  author: AuthorInfo;
  stories: T[];
}`}
          language="typescript"
        />

        <Heading level={3} className="text-lg font-semibold mt-6 mb-2">
          HeaderRenderProps{'<T>'}
        </Heading>
        <CodeBlock
          code={`interface HeaderRenderProps<T extends StoryItem = StoryItem> {
  author: AuthorInfo;
  story: T;
  storyIndex: number;
  isPaused: boolean;
  isMuted: boolean;
  isVideo: boolean;
  onToggleSound: () => void;
  onTogglePause: () => void;
  onClose: () => void;
}`}
          language="typescript"
        />

        <Heading level={3} className="text-lg font-semibold mt-6 mb-2">
          FooterRenderProps{'<T>'}
        </Heading>
        <CodeBlock
          code={`interface FooterRenderProps<T extends StoryItem = StoryItem> {
  author: AuthorInfo;
  story: T;
  storyIndex: number;
}`}
          language="typescript"
        />

        <Heading level={3} className="text-lg font-semibold mt-6 mb-2">
          SlideRenderProps{'<T>'}
        </Heading>
        <CodeBlock
          code={`interface SlideRenderProps<T extends StoryItem = StoryItem> {
  story: T;
  index: number;
  groupIndex: number;
  isActive: boolean;
  size: [number, number];
  activeGroupIndex: Signal<number>;
  activeStoryIndex: Signal<number>;
  onDurationReady: (durationMs: number) => void;
  onReady: () => void;
  onWaiting: () => void;
  onError: () => void;
  onEnded: () => void;
}`}
          language="typescript"
        />

        <Heading
          level={3}
          id="navigationrenderprops"
          className="text-lg font-semibold mt-6 mb-2"
        >
          NavigationRenderProps
        </Heading>
        <CodeBlock
          code={`interface NavigationRenderProps {
  onPrevStory: () => void;
  onNextStory: () => void;
  onPrevGroup: () => void;
  onNextGroup: () => void;
}`}
          language="typescript"
        />

        <Heading level={3} className="text-lg font-semibold mt-6 mb-2">
          ProgressBarRenderProps{'<T>'}
        </Heading>
        <CodeBlock
          code={`interface ProgressBarRenderProps<T extends StoryItem = StoryItem> {
  totalStories: number;
  activeIndex: Signal<number>;
  progress: Signal<number>;
  group: StoriesGroup<T>;
}`}
          language="typescript"
        />

        <Heading level={3} className="text-lg font-semibold mt-6 mb-2">
          LoadingRenderProps{'<T>'}
        </Heading>
        <CodeBlock
          code={`interface LoadingRenderProps<T extends StoryItem = StoryItem> {
  story: T;
  storyIndex: number;
  groupIndex: number;
}`}
          language="typescript"
        />

        <Heading level={3} className="text-lg font-semibold mt-6 mb-2">
          ErrorRenderProps{'<T>'}
        </Heading>
        <CodeBlock
          code={`interface ErrorRenderProps<T extends StoryItem = StoryItem> {
  story: T;
  storyIndex: number;
  groupIndex: number;
}`}
          language="typescript"
        />

        <Heading
          level={3}
          id="storiesapi"
          className="text-lg font-semibold mt-6 mb-2"
        >
          StoriesApi
        </Heading>
        <CodeBlock
          code={`interface StoriesApi {
  nextStory(): void;
  prevStory(): void;
  nextGroup(): void;
  prevGroup(): void;
  goToGroup(index: number): void;
  pause(): void;
  resume(): void;
}`}
          language="typescript"
        />
      </section>

      {/* Custom Story Types */}
      <section className="mb-12">
        <Heading
          level={2}
          id="custom-story-types"
          className="text-2xl font-bold mb-4"
        >
          自定义 Story 类型
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          扩展{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            StoryItem
          </code>{' '}
          ，加上自定义字段，再把类型参数传给{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            StoriesOverlay
          </code>
          。所有 render props 都会收到你扩展后的类型：
        </p>
        <CodeBlock
          code={`import {
  StoriesOverlay,
  ImageStorySlide,
  type StoryItem,
  type StoriesGroup,
  type SlideRenderProps,
} from '@reelkit/react-stories-player';

interface PromoStory extends StoryItem {
  title: string;
  subtitle?: string;
  bgGradient?: string;
  ctaText?: string;
}

const groups: StoriesGroup<PromoStory>[] = [
  {
    author: { id: 'brand', name: 'My Brand', avatar: '/brand.png', verified: true },
    stories: [
      {
        id: 'promo-1',
        mediaType: 'image',
        src: '/sale-banner.jpg',
        title: 'Flash Sale',
        subtitle: 'Up to 50% off',
        ctaText: 'Shop Now',
      },
      {
        id: 'promo-2',
        mediaType: 'image',
        src: '',
        title: 'Thank You',
        subtitle: '10K followers!',
        bgGradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)',
      },
    ],
  },
];

function CustomSlide({ story, size, onReady, onError }: SlideRenderProps<PromoStory>) {
  const [w, h] = size;
  const hasImage = story.src && story.mediaType === 'image';

  return (
    <div style={{ width: w, height: h, background: story.bgGradient ?? '#000', position: 'relative' }}>
      {hasImage && <ImageStorySlide src={story.src} onLoad={onReady} onError={onError} />}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: 32, color: '#fff' }}>
        <h2>{story.title}</h2>
        {story.subtitle && <p>{story.subtitle}</p>}
        {story.ctaText && (
          <button style={{ marginTop: 16, padding: '8px 24px', borderRadius: 20, background: '#fff', color: '#000', border: 'none' }}>
            {story.ctaText}
          </button>
        )}
      </div>
    </div>
  );
}

<StoriesOverlay<PromoStory>
  isOpen={isOpen}
  onClose={handleClose}
  groups={groups}
  renderSlide={(props) => <CustomSlide {...props} />}
/>`}
          language="tsx"
        />
      </section>

      {/* CSS Classes */}
      <section className="mb-12">
        <Heading level={2} id="css-classes" className="text-2xl font-bold mb-4">
          CSS 类名
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          所有 CSS 类名都是普通类名（不是 CSS Modules），因此可以在{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react-stories-player/styles.css
          </code>
          之后加载的样式表里用更高优先级的选择器覆盖它们。若只是改颜色、尺寸和
          z-index，请优先使用下面{' '}
          <Link
            to={{ hash: '#theming' }}
            className="text-primary-500 hover:text-primary-600 font-medium"
          >
            主题定制
          </Link>{' '}
          一节。
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">类名</th>
                <th className="text-left py-3 px-4 font-semibold">组件</th>
                <th className="text-left py-3 px-4 font-semibold">说明</th>
              </tr>
            </thead>
            <tbody>
              {cssClasses.map((c) => (
                <tr
                  key={c.className}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {c.className}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-sm">
                    {c.component}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {c.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="theming" className="mb-12">
        <Heading level={2} id="theming" className="text-2xl font-bold mb-4">
          主题定制
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          每一个颜色、尺寸、z-index 和过渡都放在 CSS 自定义属性里。在{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            :root
          </code>{' '}
          （或浮层的任意祖先元素）上覆盖其中一个或多个，即可在不改组件源码的情况下换主题。
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">变量</th>
                <th className="text-left py-3 px-4 font-semibold">默认值</th>
                <th className="text-left py-3 px-4 font-semibold">控制内容</th>
              </tr>
            </thead>
            <tbody>
              {themeTokens.map((t) => (
                <tr
                  key={t.token}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {t.token}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {t.default}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {t.controls}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-slate-600 dark:text-slate-400 mb-3">
          把下面这段放进在{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react-stories-player/styles.css
          </code>
          .
        </p>

        <CodeBlock
          language="css"
          code={`/* Brand the stories overlay */
:root {
  --rk-stories-overlay-bg: #0f172a;
  --rk-stories-container-radius: 24px;
  --rk-stories-nav-bg: rgba(99, 102, 241, 0.25);
  --rk-stories-nav-bg-hover: rgba(168, 85, 247, 0.55);
  --rk-stories-top-shade-bg: linear-gradient(
    to bottom,
    rgba(99, 102, 241, 0.5) 0%,
    transparent 100%
  );
  --rk-stories-header-name-fg: #fef3c7;
  --rk-stories-ring-spin-duration: 2s;
}`}
        />
      </section>

      {/* Accessibility */}
      <section className="mb-12">
        <Heading
          level={2}
          id="accessibility"
          className="text-2xl font-bold mb-4"
        >
          无障碍
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          浮层根节点是一个模态对话框（
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            role="dialog"
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-modal="true"
          </code>
          ）。设置{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ariaLabel
          </code>{' '}
          可以改变屏幕阅读器的播报内容，默认是 “Stories player”。
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          浮层打开时捕获焦点，关闭时把焦点还给触发元素。Tab 和 Shift+Tab
          在内部的可聚焦元素之间循环；跑出去的焦点（点击外部、程序化聚焦）会被拉回来。实现基于{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            captureFocusForReturn
          </code>{' '}
          和{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            createFocusTrap
          </code>{' '}
          from{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/core
          </code>
          .
        </p>
      </section>

      <section>
        <Heading
          level={2}
          id="keyboard-shortcuts"
          className="text-2xl font-bold mb-4"
        >
          键盘快捷键
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Key</th>
                <th className="text-left py-3 px-4 font-semibold">作用</th>
              </tr>
            </thead>
            <tbody>
              {[
                { key: 'ArrowLeft', action: 'Previous story' },
                { key: 'ArrowRight', action: 'Next story' },
                { key: 'Escape', action: 'Close player' },
              ].map((s) => (
                <tr
                  key={s.key}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {s.key}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {s.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
