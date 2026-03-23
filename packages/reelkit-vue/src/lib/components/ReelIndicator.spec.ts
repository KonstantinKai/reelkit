import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { h, provide, defineComponent } from 'vue';
import { createSignal } from '@reelkit/core';
import { ReelIndicator } from './ReelIndicator';
import { RK_REEL_KEY, type ReelContextValue } from '../context/ReelContext';

function createMockContext(
  overrides: Partial<ReelContextValue> = {},
): ReelContextValue {
  return {
    index: createSignal(0),
    count: createSignal(3),
    goTo: vi.fn(() => Promise.resolve()),
    ...overrides,
  };
}

function mountWithContext(
  ctx: ReelContextValue,
  indicatorProps: Record<string, unknown> = {},
) {
  const Wrapper = defineComponent({
    setup() {
      provide(RK_REEL_KEY, ctx);
      return () => h(ReelIndicator, indicatorProps);
    },
  });

  return mount(Wrapper);
}

describe('ReelIndicator', () => {
  describe('controlled mode', () => {
    it('renders correct number of dots', () => {
      const wrapper = mount(ReelIndicator, {
        props: { count: 3, active: 0 },
      });

      const dots = wrapper.findAll('[data-reel-indicator]');
      expect(dots.length).toBeGreaterThan(0);
      expect(dots.length).toBeLessThanOrEqual(3);
    });

    it('active dot has active color', () => {
      const wrapper = mount(ReelIndicator, {
        props: { count: 3, active: 1, activeColor: '#ff0000' },
      });

      const activeDot = wrapper.find('[data-reel-indicator="1"] span');
      expect(activeDot.element.style.backgroundColor).toBe('rgb(255, 0, 0)');
    });

    it('renders with explicit props without context', () => {
      const wrapper = mount(ReelIndicator, {
        props: { count: 5, active: 2 },
      });

      expect(wrapper.findAll('[data-reel-indicator]').length).toBeGreaterThan(
        0,
      );
    });
  });

  describe('context auto-connect', () => {
    it('reads from context when props omitted', () => {
      const ctx = createMockContext();
      ctx.count.value = 4;
      ctx.index.value = 1;

      const wrapper = mountWithContext(ctx);
      const dots = wrapper.findAll('[data-reel-indicator]');
      expect(dots.length).toBeGreaterThan(0);
    });

    it('throws when no props AND no context for active', () => {
      expect(() => {
        mount(ReelIndicator, {
          props: { count: 3 },
        });
      }).toThrow(
        'ReelIndicator: "active" prop is required when rendered outside a <Reel> component.',
      );
    });

    it('throws when no props AND no context for count', () => {
      expect(() => {
        mount(ReelIndicator, {
          props: { active: 0 },
        });
      }).toThrow(
        'ReelIndicator: "count" prop is required when rendered outside a <Reel> component.',
      );
    });

    it('auto-wires dotClick to goTo from context', async () => {
      const ctx = createMockContext();
      ctx.count.value = 5;

      const wrapper = mountWithContext(ctx);
      const dot = wrapper.find('[data-reel-indicator="1"]');
      await dot.trigger('click');

      expect(ctx.goTo).toHaveBeenCalledWith(1, true);
    });

    it('custom onDotClick overrides auto-wire', async () => {
      const ctx = createMockContext();
      ctx.count.value = 5;
      const customClick = vi.fn();

      const wrapper = mountWithContext(ctx, { onDotClick: customClick });
      const dot = wrapper.find('[data-reel-indicator="1"]');
      await dot.trigger('click');

      expect(customClick).toHaveBeenCalledWith(1);
      expect(ctx.goTo).not.toHaveBeenCalled();
    });
  });

  describe('direction', () => {
    it('renders vertical by default', () => {
      const wrapper = mount(ReelIndicator, {
        props: { count: 3, active: 0 },
      });

      const container = wrapper.element as HTMLElement;
      expect(container.style.height).toBeTruthy();
    });

    it('renders horizontal when direction=horizontal', () => {
      const wrapper = mount(ReelIndicator, {
        props: { count: 3, active: 0, direction: 'horizontal' },
      });

      const container = wrapper.element as HTMLElement;
      expect(container.style.width).toBeTruthy();
    });
  });
});
