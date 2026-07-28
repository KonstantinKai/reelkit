import { Callout } from '../../../components/ui/Callout';
import { Clock } from 'lucide-react';
import { ukPageMeta } from '../../../i18n/pageMeta';

export const meta = () =>
  ukPageMeta({
    path: '/docs/vue-stories-player',
    title: 'Stories Player для Vue · ReelKit',
    description:
      'Повноекранний Stories Player для Vue: прогрес, жести й темізація.',
  });

// Headings keep the English slug as an explicit id — the generator is
// ascii-only, so a translated heading would produce an empty anchor.

export default function VueStoriesPlayerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Stories Player для Vue</h1>

      <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
        Повноекранний оверлей плеєра історій у стилі Instagram для Vue: вкладена
        навігація, таймер автопереходу, зони дотику та налаштовні слоти.
      </p>

      <Callout type="info">
        <div className="flex items-center gap-2">
          <Clock size={18} />
          <span className="font-medium">Скоро</span>
        </div>
        <p className="mt-2">
          Плеєр історій для Vue зараз у розробці. Версія для React уже доступна
          —{' '}
          <a
            href="/uk/docs/stories-player"
            className="text-primary-600 dark:text-primary-400 underline"
          >
            @reelkit/react-stories-player
          </a>
          . Версія для Vue матиме ту саму архітектуру й використовуватиме{' '}
          <code className="text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
            @reelkit/stories-core
          </code>{' '}
          як машину станів, таймер і рендерер прогресу на canvas без прив’язки
          до фреймворку.
        </p>
      </Callout>
    </div>
  );
}
