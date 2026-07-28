import { Bot, Sparkles, Link as LinkIcon, FileText } from 'lucide-react';
import { Heading } from '../../../components/ui/Heading';
import { CodeBlock } from '../../../components/ui/CodeBlock';
import { Callout } from '../../../components/ui/Callout';
import { FeatureCardGrid } from '../../../components/ui/FeatureCard';
import { ukPageMeta } from '../../../i18n/pageMeta';

export const meta = () =>
  ukPageMeta({
    path: '/docs/llms',
    title: 'Інтеграція з AI / LLM · ReelKit',
    description:
      'Як згодувати документацію ReelKit асистентам: llms.txt, llms-full.txt і рекомендовані способи підключення.',
  });

// Headings keep the English slug as an explicit id — the generator is
// ascii-only, so a translated heading would produce an empty anchor.

const endpoints = [
  {
    name: '/llms.txt',
    url: 'https://reelkit.dev/llms.txt',
    description:
      'Індексований список посилань на кожну сторінку документації. Кидайте в контекст будь-якої мовної моделі.',
  },
  {
    name: '/llms-full.txt',
    url: 'https://reelkit.dev/llms-full.txt',
    description:
      'Той самий індекс плюс вбудовані підсумки кожної сторінки. Увесь корпус за один запит.',
  },
  {
    name: 'context7.com/websites/reelkit_dev',
    url: 'https://context7.com/websites/reelkit_dev',
    description:
      'Маніфест Context7 із живим індексом. Підключається через MCP-сервер @context7.',
  },
];

export default function LlmsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Інтеграція з AI / LLM</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Документація в машиночитному вигляді для AI-асистентів із написання
          коду.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <FeatureCardGrid
          items={[
            {
              icon: FileText,
              label: 'llms.txt',
              desc: 'Компактний індекс посилань. Уся документація в одному файлі. Оновлюється на збірці.',
            },
            {
              icon: Sparkles,
              label: 'llms-full.txt',
              desc: 'Повний корпус із підсумками сторінок. Контекст за один запит.',
            },
            {
              icon: Bot,
              label: 'context7',
              desc: 'Маніфест із живим індексом. Використовуйте з MCP-сервером @context7.',
            },
          ]}
        />
      </div>

      <Callout type="info">
        <p>
          Обидві точки доступу `.txt` перегенеровуються на кожній збірці
          документації. Корпус відповідає опублікованому сайту.
        </p>
      </Callout>

      <Heading
        level={2}
        id="endpoints"
        className="text-2xl font-bold mt-12 mb-4"
      >
        Точки доступу
      </Heading>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left py-2 pr-4 font-semibold">
                Точка доступу
              </th>
              <th className="text-left py-2 font-semibold">Призначення</th>
            </tr>
          </thead>
          <tbody>
            {endpoints.map((e) => (
              <tr
                key={e.name}
                className="border-b border-slate-100 dark:border-slate-800"
              >
                <td className="py-2 pr-4 font-mono text-xs">
                  <a
                    href={e.url}
                    className="text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <LinkIcon size={12} /> {e.name}
                  </a>
                </td>
                <td className="py-2 text-slate-600 dark:text-slate-400">
                  {e.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Heading
        level={2}
        id="quick-start"
        className="text-2xl font-bold mt-12 mb-4"
      >
        Швидкий старт
      </Heading>

      <Heading
        level={3}
        id="agent-prompt"
        className="text-lg font-semibold mt-6 mb-2"
      >
        Запит до агента
      </Heading>
      <p className="text-slate-600 dark:text-slate-400 mb-4">
        Вставте URL точки доступу в агента, щоб його відповіді спиралися на
        актуальну документацію.
      </p>
      <CodeBlock
        code={`reelkit.dev/llms-full.txt How do I wire vertical-feed gestures?`}
        language="text"
      />

      <Heading
        level={3}
        id="context7-mcp-server"
        className="text-lg font-semibold mt-6 mb-2"
      >
        MCP-сервер Context7
      </Heading>
      <p className="text-slate-600 dark:text-slate-400 mb-4">
        Встановіть MCP-сервер{' '}
        <a
          href="https://github.com/upstash/context7"
          className="text-primary-600 dark:text-primary-400 hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          @context7
        </a>{' '}
        . Агент сам підхопить маніфест ReelKit і завантажить документацію за
        потреби. Згадайте <code>reelkit</code> у своєму запиті.
      </p>

      <Heading
        level={3}
        id="direct-ingestion"
        className="text-lg font-semibold mt-6 mb-2"
      >
        Пряме завантаження
      </Heading>
      <p className="text-slate-600 dark:text-slate-400 mb-4">
        Завантажуйте програмно:
      </p>
      <CodeBlock
        code={`curl -s https://reelkit.dev/llms.txt
curl -s https://reelkit.dev/llms-full.txt`}
        language="bash"
      />

      <Heading
        level={2}
        id="what-gets-indexed"
        className="text-2xl font-bold mt-12 mb-4"
      >
        Що потрапляє в індекс
      </Heading>
      <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
        <li>Початок роботи та встановлення</li>
        <li>Посібник із рушія ядра та API</li>
        <li>
          Прив’язки для React, Vue, Angular (посібник, API, reel-плеєр,
          Lightbox, плеєр історій)
        </li>
        <li>Рушій Stories Core</li>
        <li>Нотатки про SSR</li>
        <li>Усунення несправностей</li>
        <li>Журнал змін</li>
      </ul>

      <Heading level={2} id="why" className="text-2xl font-bold mt-12 mb-4">
        Навіщо?
      </Heading>
      <p className="text-slate-600 dark:text-slate-400">
        AI-асистенти відстають від змін у бібліотеці, і згенерований код
        спирається на застарілі API. Ці точки доступу оновлюються з кожним
        випуском документації, тож підказки відповідають поточній поведінці, а
        не тій, що була минулого кварталу.
      </p>
    </div>
  );
}
