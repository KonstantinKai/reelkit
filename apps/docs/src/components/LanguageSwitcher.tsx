import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Languages } from 'lucide-react';
import {
  kLocaleNames,
  kLocales,
  withLocaleLocation,
  type Locale,
} from '../i18n/locale';
import { useLocale, useMessages } from '../i18n/useLocale';

export default function LanguageSwitcher() {
  const location = useLocation();
  const navigate = useNavigate();
  const locale = useLocale();
  const messages = useMessages();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  // The search string carries the live `?framework=` contract and the hash
  // carries the section being read, so both ride along to the other locale.
  const switchTo = (next: Locale) => {
    setIsOpen(false);
    if (next === locale) return;
    navigate(withLocaleLocation(next, location));
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={messages.header.languageLabel}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Languages size={20} className="text-slate-600 dark:text-slate-400" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 min-w-[9rem] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg overflow-hidden"
        >
          {kLocales.map((option) => (
            <button
              key={option}
              type="button"
              role="menuitem"
              lang={option}
              onClick={() => switchTo(option)}
              className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                option === locale
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              {kLocaleNames[option]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
