import { Callout } from '../../../components/ui/Callout';
import { Clock } from 'lucide-react';
import { ukPageMeta } from '../../../i18n/pageMeta';

export const meta = () =>
  ukPageMeta({
    path: '/docs/angular-stories-player',
    title: 'Stories Player для Angular · ReelKit',
    description:
      'Повноекранний Stories Player для Angular: прогрес, жести й темізація.',
  });

// Headings keep the English slug as an explicit id — the generator is
// ascii-only, so a translated heading would produce an empty anchor.

export default function AngularStoriesPlayerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Stories Player для Angular</h1>

      <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
        Повноекранний оверлей плеєра історій у стилі Instagram для Angular:
        вкладена навігація, таймер автопереходу, зони дотику та налаштовні
        шаблонні слоти.
      </p>

      <Callout type="info">
        <div className="flex items-center gap-2">
          <Clock size={18} />
          <span className="font-medium">Скоро</span>
        </div>
        <p className="mt-2">
          Плеєр історій для Angular зараз у розробці. Версія для React уже
          доступна —{' '}
          <a
            href="/uk/docs/stories-player"
            className="text-primary-600 dark:text-primary-400 underline"
          >
            @reelkit/react-stories-player
          </a>
          . Версія для Angular матиме ту саму архітектуру й використовуватиме{' '}
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
