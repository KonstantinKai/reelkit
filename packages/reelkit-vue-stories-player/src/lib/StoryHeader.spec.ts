import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { StoryHeader } from './StoryHeader';

const author = { id: '1', name: 'Alice', avatar: 'alice.jpg' };
const verifiedAuthor = { ...author, verified: true };

const renderHeader = (props: Record<string, unknown> = {}) =>
  mount(StoryHeader, { props: { author, onClose: vi.fn(), ...props } });

const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

describe('StoryHeader', () => {
  it('renders author name and avatar', () => {
    const wrapper = renderHeader();
    expect(wrapper.text()).toContain('Alice');
    const img = wrapper.find('img').element as HTMLImageElement;
    expect(img.src).toContain('alice.jpg');
    expect(img.alt).toBe('Alice');
  });

  it('renders the verified badge only for a verified author', () => {
    expect(
      renderHeader({ author: verifiedAuthor })
        .find('.rk-stories-header-verified')
        .exists(),
    ).toBe(true);
    expect(renderHeader().find('.rk-stories-header-verified').exists()).toBe(
      false,
    );
  });

  it.each([
    [0, 'now'],
    [30 * 60_000, '30m'],
    [2 * 3600_000, '2h'],
    [3 * 86_400_000, '3d'],
    [14 * 86_400_000, '2w'],
  ])('labels a story %i milliseconds old as "%s"', (age, label) => {
    expect(
      renderHeader({ createdAt: ago(age) })
        .find('.rk-stories-header-time')
        .text(),
    ).toBe(label);
  });

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn();
    const wrapper = renderHeader({ onClose });
    await wrapper.find('[aria-label="Close"]').trigger('click');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows pause by default and play when paused', async () => {
    const onTogglePause = vi.fn();
    const wrapper = renderHeader({ onTogglePause, isPaused: false });
    expect(wrapper.find('[aria-label="Pause"]').exists()).toBe(true);

    await wrapper.setProps({ isPaused: true });
    expect(wrapper.find('[aria-label="Play"]').exists()).toBe(true);

    await wrapper.find('[aria-label="Play"]').trigger('click');
    expect(onTogglePause).toHaveBeenCalledTimes(1);
  });

  it('shows the sound button for a video, labelled by the muted state', async () => {
    const onToggleSound = vi.fn();
    const wrapper = renderHeader({
      isVideo: true,
      isMuted: false,
      onToggleSound,
    });
    expect(wrapper.find('[aria-label="Mute"]').exists()).toBe(true);

    await wrapper.setProps({ isMuted: true });
    await wrapper.find('[aria-label="Unmute"]').trigger('click');
    expect(onToggleSound).toHaveBeenCalledTimes(1);
  });

  it('hides the sound button for a story that is not a video', () => {
    const wrapper = renderHeader({ isVideo: false, onToggleSound: vi.fn() });
    expect(wrapper.find('[aria-label="Mute"]').exists()).toBe(false);
    expect(wrapper.find('[aria-label="Unmute"]').exists()).toBe(false);
  });

  it('shows the spinner while loading, but not over an error', () => {
    expect(
      renderHeader({ isLoading: true })
        .find('.rk-stories-header-spinner')
        .exists(),
    ).toBe(true);
    expect(
      renderHeader({ isLoading: true, isError: true })
        .find('.rk-stories-header-spinner')
        .exists(),
    ).toBe(false);
  });

  it('marks the header hidden only when visible is false', () => {
    expect(
      renderHeader({ visible: false }).classes('rk-stories-header--hidden'),
    ).toBe(true);
    expect(renderHeader().classes('rk-stories-header--hidden')).toBe(false);
  });
});
