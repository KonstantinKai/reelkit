import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

/** What the reader picked. `system` defers to the operating system. */
export type ThemeChoice = 'light' | 'dark' | 'system';

/** What actually gets painted once `system` is resolved. */
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  /**
   * The painted theme. Consumers that colour something — the StackBlitz
   * embed, for one — want this rather than the choice, because `system` is
   * not a colour.
   */
  theme: ResolvedTheme;
  themeChoice: ThemeChoice;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const _kStorageKey = 'rk-docs:theme';
const _kLegacyStorageKey = 'theme';
const _kDarkQuery = '(prefers-color-scheme: dark)';

/** Light → Dark → System → Light. */
const _kCycle: Record<ThemeChoice, ThemeChoice> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
};

function isChoice(value: string | null): value is ThemeChoice {
  return value === 'light' || value === 'dark' || value === 'system';
}

function prefersDark(): boolean {
  return window.matchMedia(_kDarkQuery).matches;
}

function resolve(choice: ThemeChoice): ResolvedTheme {
  if (choice !== 'system') return choice;
  return prefersDark() ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Always seed to the server-rendered default so the first client render
  // emits identical markup. The inline bootstrap script in `root.tsx` has
  // already applied `<html class="dark">` (or removed it) before paint from
  // the same storage key, so nothing flashes. The mount effect below
  // reconciles from storage; the `mounted` flag keeps the write effect from
  // undoing the bootstrap script before that reconciliation lands.
  const [themeChoice, setThemeChoice] = useState<ThemeChoice>('system');
  const [theme, setTheme] = useState<ResolvedTheme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let stored = localStorage.getItem(_kStorageKey);
    if (!stored) {
      const legacy = localStorage.getItem(_kLegacyStorageKey);
      if (legacy) {
        localStorage.setItem(_kStorageKey, legacy);
        localStorage.removeItem(_kLegacyStorageKey);
        stored = legacy;
      }
    }
    // An unrecognised value — a hand-edited entry, or one written by an
    // older build — falls back to the system preference rather than pinning
    // a colour the reader never chose.
    const choice: ThemeChoice = isChoice(stored) ? stored : 'system';
    setThemeChoice(choice);
    setTheme(resolve(choice));
    setMounted(true);
  }, []);

  // Follow the operating system while, and only while, the reader is on
  // `system`. Picking Light or Dark pins the colour until they change it.
  useEffect(() => {
    if (!mounted || themeChoice !== 'system') return;
    const query = window.matchMedia(_kDarkQuery);
    const sync = () => setTheme(query.matches ? 'dark' : 'light');
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, [mounted, themeChoice]);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(_kStorageKey, themeChoice);
  }, [themeChoice, mounted]);

  const cycleTheme = () => {
    setThemeChoice((previous) => {
      const next = _kCycle[previous];
      setTheme(resolve(next));
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, themeChoice, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
