import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { defineComponent, h, nextTick, type VNode } from 'vue';
import { SoundProvider, useSoundState } from '@reelkit/vue';
import { CloseButton, PlayerControls, SoundButton } from './PlayerControls';

type SoundCtl = ReturnType<typeof useSoundState>;

// Mounts the given node inside a sound provider and hands back the
// provider's controller, the same one the buttons read.
const mountWithSound = (render: () => VNode) => {
  let sound: SoundCtl | undefined;
  const Probe = defineComponent({
    setup() {
      sound = useSoundState();
      return render;
    },
  });
  const wrapper = mount(
    defineComponent({
      setup: () => () => h(SoundProvider, null, { default: () => [h(Probe)] }),
    }),
  );
  return { wrapper, sound: () => sound! };
};

const soundButton = (wrapper: ReturnType<typeof mount>) =>
  wrapper.find('.rk-reel-sound-btn');

describe('PlayerControls', () => {
  it('always renders the close button', () => {
    const { wrapper } = mountWithSound(() =>
      h(PlayerControls, { onClose: () => undefined }),
    );

    expect(wrapper.find('.rk-reel-close-btn').attributes('aria-label')).toBe(
      'Close',
    );
  });

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn();
    const { wrapper } = mountWithSound(() => h(PlayerControls, { onClose }));

    await wrapper.find('.rk-reel-close-btn').trigger('click');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('leaves the sound button out by default', () => {
    const { wrapper } = mountWithSound(() =>
      h(PlayerControls, { onClose: () => undefined }),
    );

    expect(soundButton(wrapper).exists()).toBe(false);
  });

  it('renders the sound button when showSound is on', () => {
    const { wrapper } = mountWithSound(() =>
      h(PlayerControls, { onClose: () => undefined, showSound: true }),
    );

    expect(soundButton(wrapper).attributes('aria-label')).toBe('Unmute');
    expect(soundButton(wrapper).attributes('aria-disabled')).toBe('false');
  });

  it('toggles the muted state from the sound button', async () => {
    const { wrapper, sound } = mountWithSound(() =>
      h(PlayerControls, { onClose: () => undefined, showSound: true }),
    );

    await soundButton(wrapper).trigger('click');

    expect(sound().muted.value).toBe(false);
    expect(soundButton(wrapper).attributes('aria-label')).toBe('Mute');
  });

  it('ignores clicks on a sound button marked disabled', async () => {
    const { wrapper, sound } = mountWithSound(() =>
      h(PlayerControls, {
        onClose: () => undefined,
        showSound: true,
        soundDisabled: true,
      }),
    );

    await soundButton(wrapper).trigger('click');

    expect(sound().muted.value).toBe(true);
    expect(soundButton(wrapper).attributes('aria-disabled')).toBe('true');
  });

  it('hides the sound button while the sound state is disabled', async () => {
    const { wrapper, sound } = mountWithSound(() =>
      h(PlayerControls, { onClose: () => undefined, showSound: true }),
    );

    sound().disabled.value = true;
    await nextTick();

    expect(soundButton(wrapper).exists()).toBe(false);
  });
});

describe('CloseButton and SoundButton', () => {
  it('apply a custom class name and style', () => {
    const { wrapper } = mountWithSound(() =>
      h('div', [
        h(CloseButton, {
          onClick: () => undefined,
          className: 'my-close',
          style: { top: '4px' },
        }),
        h(SoundButton, { className: 'my-sound', style: { bottom: '4px' } }),
      ]),
    );

    const close = wrapper.find('.my-close');
    const sound = wrapper.find('.my-sound');
    expect(close.classes()).toContain('rk-reel-button');
    expect((close.element as HTMLElement).style.top).toBe('4px');
    expect(sound.classes()).toContain('rk-reel-button');
    expect((sound.element as HTMLElement).style.bottom).toBe('4px');
  });
});
