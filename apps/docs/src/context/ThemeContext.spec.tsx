import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ThemeProvider, useTheme } from './ThemeContext';

const STORAGE_KEY = 'rk-docs:theme';

type Listener = () => void;

/**
 * jsdom ships no `matchMedia`, and the provider needs one it can flip so the
 * "follows the operating system" behaviour is observable.
 */
function installMatchMedia(initialDark: boolean) {
  let dark = initialDark;
  const listeners = new Set<Listener>();

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      get matches() {
        return query.includes('dark') ? dark : !dark;
      },
      media: query,
      addEventListener: (_: string, listener: Listener) =>
        listeners.add(listener),
      removeEventListener: (_: string, listener: Listener) =>
        listeners.delete(listener),
    }),
  });

  return {
    set(next: boolean) {
      dark = next;
      act(() => {
        listeners.forEach((listener) => listener());
      });
    },
  };
}

function Probe() {
  const { theme, themeChoice, cycleTheme } = useTheme();
  return (
    <button onClick={cycleTheme} data-testid="probe">
      {themeChoice}/{theme}
    </button>
  );
}

const state = () => screen.getByTestId('probe').textContent;
const click = () => act(() => screen.getByTestId('probe').click());
const isDark = () => document.documentElement.classList.contains('dark');

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
});

afterEach(() => {
  localStorage.clear();
});

describe('theme choice', () => {
  it('starts on system and paints what the operating system asks for', () => {
    installMatchMedia(true);
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(state()).toBe('system/dark');
    expect(isDark()).toBe(true);
  });

  it('cycles light, then dark, then back to system', () => {
    installMatchMedia(false);
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(state()).toBe('system/light');
    click();
    expect(state()).toBe('light/light');
    click();
    expect(state()).toBe('dark/dark');
    click();
    expect(state()).toBe('system/light');
  });

  it('follows a system change only while the choice is system', () => {
    const media = installMatchMedia(false);
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(state()).toBe('system/light');

    media.set(true);
    expect(state()).toBe('system/dark');

    // Picking a colour pins it — a later system flip must not move it.
    click();
    expect(state()).toBe('light/light');
    media.set(false);
    expect(state()).toBe('light/light');
  });

  it('stores the choice rather than the resolved colour', () => {
    installMatchMedia(true);
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(localStorage.getItem(STORAGE_KEY)).toBe('system');
    click();
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
  });

  it('restores a stored choice', () => {
    localStorage.setItem(STORAGE_KEY, 'dark');
    installMatchMedia(false);
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(state()).toBe('dark/dark');
    expect(isDark()).toBe(true);
  });

  // A value written by an older build, or edited by hand, must not pin a
  // colour the reader never chose.
  it('treats an unrecognised stored value as system', () => {
    localStorage.setItem(STORAGE_KEY, 'sepia');
    installMatchMedia(true);
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(state()).toBe('system/dark');
  });

  it('migrates the legacy storage key', () => {
    localStorage.setItem('theme', 'dark');
    installMatchMedia(false);
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(state()).toBe('dark/dark');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
    expect(localStorage.getItem('theme')).toBeNull();
  });
});
