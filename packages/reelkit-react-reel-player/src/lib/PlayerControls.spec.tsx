import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SoundProvider } from './SoundState';
import PlayerControls from './PlayerControls';

const renderWithSound = (props: {
  onClose: () => void;
  showSound?: boolean;
  soundDisabled?: boolean;
}) =>
  render(
    <SoundProvider>
      <PlayerControls {...props} />
    </SoundProvider>,
  );

describe('PlayerControls', () => {
  describe('close button', () => {
    it('always renders close button', () => {
      renderWithSound({ onClose: vi.fn() });

      expect(screen.getByLabelText('Close')).toBeTruthy();
    });

    it('calls onClose when close button is clicked', () => {
      const onClose = vi.fn();
      renderWithSound({ onClose });

      fireEvent.click(screen.getByLabelText('Close'));

      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  describe('sound button', () => {
    it('is not rendered when showSound is false', () => {
      renderWithSound({ onClose: vi.fn(), showSound: false });

      expect(screen.queryByLabelText('Unmute')).not.toBeTruthy();
      expect(screen.queryByLabelText('Mute')).not.toBeTruthy();
    });

    it('is not rendered by default (showSound defaults to false)', () => {
      renderWithSound({ onClose: vi.fn() });

      expect(screen.queryByLabelText('Unmute')).not.toBeTruthy();
    });

    it('renders when showSound is true', () => {
      renderWithSound({ onClose: vi.fn(), showSound: true });

      // Default muted=true, so label should be "Unmute"
      expect(screen.getByLabelText('Unmute')).toBeTruthy();
    });

    it('shows correct aria-label for muted state', () => {
      renderWithSound({ onClose: vi.fn(), showSound: true });

      // Initially muted=true
      expect(screen.getByLabelText('Unmute')).toBeTruthy();
    });

    it('toggles muted state on click', () => {
      renderWithSound({ onClose: vi.fn(), showSound: true });

      // Initially muted, so "Unmute" is shown
      fireEvent.click(screen.getByLabelText('Unmute'));

      // After toggle, now unmuted, so "Mute" is shown
      expect(screen.getByLabelText('Mute')).toBeTruthy();
    });

    it('does not toggle when soundDisabled is true', () => {
      renderWithSound({ onClose: vi.fn(), showSound: true, soundDisabled: true });

      const soundBtn = screen.getByLabelText('Unmute');
      fireEvent.click(soundBtn);

      // Should still show "Unmute" (no toggle happened)
      expect(screen.getByLabelText('Unmute')).toBeTruthy();
    });

    it('applies reduced opacity when soundDisabled', () => {
      renderWithSound({ onClose: vi.fn(), showSound: true, soundDisabled: true });

      const soundBtn = screen.getByLabelText('Unmute');
      expect(soundBtn.style.opacity).toBe('0.4');
    });

    it('applies default cursor when soundDisabled', () => {
      renderWithSound({ onClose: vi.fn(), showSound: true, soundDisabled: true });

      const soundBtn = screen.getByLabelText('Unmute');
      expect(soundBtn.style.cursor).toBe('default');
    });

    it('applies pointer cursor when not disabled', () => {
      renderWithSound({ onClose: vi.fn(), showSound: true, soundDisabled: false });

      const soundBtn = screen.getByLabelText('Unmute');
      expect(soundBtn.style.cursor).toBe('pointer');
    });

    it('sets aria-disabled attribute when soundDisabled', () => {
      renderWithSound({ onClose: vi.fn(), showSound: true, soundDisabled: true });

      const soundBtn = screen.getByLabelText('Unmute');
      expect(soundBtn.getAttribute('aria-disabled')).toBe('true');
    });
  });
});
