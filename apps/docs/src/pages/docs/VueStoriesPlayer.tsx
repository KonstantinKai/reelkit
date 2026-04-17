import { Callout } from '../../components/ui/Callout';
import { Clock } from 'lucide-react';

export default function VueStoriesPlayerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Vue Stories Player</h1>

      <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
        Full-screen, Instagram-style stories player overlay for Vue with nested
        navigation, auto-advance timer, tap zones, and customizable slots.
      </p>

      <Callout type="info">
        <div className="flex items-center gap-2">
          <Clock size={18} />
          <span className="font-medium">Coming Soon</span>
        </div>
        <p className="mt-2">
          The Vue stories player is currently in development. The React version
          is available now at{' '}
          <a
            href="/docs/stories-player"
            className="text-primary-600 dark:text-primary-400 underline"
          >
            @reelkit/react-stories-player
          </a>
          . The Vue version will follow the same architecture, using{' '}
          <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
            @reelkit/stories-core
          </code>{' '}
          for the framework-agnostic state machine, timer, and canvas progress
          renderer.
        </p>
      </Callout>
    </div>
  );
}
