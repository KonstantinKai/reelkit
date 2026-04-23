import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Observe } from '@reelkit/react';
import {
  navItems,
  type NavSection as NavSectionData,
} from '../../data/searchData';
import { frameworkSignal } from '../../data/frameworkSignal';

// eslint-disable-next-line @nx/enforce-module-boundaries
import changelogRaw from '../../../../../CHANGELOG.md?raw';

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

function getLatestEntry(): string | null {
  const match = changelogRaw.match(/^## (.+@[\d.]+)/m);
  return match ? match[1] : null;
}

function useChangelogBadge() {
  const [showBadge, setShowBadge] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const latest = getLatestEntry();
    if (!latest) return;
    setShowBadge(readSeen() !== latest);
  }, []);

  // Clear badge when visiting changelog page
  useEffect(() => {
    if (location.pathname === '/docs/changelog') {
      const latest = getLatestEntry();
      if (latest) {
        localStorage.setItem(_kStorageKey, latest);
        setShowBadge(false);
      }
    }
  }, [location.pathname]);

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
  showChangelogBadge,
}: {
  title: string;
  items: NavSectionData['items'];
  showChangelogBadge?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
      >
        {title}
        <ChevronDown
          size={14}
          className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
        />
      </button>
      <ul
        className={`space-y-1 overflow-hidden transition-all duration-200 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        {items.map((item) => (
          <li
            key={item.path}
            className={'comingSoon' in item && item.comingSoon ? 'mt-3' : ''}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                } ${'comingSoon' in item && item.comingSoon ? 'opacity-60 cursor-not-allowed' : ''}`
              }
            >
              {item.label}
              {'comingSoon' in item &&
                (item as { comingSoon?: boolean }).comingSoon && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 ml-2">
                    Soon
                  </span>
                )}
              {showChangelogBadge && item.path === '/docs/changelog' && (
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Sidebar({
  isOpen,
  showDesktop = true,
  onClose,
}: SidebarProps) {
  const showChangelogBadge = useChangelogBadge();
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
          <Observe signals={[frameworkSignal]}>
            {() => {
              const fw = frameworkSignal.value;
              return (
                <>
                  {navItems
                    .filter((s) => !s.framework || s.framework === fw)
                    .map((section) => {
                      const items = section.items.filter(
                        (item) => !item.framework || item.framework === fw,
                      );
                      if (items.length === 0) return null;
                      return (
                        <NavSection
                          key={section.title}
                          title={section.title}
                          items={items}
                          showChangelogBadge={
                            section.title === 'Resources'
                              ? showChangelogBadge
                              : false
                          }
                        />
                      );
                    })}
                </>
              );
            }}
          </Observe>
        </nav>
      </aside>
    </>
  );
}
