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
import { ukPageMeta } from '../../../i18n/pageMeta';

export const meta = () =>
  ukPageMeta({
    path: '/docs/stories-player',
    title: 'Stories Player для React · ReelKit',
    description:
      'Повноекранний Stories Player: StoriesApi, лайк подвійним дотиком, власні типи Story, смуга прогресу й темізація.',
  });

// Headings keep the English slug as an explicit id — the generator is
// ascii-only, so a translated heading would produce an empty anchor.

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
    default: 'required',
    description:
      'Керує видимістю оверлея. Якщо true, прокручування body заблоковано.',
  },
  {
    prop: 'groups',
    type: 'StoriesGroup<T>[]',
    default: 'required',
    description: 'Масив груп історій для показу',
  },
  {
    prop: 'onClose',
    type: '() => void',
    default: 'required',
    description: 'Колбек для закриття оверлея',
  },
  {
    prop: 'ariaLabel',
    type: 'string',
    default: "'Stories player'",
    description:
      'Доступна назва області діалогу; екранні читачі оголошують її, коли оверлей відкривається',
  },
  {
    prop: 'initialGroupIndex',
    type: 'number',
    default: '0',
    description: 'Індекс початково видимої групи, від нуля',
  },
  {
    prop: 'initialStoryIndex',
    type: 'number',
    default: '0',
    description: 'Індекс початково видимої історії всередині групи, від нуля',
  },
  {
    prop: 'groupTransition',
    type: 'TransitionTransformFn',
    default: 'cubeTransition',
    description: 'Ефект переходу для зовнішнього слайдера груп',
  },
  {
    prop: 'defaultImageDuration',
    type: 'number',
    default: '5000',
    description:
      'Типова тривалість автопереходу для історій-зображень у мілісекундах',
  },
  {
    prop: 'tapZoneSplit',
    type: 'number',
    default: '0.3',
    description:
      'Співвідношення зон дотику (0\u20131). Ліва частина гортає назад, права \u2014 уперед.',
  },
  {
    prop: 'hideUIOnPause',
    type: 'boolean',
    default: 'true',
    description:
      'Чи ховати інтерфейс історії (шапку, підвал) на паузі від довгого натискання',
  },
  {
    prop: 'enableKeyboard',
    type: 'boolean',
    default: 'true',
    description:
      'Вмикає навігацію з клавіатури (стрілки ліворуч і праворуч, Escape)',
  },
  {
    prop: 'innerTransitionDuration',
    type: 'number',
    default: '200',
    description:
      'Тривалість анімації внутрішнього переходу між історіями в мілісекундах',
  },
  {
    prop: 'minSegmentWidth',
    type: 'number',
    default: '8',
    description: 'Мінімальна ширина сегмента смуги прогресу в пікселях',
  },
  {
    prop: 'apiRef',
    type: 'MutableRefObject<StoriesApi | null>',
    default: '-',
    description: 'Ref для доступу до імперативного StoriesApi',
  },
  {
    prop: 'renderHeader',
    type: '(props: HeaderRenderProps<T>) => ReactNode',
    default: '-',
    description:
      'Власний рендерер шапки. Отримує автора, історію, стан паузи та звуку.',
  },
  {
    prop: 'renderFooter',
    type: '(props: FooterRenderProps<T>) => ReactNode',
    default: '-',
    description: 'Власний рендерер підвала. Отримує дані автора та історії.',
  },
  {
    prop: 'renderSlide',
    type: '(props: SlideRenderProps<T>) => ReactNode',
    default: '-',
    description:
      'Власний рендерер слайда, що замінює стандартні слайди із зображенням і відео.',
  },
  {
    prop: 'renderNavigation',
    type: '(props: NavigationRenderProps) => ReactNode',
    default: '-',
    description:
      'Власна навігація для десктопа. Замінює стандартні кнопки-стрілки.',
  },
  {
    prop: 'renderProgressBar',
    type: '(props: ProgressBarRenderProps<T>) => ReactNode',
    default: '-',
    description: 'Власна смуга прогресу. Замінює стандартну смугу на canvas.',
  },
  {
    prop: 'renderLoading',
    type: '(props: LoadingRenderProps<T>) => ReactNode',
    default: '-',
    description:
      'Власний рендерер стану завантаження. Якщо не задано, показується стандартний індикатор у шапці.',
  },
  {
    prop: 'renderError',
    type: '(props: ErrorRenderProps<T>) => ReactNode',
    default: '-',
    description:
      'Власний рендерер стану помилки. Якщо не задано, показується стандартний значок помилки.',
  },
];

