import { Callout } from '../../components/ui/Callout';
import { Clock } from 'lucide-react';

export default function VueLightboxPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Vue Lightbox</h1>

      <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
        Full-screen image and video gallery overlay for Vue with swipe
        navigation, zoom transitions, and customizable slots.
      </p>

      <Callout type="info">
        <div className="flex items-center gap-2">
          <Clock size={18} />
          <span className="font-medium">Coming Soon</span>
        </div>
        <p className="mt-2">
          The Vue lightbox is currently in development. The React version is
          available now at{' '}
          <a
            href="/docs/lightbox"
            className="text-primary-600 dark:text-primary-400 underline"
          >
            @reelkit/react-lightbox
          </a>
          .
        </p>
      </Callout>
    </div>
  );
}
