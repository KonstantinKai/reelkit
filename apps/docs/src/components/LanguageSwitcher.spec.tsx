import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';

function LocationProbe() {
  const location = useLocation();
  return (
    <span data-testid="location">
      {location.pathname}
      {location.search}
      {location.hash}
    </span>
  );
}

function renderAt(entry: string) {
  render(
    <MemoryRouter initialEntries={[entry]}>
      <LanguageSwitcher />
      <Routes>
        <Route path="*" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
  return () => screen.getByTestId('location').textContent;
}

function choose(language: string) {
  fireEvent.click(screen.getByRole('button', { name: /language|语言/i }));
  fireEvent.click(screen.getByRole('menuitem', { name: language }));
}

describe('language switcher', () => {
  it('moves an English page to its Chinese twin', () => {
    const at = renderAt('/docs/core/api');
    choose('简体中文');
    expect(at()).toBe('/zh/docs/core/api');
  });

  it('moves a Chinese page back to its English twin', () => {
    const at = renderAt('/zh/docs/core/api');
    choose('English');
    expect(at()).toBe('/docs/core/api');
  });

  it('returns to the starting URL after a full round trip', () => {
    const at = renderAt('/docs/lightbox');
    choose('简体中文');
    choose('English');
    expect(at()).toBe('/docs/lightbox');
  });

  it('keeps the query string and hash across the switch', () => {
    const at = renderAt('/docs/reel-player?framework=vue#props');
    choose('简体中文');
    expect(at()).toBe('/zh/docs/reel-player?framework=vue#props');
  });

  it('switches the home page', () => {
    const at = renderAt('/');
    choose('简体中文');
    expect(at()).toBe('/zh');
  });
});