const storiesCallbacks = [
  {
    prop: 'onClose',
    type: '() => void',
    description:
      'Викликається, коли плеєр закривається. Обов’язковий у StoriesOverlay (стан відкриття ваш, тож закриття обробляєте ви); необов’язковий у StoriesUrlOverlay, де закриттям керує URL — передавайте лише щоб зреагувати після закриття.',
  },
  {
    prop: 'onStoryChange',
    type: '(groupIndex: number, storyIndex: number) => void',
    description: 'Спрацьовує, коли змінюється активна історія',
  },
  {
    prop: 'onGroupChange',
    type: '(groupIndex: number) => void',
    description: 'Спрацьовує, коли змінюється активна група',
  },
  {
    prop: 'onStoryViewed',
    type: '(groupIndex: number, storyIndex: number) => void',
    description: 'Спрацьовує, коли історія стає видимою',
  },
  {
    prop: 'onStoryComplete',
    type: '(groupIndex: number, storyIndex: number) => void',
    description: 'Спрацьовує, коли завершується таймер історії',
  },
  {
    prop: 'onDoubleTap',
    type: '(groupIndex: number, storyIndex: number) => void',
    description: 'Спрацьовує на подвійний дотик',
  },
  {
    prop: 'onPause',
    type: '() => void',
    description: 'Спрацьовує, коли плеєр на паузі',
  },
  {
    prop: 'onResume',
    type: '() => void',
    description: 'Спрацьовує, коли плеєр продовжує відтворення',
  },
];

const storiesApiMethods = [
  {
    method: 'nextStory()',
    type: '() => void',
    description: 'Перехід до наступної історії в поточній групі',
  },
  {
    method: 'prevStory()',
    type: '() => void',
    description: 'Перехід до попередньої історії в поточній групі',
  },
  {
    method: 'nextGroup()',
    type: '() => void',
    description: 'Перемикає на наступну групу користувача',
  },
  {
    method: 'prevGroup()',
    type: '() => void',
    description: 'Перемикає на попередню групу користувача',
  },
  {
    method: 'goToGroup(index)',
    type: '(index: number) => void',
    description: 'Перехід до конкретної групи за індексом',
  },
  {
    method: 'pause()',
    type: '() => void',
    description: 'Призупиняє автоперехід і таймер прогресу',
  },
  {
    method: 'resume()',
    type: '() => void',
    description: 'Відновлює автоперехід і таймер прогресу',
  },
];

