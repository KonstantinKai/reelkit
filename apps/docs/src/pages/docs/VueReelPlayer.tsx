import { Callout } from '../../components/ui/Callout';
import { Clock } from 'lucide-react';

export default function VueReelPlayerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Vue Reel Player</h1>

      <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
        Full-screen, TikTok/Reels-style video player overlay for Vue with
        gesture navigation, loading states, and customizable slots.
      </p>

      <Callout type="info">
        <div className="flex items-center gap-2">
          <Clock size={18} />
          <span className="font-medium">Coming Soon</span>
        </div>
        <p className="mt-2">
          The Vue reel player is currently in development. The React version is
          available now at{' '}
          <a
            href="/docs/reel-player"
            className="text-primary-600 dark:text-primary-400 underline"
          >
            @reelkit/react-reel-player
          </a>
          .
        </p>
      </Callout>
    </div>
  );
}
