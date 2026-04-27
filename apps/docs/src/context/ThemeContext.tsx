import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const _kStorageKey = 'rk-docs:theme';
const _kLegacyStorageKey = 'theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Always seed to the SSR default so server + client first render emit
  // identical markup. The inline bootstrap script in `root.tsx` has
  // already applied `<html class="dark">` (or removed it) before paint
  // based on the same storage key, so visually nothing flashes. The
  // mount effect below reconciles internal state from storage; an
  // explicit `mounted` flag guards the class/storage write effect so it
  // never undoes the bootstrap script before reconciliation lands.
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let stored = localStorage.getItem(_kStorageKey) as Theme | null;
    if (!stored) {
      const legacy = localStorage.getItem(_kLegacyStorageKey) as Theme | null;
      if (legacy) {
        localStorage.setItem(_kStorageKey, legacy);
        localStorage.removeItem(_kLegacyStorageKey);
        stored = legacy;
      }
    }
    const resolved: Theme =
      stored ??
      (window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light');
    setTheme(resolved);
    setMounted(true);
    // Run only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(_kStorageKey, theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
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