const cssClasses = [
  // Overlay
  {
    className: '.rk-stories-overlay',
    component: 'Overlay',
    description: 'Фіксоване повноекранне тло (фон, z-index)',
  },
  {
    className: '.rk-stories-swipe-wrapper',
    component: 'Overlay',
    description:
      'Обгортка свайпу для закриття (містить кнопки навігації та canvas)',
  },
  {
    className: '.rk-stories-container',
    component: 'Overlay',
    description: 'Заокруглене полотно історії (позиція, переповнення)',
  },
  {
    className: '.rk-stories-ui-layer',
    component: 'Overlay',
    description: 'Контейнер інтерфейсу (шапка, прогрес, навігація)',
  },
  {
    className: '.rk-stories-ui-layer--hidden',
    component: 'Overlay',
    description:
      'Стан прихованого інтерфейсу (перемикається через hideUIOnPause)',
  },
  {
    className: '.rk-stories-error',
    component: 'Overlay',
    description: 'Стан помилки (значок і текст по центру)',
  },
  {
    className: '.rk-stories-error-text',
    component: 'Overlay',
    description: 'Текст повідомлення про помилку',
  },

  // Navigation
  {
    className: '.rk-stories-nav-btn',
    component: 'Навігація',
    description: 'Стрілка вперед або назад на десктопі',
  },

  // ProgressBar
  {
    className: '.rk-stories-progress-bar',
    component: 'ProgressBar',
    description: 'Обгортка позиціювання смуги прогресу на canvas',
  },

  // Group / Story
  {
    className: '.rk-stories-slide-wrapper',
    component: 'Group',
    description: 'Одна група історій (зовнішній слайд)',
  },
  {
    className: '.rk-stories-story',
    component: 'Story',
    description: 'Одна історія (корінь внутрішнього слайда)',
  },

  // StoryHeader
  {
    className: '.rk-stories-header',
    component: 'StoryHeader',
    description: 'Смуга шапки (аватар, ім’я, дії)',
  },
  {
    className: '.rk-stories-header--hidden',
    component: 'StoryHeader',
    description: 'Стан прихованої шапки (visible=false)',
  },
  {
    className: '.rk-stories-header-avatar',
    component: 'StoryHeader',
    description: 'Зображення аватара автора',
  },
  {
    className: '.rk-stories-header-name',
    component: 'StoryHeader',
    description: 'Текст імені автора',
  },
  {
    className: '.rk-stories-header-verified',
    component: 'StoryHeader',
    description: 'Контейнер значка підтвердження',
  },
  {
    className: '.rk-stories-header-time',
    component: 'StoryHeader',
    description: 'Текст «скільки часу тому»',
  },
  {
    className: '.rk-stories-header-actions',
    component: 'StoryHeader',
    description: 'Дії праворуч (закрити, вимкнути звук, пауза)',
  },
  {
    className: '.rk-stories-header-btn',
    component: 'StoryHeader',
    description: 'Кнопка дії в шапці',
  },
  {
    className: '.rk-stories-header-spinner',
    component: 'StoryHeader',
    description: 'Індикатор буферизації відео',
  },

  // ImageStorySlide
  {
    className: '.rk-stories-image',
    component: 'ImageStorySlide',
    description: 'Елемент історії-зображення',
  },

  // VideoStorySlide
  {
    className: '.rk-stories-video',
    component: 'VideoStorySlide',
    description: 'Контейнер історії-відео',
  },
  {
    className: '.rk-stories-video-element',
    component: 'VideoStorySlide',
    description: 'The shared <video> element',
  },
  {
    className: '.rk-stories-video-poster',
    component: 'VideoStorySlide',
    description: 'Постер відео (зникає з початком відтворення)',
  },
  {
    className: '.rk-stories-video-poster--visible',
    component: 'VideoStorySlide',
    description: 'Стан видимого постера (до відтворення)',
  },

  // HeartAnimation
  {
    className: '.rk-stories-heart',
    component: 'HeartAnimation',
    description: 'Анімація сердечка на подвійний дотик',
  },

  // StoriesRing
  {
    className: '.rk-stories-ring',
    component: 'StoriesRing',
    description: 'Кільце історії (аватар з анімованою градієнтною рамкою)',
  },
  {
    className: '.rk-stories-ring--active',
    component: 'StoriesRing',
    description: 'Кільце з непереглянутими історіями (анімується)',
  },
  {
    className: '.rk-stories-ring-avatar',
    component: 'StoriesRing',
    description: 'Зображення аватара всередині кільця',
  },

  // StoriesRingList
  {
    className: '.rk-stories-ring-list',
    component: 'StoriesRingList',
    description: 'Контейнер горизонтального списку кілець',
  },
  {
    className: '.rk-stories-ring-list-item',
    component: 'StoriesRingList',
    description: 'Колонка з кільцем та іменем',
  },
  {
    className: '.rk-stories-ring-list-name',
    component: 'StoriesRingList',
    description: 'Ім’я автора під кожним кільцем',
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
          Оверлей плеєра історій у стилі Instagram для React на основі{' '}
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
          Подивитися демо наживо &rarr;
        </a>
      </div>

      {/* Features */}
      <section className="mb-12">
        <Heading level={2} id="features" className="text-2xl font-bold mb-4">
          Features
        </Heading>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FeatureCardGrid
            items={[
              {
                icon: Zap,
                label: 'Вкладена навігація',
                desc: 'Дотик гортає історії, свайп перемикає групи',
              },
              {
                icon: Play,
                label: 'Історії-відео',
                desc: 'Автовідтворення з перемикачем звуку',
              },
              {
                icon: Timer,
                label: 'Auto-Advance',
                desc: 'Налаштовний таймер для кожної історії',
              },
              {
                icon: Layout,
                label: '3D-переходи',
                desc: 'Куб, переворот, затухання, масштаб, зсув',
              },
              {
                icon: Clock,
                label: 'Смуга прогресу',
                desc: 'Сегментований прогрес на canvas',
              },
              {
                icon: Image,
                label: 'Зображення та відео',
                desc: 'Працює з обома типами медіа',
              },
              {
                icon: Layers,
                label: 'Віртуалізований',
                desc: 'Лише 3 слайди в DOM',
              },
              {
                icon: Heart,
                label: 'Лайк подвійним дотиком',
                desc: 'Анімація сердечка на подвійний дотик',
              },
              {
                icon: Monitor,
                label: 'Навігація на десктопі',
                desc: 'Кнопки-стрілки на десктопі',
              },
              {
                icon: Circle,
                label: 'Кільця історій',
                desc: 'Кільця аватарів у стилі Instagram',
              },
              {
                icon: Code,
                label: 'Узагальнені типи',
                desc: 'Розширюйте StoryItem власними даними',
              },
              {
                icon: Settings,
                label: 'Render Props',
                desc: 'Налаштовуйте кожен елемент інтерфейсу',
              },
              {
                icon: Link2,
                label: 'Стан в URL',
                desc: 'Посилання ?story=group.story, якими можна ділитися',
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
          Встановлення
        </Heading>
        <CodeBlock
          code="npm i @reelkit/react-stories-player @reelkit/react lucide-react"
          language="bash"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">
          Не забудьте імпортувати стилі:
        </p>
        <CodeBlock
          code={`import '@reelkit/react-stories-player/styles.css';`}
          language="typescript"
        />
        <Callout type="info" title="Icons" className="mt-4">
          Стандартна шапка використовує{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            lucide-react
          </code>{' '}
          для іконок. Якщо ви віддаєте перевагу іншій бібліотеці іконок,
          скористайтеся{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            renderHeader
          </code>{' '}
          та{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            renderNavigation
          </code>{' '}
          , щоб передати власні.
        </Callout>
      </section>

      {/* Sandbox */}
      <section className="mb-12">
        <Heading level={2} id="quick-start" className="text-2xl font-bold mb-4">
          Швидкий старт
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            StoriesOverlay
          </code>{' '}
          рендерить повноекранний плеєр історій. Поєднуйте його з{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            StoriesRingList
          </code>{' '}
          для точок входу в стилі Instagram. Передайте масив об’єктів{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            StoriesGroup
          </code>{' '}
          і керуйте видимістю через{' '}
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
          Демо наживо
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
          Натисніть кільце історії, щоб відкрити плеєр. Дотик ліворуч або
          праворуч гортає, свайп перемикає користувачів.
        </p>
      </section>

      {/* URL State */}
      <section className="mb-12">
        <Heading level={2} id="url-state" className="text-2xl font-bold mb-4">
          Стан в URL
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            StoriesUrlOverlay
          </code>{' '}
          — окремий компонент, стан відкриття якого живе в адресному рядку.
          Обидві осі їдуть в одному параметрі —{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ?story=&lt;group&gt;.&lt;story&gt;
          </code>{' '}
          — тож історія, що грає, має посилання, яким можна поділитися, зберегти
          в закладки й закрити кнопкою «назад». Побудуйте контролер через{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            useOverlayUrlState
          </code>{' '}
          та{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            urlIndexTwoAxisKey
          </code>
          , а потім передайте його як{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            controller
          </code>
          .
        </p>
        <Callout type="info" title="Вбудовані клавіші" className="mb-4">
          Історії двовісні, тож розгорніть у контролер двовісний ключ:{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            urlIndexTwoAxisKey
          </code>{' '}
          (група та історія за позицією) або{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            urlStableIdTwoAxisKey
          </code>{' '}
          (група за стабільним{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            id
          </code>
          ) — обидва реекспортовані з{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react
          </code>
          . See the{' '}
          <Link
            to="/uk/docs/core/guide#url-state"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            посібник зі стану в URL
          </Link>{' '}
          та{' '}
          <Link
            to="/uk/docs/core/api#url-state"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            API ядра
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
            Відкриття додає <strong>один</strong> запис в історію. Свайп історій{' '}
            <em>та</em> і перемикання користувачів <strong>replace</strong>{' '}
            його, тож N переходів не додають записів, і один крок назад завжди
            закриває плеєр. «Назад» закриває, а не гортає історії.
          </li>
          <li>
            <strong>Внутрішня навігація теж передається.</strong> Індекс історії
            не застигає на рівні групи — перехід між історіями користувача
            оновлює{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              ?story=2.<em>n</em>
            </code>{' '}
            тож пряме посилання відкриває саме потрібну історію.
          </li>
          <li>
            «Назад» закриває лише тоді, коли плеєр відкрили всередині застосунку
            — посилання додало запис. За надісланим посиланням у новій вкладці
            історії позаду немає, тож кнопка «назад» виведе із сайту; кнопка ✕
            або Escape прибирає параметр на місці й лишає вас на сторінці.
          </li>
          <li>
            Параметр, який не називає ані групи, ані історії — застаріла
            закладка, змінене вручну значення, історія за межами групи —
            прибирається з URL, а не відкриває сусідню.
          </li>
        </ul>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <strong>Застосунок із роутером — передайте адаптер.</strong> Writing{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            history.pushState
          </code>{' '}
          повз роутер лишає його місцеположення застарілим, і наступна навігація
          втрачає параметр:
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
          <strong>Стабільні посилання.</strong> Група типово адресується за
          позицією, тож збережений у закладках{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ?story=2.0
          </code>{' '}
          відкриє іншого користувача, щойно стрічку перевпорядкують. Адресуйте
          групу за стабільним id —{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            outerCodec
          </code>{' '}
          записує id в URL,{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            outerLocator
          </code>{' '}
          знаходить, де він лежить. Половина з історією лишається звичайним
          індексом усередині знайденої групи.
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
          <strong>Нескінченні стрічки.</strong> Гортання сторінками — задача{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            outerLocator
          </code>{' '}
          , незалежна від кодека.{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locate
          </code>{' '}
          синхронний, тож відповідає лише за вже завантажені групи — надіслане
          посилання на групу 400 у стрічці, де завантажено 20, нічого не знайде.{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locateAsync
          </code>{' '}
          — запасний варіант, що викликається лише коли{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locate
          </code>{' '}
          не знаходить; історія заново обмежується за тією групою, на якій усе
          зупинилося.
        </p>
        <Callout
          type="info"
          title="Той самий locateAsync, зовнішня вісь"
          className="mb-4"
        >
          Це той самий{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            locateAsync
          </code>{' '}
          пейджер, який приймають одновісні ключі — у двовісному ключі він їде
          разом із{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            outerLocator
          </code>{' '}
          , який ви передаєте, тож вісь груп гортається сторінками, а історія
          лишається локальним індексом усередині знайденої групи.
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
            While{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              locateAsync
            </code>{' '}
            у процесі, плеєр лишається закритим, а параметр — недоторканим, тож
            пряме посилання переживає запит.{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              null
            </code>{' '}
            або відмова прибирає параметр.
          </li>
          <li>
            Відповідь, що приходить після зміни URL, після закриття або після
            демонтажу, відкидається — повільний запит не відкриє історію, якої
            ніхто не просив.
          </li>
          <li>
            Full{' '}
            <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
              useOverlayUrlState
            </code>{' '}
            опції — у{' '}
            <Link
              to="/uk/docs/react/api#useoverlayurlstate"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              довіднику API для React
            </Link>
            , а покроковий розбір — у{' '}
            <Link
              to="/uk/docs/react/guide#url-state"
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              посібнику для React
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
          Довідник API
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
                <th className="text-left py-3 px-4 font-semibold">Prop</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Типове значення
                </th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
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
          Приймає всі пропси{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            StoriesOverlay
          </code>{' '}
          , крім трійки стану відкриття —{' '}
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
          , яку натомість дає контролер.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Prop</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Типове значення
                </th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
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
                <td className="py-3 px-4 text-slate-500 text-sm">required</td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Контролер із useOverlayUrlState, розгорнутий разом із
                  urlIndexTwoAxisKey. Його position — об’єкт{' '}
                  {'{ outer, inner }'} — вирішує, чи плеєр відкритий і де саме;
                  оверлей записує назад на кожній навігації та на закритті.
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
          Колбеки
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Prop</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
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
          Переходи
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            groupTransition
          </code>{' '}
          керує 3D-ефектом переходу під час свайпу між групами користувачів.
          Імпортуйте функції переходів із{' '}
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
          Життєвий цикл завантаження вмісту
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Кожен слайд історії повідомляє свій стан завантаження через колбеки,
          передані в{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            SlideRenderProps
          </code>
          :
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Колбек</th>
                <th className="text-left py-3 px-4 font-semibold">Якщо</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onReady
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Вміст готовий (зображення завантажено, відео грає). Таймер
                  прогресу запускається.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onWaiting
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Вміст затримується (відео буферизується посеред відтворення).
                  З’являється індикатор, таймер стає на паузу.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onError
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Вміст не завантажився. Показується оверлей помилки.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onDurationReady
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Повідомте справжню тривалість медіа (наприклад, із метаданих
                  відео), щоб перезапустити таймер із правильною тривалістю.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onEnded
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Сигналізує, що медіа завершилося (наприклад, відео догралося).
                  Відбувається перехід до наступної історії.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout
          type="info"
          title="Кешування попереднього завантаження"
          className="mt-4"
        >
          The built-in{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ImageStorySlide
          </code>{' '}
          та{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            VideoStorySlide
          </code>{' '}
          заздалегідь вантажать наступну історію у фоні. Коли користувач
          переходить до вже завантаженої історії, вміст з’являється миттєво, без
          індикатора.
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
          Будь-який елемент інтерфейсу можна замінити через render props. Кожен
          отримує типізовані пропси з усім потрібним станом і колбеками.
        </p>

        <Heading
          level={3}
          id="renderheader"
          className="text-xl font-semibold mt-6 mb-4"
        >
          renderHeader
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Замініть стандартну шапку (дані автора, кнопки паузи та звуку, кнопка
          закриття):
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
          Додайте підвал під вмістом історії:
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
          Повністю замініть стандартні слайди із зображенням і відео.
          Скористайтеся підкомпонентами{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ImageStorySlide
          </code>{' '}
          та{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            VideoStorySlide
          </code>{' '}
          для вбудованої роботи з медіа:
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
          Замініть стандартні кнопки-стрілки для десктопа:
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
          Замініть стандартну смугу прогресу на canvas власною реалізацією.
          Сигнал{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            progress
          </code>{' '}
          видає значення від 0 до 1:
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
          Власний індикатор завантаження, поки вміст вантажиться:
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
      <span>Завантаження історії {storyIndex + 1}…</span>
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
          Власний оверлей помилки, коли вміст не завантажився:
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
      <span>Не вдалося завантажити історію</span>
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
          Скористайтеся пропсом{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            apiRef
          </code>{' '}
          для імперативного керування:
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
          Методи
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Метод</th>
                <th className="text-left py-3 px-4 font-semibold">Тип</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
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
          Подвійний дотик і лайки
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          На подвійний дотик програється вбудована анімація сердечка — миттєвий
          візуальний відгук. Колбек{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            onDoubleTap
          </code>{' '}
          спрацьовує з індексами групи та історії, тож ви можете зберегти лайк у
          власному стані (запит до API, локальне сховище тощо). Сам плеєр стан
          лайків не веде.
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
          Налаштування анімації сердечка
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Змініть швидкість анімації через{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            --rk-stories-heart-duration
          </code>{' '}
          token (see{' '}
          <Link
            to={{ hash: '#theming' }}
            className="text-primary-500 hover:text-primary-600 font-medium"
          >
            Theming
          </Link>
          ). Для кольору, розміру чи повного приховування сердечка звертайтеся
          до{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            .rk-stories-heart
          </code>{' '}
          напряму. Компонент{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            HeartAnimation
          </code>{' '}
          також експортовано для окремого використання.
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
          Вбудовану анімацію сердечка поки не можна замінити через render prop.
          Її можна перестилізувати засобами CSS або сховати через{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            display: none
          </code>{' '}
          і зробити власну анімацію в колбеку{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            onDoubleTap
          </code>{' '}
          . Якщо вам потрібен render prop{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            renderDoubleTap
          </code>{' '}
          , напишіть нам через{' '}
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
          Sub-Components
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Повторно використовувані блоки, експортовані для складання власних
          render props:
        </p>

        <Heading
          level={3}
          id="canvasprogressbar"
          className="text-lg font-semibold mt-6 mb-2"
        >
          CanvasProgressBar
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Швидка сегментована смуга прогресу на canvas. Рендерить сегмент для
          кожної історії й анімує заповнення активного через{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            requestAnimationFrame
          </code>
          . Підтримує рухоме вікно для груп із багатьма історіями.
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
          Стандартна шапка з аватаром автора, іменем, значком підтвердження,
          відносним часом, перемикачами паузи та звуку, індикатором завантаження
          й кнопкою закриття. Використовується автоматично, коли{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderHeader
          </code>{' '}
          не задано.
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
          Слайд-зображення на всю площу з{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            object-fit: cover
          </code>
          . Повідомляє про завантаження та помилки через колбеки для відстеження
          життєвого циклу.
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
          Слайд-відео, що використовує спільний елемент{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            {'<video>'}
          </code>{' '}
          заради безперервності звуку на iOS. Дає раду автовідтворенню,
          постерам, синхронізації звуку й повідомляє тривалість і події
          життєвого циклу відтворення.
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
          Круглий аватар із градієнтним кільцем у стилі Instagram. Сегменти
          показують переглянуті й непереглянуті історії — градієнт для
          непереглянутих, приглушений сірий для переглянутих.
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
          Горизонтальний прокручуваний ряд компонентів{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            StoriesRing
          </code>{' '}
          з іменами авторів. Одне кільце на групу.
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
          Анімований оверлей сердечка, що спрацьовує на подвійний дотик.
          Збільшується й згасає за 800 мс. Налаштовується засобами CSS (дивіться
          розділ про подвійний дотик і лайки).
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
          Types
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
          Власні типи Story
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Extend{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            StoryItem
          </code>{' '}
          власними полями й передайте параметр типу в{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            StoriesOverlay
          </code>
          . Усі render props отримають ваш розширений тип:
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
          Класи CSS
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Усі класи CSS звичайні (не CSS-модулі), тож їх можна перекрити
          селекторами вищої специфічності в таблиці стилів, підключеній після{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react-stories-player/styles.css
          </code>
          . Для змін кольору, розміру та z-index краще беріть власні властивості
          CSS, описані в розділі{' '}
          <Link
            to={{ hash: '#theming' }}
            className="text-primary-500 hover:text-primary-600 font-medium"
          >
            Theming
          </Link>{' '}
          нижче.
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Class</th>
                <th className="text-left py-3 px-4 font-semibold">Component</th>
                <th className="text-left py-3 px-4 font-semibold">Опис</th>
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
          Theming
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Кожен колір, розмір, z-index і перехід живе у власній властивості CSS.
          Перевизначайте одну чи кілька на{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            :root
          </code>{' '}
          (або на будь-якому предку оверлея), щоб змінити тему, не чіпаючи код
          компонентів.
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Token</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Типове значення
                </th>
                <th className="text-left py-3 px-4 font-semibold">Controls</th>
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
          Вставте фрагмент нижче в таблицю стилів, підключену після{' '}
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
          Accessibility
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Корінь оверлея — модальний діалог (
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            role="dialog"
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-modal="true"
          </code>
          ). Set{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ariaLabel
          </code>{' '}
          щоб змінити оголошення для екранного читача; типове значення —
          «Stories player».
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          Оверлей захоплює фокус під час відкриття й повертає його на
          елемент-тригер після закриття. Tab і Shift+Tab циклічно проходять
          фокусовані елементи всередині; фокус, що вислизнув (клік поза
          оверлеєм, програмна установка), повертається назад. Реалізовано через{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            captureFocusForReturn
          </code>{' '}
          та{' '}
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
          Клавіатурні скорочення
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Key</th>
                <th className="text-left py-3 px-4 font-semibold">Action</th>
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
