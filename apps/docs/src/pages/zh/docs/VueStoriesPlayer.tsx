import { Callout } from '../../../components/ui/Callout';
import { Clock } from 'lucide-react';
import { zhPageMeta } from '../../../i18n/pageMeta';

export const meta = () =>
  zhPageMeta({
    path: '/docs/vue-stories-player',
    title: 'Vue Stories Player · ReelKit',
    description: 'Vue Stories 播放浮层：进度、手势与主题定制。',
  });

// Headings carry the English slug as an explicit id — the slug generator
// is ascii-only, so a Chinese heading would produce an empty anchor.

export default function VueStoriesPlayerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Vue Stories Player</h1>

      <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
        面向 Vue 的全屏 Instagram 风格 Stories
        播放浮层，支持嵌套导航、自动播放计时、点击区域和可定制插槽。
      </p>

      <Callout type="info">
        <div className="flex items-center gap-2">
          <Clock size={18} />
          <span className="font-medium">即将推出</span>
        </div>
        <p className="mt-2">
          Vue 版 Stories Player仍在开发中。React 版现已可用：{' '}
          <a
            href="/zh/docs/stories-player"
            className="text-primary-600 dark:text-primary-400 underline"
          >
            @reelkit/react-stories-player
          </a>
          。Vue 版会沿用同样的架构，用{' '}
          <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
            @reelkit/stories-core
          </code>{' '}
          作为与框架无关的状态机、计时器和 canvas 进度渲染器。
        </p>
      </Callout>
    </div>
  );
}
