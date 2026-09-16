/* eslint-disable react-hooks/exhaustive-deps */
import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  createDisposableList,
  createSignal,
  reaction,
  Observe,
  type Signal,
} from '@reelkit/react';
import { ChevronDown } from 'lucide-react';
import {
  navItems,
  type NavSection as NavSectionData,
} from '../../data/navItems';
import { stripLocaleFromPath } from '../../i18n/locale';
import { useLocalePath, useMessages } from '../../i18n/useLocale';
import { FrameworkVariant } from '../ui/FrameworkVariant';
import { loadChangelogEntries } from '../../utils/loadChangelog';
import { whenIdle } from '../../utils/whenIdle';

const _kStorageKey = 'rk-docs:changelog:last-seen';
const _kLegacyStorageKey = 'reelkit-changelog-seen';

function readSeen(): string | null {
  const stored = localStorage.getItem(_kStorageKey);
  if (stored !== null) return stored;
  const legacy = localStorage.getItem(_kLegacyStorageKey);
  if (legacy !== null) {
    localStorage.setItem(_kStorageKey, legacy);
    localStorage.removeItem(_kLegacyStorageKey);
    return legacy;
  }
  return null;
}

function useChangelogBadge(): Signal<boolean> {
  const [{ latest, pathname, showBadge }] = useState(() => ({
    latest: createSignal<string | null>(null),
    pathname: createSignal(''),
    showBadge: createSignal(false),
  }));
  const location = useLocation();

  useEffect(() => {
    pathname.value = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    let cancelled = false;
    const disposables = createDisposableList();
    disposables.push(
      () => (cancelled = true),
      // The newest release id comes from the release notes, which load once
      // the page has settled rather than with it.
      whenIdle(() => {
        void loadChangelogEntries().then((entries) => {
          if (!cancelled) latest.value = entries[0]?.id ?? null;
        });
      }),
      reaction(
        () => [latest, pathname],
        () => {
          const newest = latest.value;
          if (!newest) return;
          if (stripLocaleFromPath(pathname.value) === '/docs/changelog') {
            localStorage.setItem(_kStorageKey, newest);
            showBadge.value = false;
          } else {
            showBadge.value = readSeen() !== newest;
          }
        },
      ),
    );
    return disposables.dispose;
  }, []);

  return showBadge;
}

interface SidebarProps {
  isOpen?: boolean;
  showDesktop?: boolean;
  onClose?: () => void;
}

function NavSection({
  title,
  items,
  changelogBadge,
}: {
  title: string;
  items: NavSectionData['items'];
  changelogBadge?: Signal<boolean>;
}) {
  const [{ isExpanded, noBadge }] = useState(() => ({
    isExpanded: createSignal(true),
    noBadge: createSignal(false),
  }));
  const badge = changelogBadge ?? noBadge;
  const messages = useMessages();
  const localePath = useLocalePath();

  return (
    <Observe signals={[isExpanded, badge]}>
      {() => (
        <div className="mb-4">
          <button
            onClick={() => (isExpanded.value = !isExpanded.value)}
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            {title}
            <ChevronDown
              size={14}
              className={`transform transition-transform duration-200 ${isExpanded.value ? 'rotate-0' : '-rotate-90'}`}
            />
          </button>
          <ul
            className={`space-y-1 overflow-hidden transition-all duration-200 ${isExpanded.value ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
          >
            {items.map((item) => {
              const li = (
                <li
                  key={item.path}
                  className={
                    'comingSoon' in item && item.comingSoon ? 'mt-3' : ''
                  }
                >
                  <NavLink
                    to={localePath(item.path)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                      } ${'comingSoon' in item && item.comingSoon ? 'opacity-60 cursor-not-allowed' : ''}`
                    }
                  >
                    {messages.nav.items[item.key]}
                    {'comingSoon' in item &&
                      (item as { comingSoon?: boolean }).comingSoon && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 ml-2">
                          {messages.nav.comingSoon}
                        </span>
                      )}
                    {badge.value && item.key === 'changelog' && (
                      <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                    )}
                  </NavLink>
                </li>
              );
              if (item.framework) {
                return (
                  <FrameworkVariant key={item.path} for={item.framework}>
                    {li}
                  </FrameworkVariant>
                );
              }
              return li;
            })}
          </ul>
        </div>
      )}
    </Observe>
  );
}

export default function Sidebar({
  isOpen,
  showDesktop = true,
  onClose,
}: SidebarProps) {
  const changelogBadge = useChangelogBadge();
  const messages = useMessages();
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto z-40 transition-transform duration-300 ${
          showDesktop ? 'lg:translate-x-0' : 'lg:-translate-x-full'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <nav className="p-4">
          {navItems.map((section) => {
            const node = (
              <NavSection
                key={section.key}
                title={messages.nav.sections[section.key]}
                items={section.items}
                changelogBadge={
                  section.key === 'resources' ? changelogBadge : undefined
                }
              />
            );
            if (section.framework) {
              return (
                <FrameworkVariant key={section.key} for={section.framework}>
                  {node}
                </FrameworkVariant>
              );
            }
            return node;
          })}
        </nav>
      </aside>
    </>
  );
}
