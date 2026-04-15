/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, ArrowRight } from 'lucide-react';
import {
  createSignal,
  createComputed,
  reaction,
  observeDomEvent,
  createDisposableList,
  Observe,
} from '@reelkit/react';
import { searchItems, SearchItem } from '../data/searchData';
import { frameworkSignal } from '../data/frameworkSignal';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

function groupByCategory(items: SearchItem[]): Map<string, SearchItem[]> {
  const groups = new Map<string, SearchItem[]>();
  for (const item of items) {
    const group = groups.get(item.category);
    if (group) {
      group.push(item);
    } else {
      groups.set(item.category, [item]);
    }
  }
  return groups;
}

export default function CommandPalette({
  isOpen,
  onClose,
}: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [{ query, activeIndex, filtered, grouped }] = useState(() => {
    const query = createSignal('');
    const activeIndex = createSignal(0);

    const filtered = createComputed(
      () => {
        const fw = frameworkSignal.value;
        const base = searchItems.filter(
          (item) => !item.framework || item.framework === fw,
        );
        const q = query.value.toLowerCase().trim();
        if (!q) return base;
        return base.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            item.keywords.some((kw) => kw.includes(q)),
        );
      },
      () => [query, frameworkSignal],
    );

    const grouped = createComputed(
      () => groupByCategory(filtered.value),
      () => [filtered],
    );

    return { query, activeIndex, filtered, grouped };
  });

  const propsRef = useRef({ onClose, navigate });
  propsRef.current = { onClose, navigate };

  useEffect(() => {
    if (isOpen) {
      query.value = '';
      activeIndex.value = 0;
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const disposables = createDisposableList();

    disposables.push(
      reaction(
        () => [filtered],
        () => (activeIndex.value = 0),
      ),
      reaction(
        () => [activeIndex],
        () => {
          const activeEl = listRef.current?.querySelector(
            '[data-active="true"]',
          );
          activeEl?.scrollIntoView({ block: 'nearest' });
        },
      ),
      observeDomEvent(document, 'keydown', (e: Event) => {
        const ke = e as KeyboardEvent;
        const items = filtered.value;
        switch (ke.key) {
          case 'ArrowDown':
            ke.preventDefault();
            activeIndex.value = (activeIndex.value + 1) % items.length;
            break;
          case 'ArrowUp':
            ke.preventDefault();
            activeIndex.value =
              (activeIndex.value - 1 + items.length) % items.length;
            break;
          case 'Enter':
            ke.preventDefault();
            if (items[activeIndex.value]) {
              propsRef.current.navigate(items[activeIndex.value].path);
              propsRef.current.onClose();
            }
            break;
          case 'Escape':
            ke.preventDefault();
            propsRef.current.onClose();
            break;
        }
      }),
    );

    document.body.style.overflow = 'hidden';

    return () => {
      disposables.dispose();
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-lg mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 border-b border-slate-200 dark:border-slate-700">
          <Search size={18} className="text-slate-400 shrink-0" />
          <Observe signals={[query]}>
            {() => (
              <input
                ref={inputRef}
                type="text"
                value={query.value}
                onChange={(e) => (query.value = e.target.value)}
                placeholder="Search documentation..."
                className="flex-1 py-4 bg-transparent border-0 outline-none text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              />
            )}
          </Observe>
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
          <Observe signals={[filtered, grouped, activeIndex, query]}>
            {() => {
              const items = filtered.value;
              if (items.length === 0) {
                return (
                  <div className="px-4 py-8 text-center text-sm text-slate-500">
                    No results found for &ldquo;{query.value}&rdquo;
                  </div>
                );
              }

              let flatIndex = 0;
              return (
                <>
                  {Array.from(grouped.value.entries()).map(
                    ([category, catItems]) => (
                      <div key={category}>
                        <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          {category}
                        </div>
                        {catItems.map((item) => {
                          const idx = flatIndex++;
                          const isActive = idx === activeIndex.value;
                          return (
                            <button
                              key={item.path}
                              data-active={isActive}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                                isActive
                                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                              }`}
                              onClick={() => {
                                navigate(item.path);
                                onClose();
                              }}
                              onMouseEnter={() => (activeIndex.value = idx)}
                            >
                              <FileText
                                size={16}
                                className={
                                  isActive
                                    ? 'text-primary-500 dark:text-primary-400'
                                    : 'text-slate-400'
                                }
                              />
                              <span className="flex-1">{item.title}</span>
                              {isActive && (
                                <ArrowRight
                                  size={14}
                                  className="text-primary-400 shrink-0"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ),
                  )}
                </>
              );
            }}
          </Observe>
        </div>

        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-400">
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">
              &uarr;
            </kbd>
            <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">
              &darr;
            </kbd>
            navigate
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">
              &crarr;
            </kbd>
            open
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">
              esc
            </kbd>
            close
          </span>
        </div>
      </div>
    </div>
  );
}
