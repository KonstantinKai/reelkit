import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SoundProvider, useSoundState } from './SoundState';

const Consumer = () => {
  const state = useSoundState();
  return (
    <span data-muted={state.muted.value} data-disabled={state.disabled.value} />
  );
};

describe('SoundProvider', () => {
  it('provides SoundController via context', () => {
    const { container } = render(
      <SoundProvider>
        <Consumer />
      </SoundProvider>,
    );

    const el = container.querySelector('span')!;
    expect(el.getAttribute('data-muted')).toBe('true');
    expect(el.getAttribute('data-disabled')).toBe('false');
  });
});

describe('useSoundState', () => {
  it('throws when used outside SoundProvider', () => {
    expect(() => render(<Consumer />)).toThrow(
      'useSoundState must be used within SoundProvider',
    );
  });
});
