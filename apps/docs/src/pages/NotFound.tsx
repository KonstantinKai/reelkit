import { Link } from 'react-router-dom';
import { useLocalePath, useMessages } from '../i18n/useLocale';

export default function NotFound() {
  const messages = useMessages();
  const localePath = useLocalePath();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="text-8xl font-bold text-slate-200 dark:text-slate-800 mb-4">
        404
      </div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        {messages.notFound.title}
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
        {messages.notFound.description}
      </p>
      <div className="flex gap-4">
        <Link
          to={localePath('/')}
          className="px-5 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          {messages.notFound.home}
        </Link>
        <Link
          to={localePath('/docs/getting-started')}
          className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          {messages.notFound.docs}
        </Link>
      </div>
    </div>
  );
}
