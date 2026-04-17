import { mount, enableAutoUnmount } from '@vue/test-utils';
import { describe, it, expect, afterEach } from 'vitest';
import { defineComponent, h } from 'vue';
import { SoundProvider, useSoundState } from './useSoundState';

enableAutoUnmount(afterEach);

describe('SoundProvider + useSoundState', () => {
  it('provides SoundController to children', () => {
    let controller: ReturnType<typeof useSoundState> | null = null;

    const Consumer = defineComponent({
      setup() {
        controller = useSoundState();
        return () => h('div', 'consumer');
      },
    });

    mount(
      defineComponent({
        setup() {
          return () => h(SoundProvider, null, { default: () => h(Consumer) });
        },
      }),
    );

    expect(controller).not.toBeNull();
    expect(controller!.muted).toBeDefined();
    expect(controller!.disabled).toBeDefined();
    expect(controller!.toggle).toBeTypeOf('function');
  });

  it('throws when useSoundState is called outside SoundProvider', () => {
    const Consumer = defineComponent({
      setup() {
        useSoundState();
        return () => h('div');
      },
    });

    expect(() => mount(Consumer)).toThrow(
      'useSoundState must be used within SoundProvider',
    );
  });

  it('muted defaults to true', () => {
    let controller: ReturnType<typeof useSoundState> | null = null;

    const Consumer = defineComponent({
      setup() {
        controller = useSoundState();
        return () => h('div');
      },
    });

    mount(
      defineComponent({
        setup() {
          return () => h(SoundProvider, null, { default: () => h(Consumer) });
        },
      }),
    );

    expect(controller!.muted.value).toBe(true);
  });

  it('toggle switches muted state', () => {
    let controller: ReturnType<typeof useSoundState> | null = null;

    const Consumer = defineComponent({
      setup() {
        controller = useSoundState();
        return () => h('div');
      },
    });

    mount(
      defineComponent({
        setup() {
          return () => h(SoundProvider, null, { default: () => h(Consumer) });
        },
      }),
    );

    expect(controller!.muted.value).toBe(true);
    controller!.toggle();
    expect(controller!.muted.value).toBe(false);
  });
});
