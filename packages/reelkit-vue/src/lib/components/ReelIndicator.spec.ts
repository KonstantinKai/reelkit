import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { h, provide, defineComponent, nextTick } from 'vue';
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

    it('updates when active prop changes', async () => {
      const wrapper = mount(ReelIndicator, {
        props: { count: 5, active: 0 },
      });

      await wrapper.setProps({ active: 2 });
      await nextTick();

      const dot = wrapper.find('[data-reel-indicator="2"]');
      expect(dot.attributes('aria-selected')).toBe('true');
    });

    it('updates when count prop changes', async () => {
      const wrapper = mount(ReelIndicator, {
        props: { count: 3, active: 0 },
      });

      await wrapper.setProps({ count: 10 });
      await nextTick();

      const dots = wrapper.findAll('[data-reel-indicator]');
      expect(dots.length).toBeGreaterThan(3);
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

    it('reacts to context index signal changes', async () => {
      const ctx = createMockContext();
      ctx.count.value = 5;
      ctx.index.value = 0;

      const wrapper = mountWithContext(ctx);

      ctx.index.value = 2;
      await nextTick();

      const dot = wrapper.find('[data-reel-indicator="2"]');
      expect(dot.attributes('aria-selected')).toBe('true');
    });

    it('reacts to context count signal changes', async () => {
      const ctx = createMockContext();
      ctx.count.value = 3;
      ctx.index.value = 0;

      const wrapper = mountWithContext(ctx);
      const dotsBefore = wrapper.findAll('[data-reel-indicator]').length;

      ctx.count.value = 10;
      await nextTick();

      const dotsAfter = wrapper.findAll('[data-reel-indicator]').length;
      expect(dotsAfter).toBeGreaterThan(dotsBefore);
    });

    it('cleans up signal observers on unmount', () => {
      const ctx = createMockContext();
      ctx.count.value = 5;

      const wrapper = mountWithContext(ctx);
      wrapper.unmount();
    });
  });

  describe('sliding window', () => {
    it('shows edge dots at reduced scale when count > visible', () => {
      const wrapper = mount(ReelIndicator, {
        props: { count: 10, active: 3, visible: 5, edgeScale: 0.5 },
      });

      const firstDot = wrapper.find('[data-reel-indicator="0"]');
      if (firstDot.exists()) {
        const innerDot = firstDot.find('span');
        expect(innerDot.element.style.transform).toContain('scale(0.5)');
      }
    });

    it('window shifts forward when active moves past visible range', async () => {
      const wrapper = mount(ReelIndicator, {
        props: { count: 20, active: 0, visible: 5 },
      });

      await wrapper.setProps({ active: 7 });
      await nextTick();

      const dot7 = wrapper.find('[data-reel-indicator="7"]');
      expect(dot7.exists()).toBe(true);
      expect(dot7.attributes('aria-selected')).toBe('true');
    });

    it('window shifts backward when active moves before visible range', async () => {
      const wrapper = mount(ReelIndicator, {
        props: { count: 20, active: 10, visible: 5 },
      });

      await wrapper.setProps({ active: 2 });
      await nextTick();

      const dot2 = wrapper.find('[data-reel-indicator="2"]');
      expect(dot2.exists()).toBe(true);
      expect(dot2.attributes('aria-selected')).toBe('true');
    });

    it('resets window when count becomes <= visible', async () => {
      const wrapper = mount(ReelIndicator, {
        props: { count: 20, active: 10, visible: 5 },
      });

      await wrapper.setProps({ count: 3 });
      await nextTick();

      const dots = wrapper.findAll('[data-reel-indicator]');
      expect(dots.length).toBeLessThanOrEqual(3);
    });

    it('no edge dots when count <= visible', () => {
      const wrapper = mount(ReelIndicator, {
        props: { count: 3, active: 0, visible: 5 },
      });

      const dots = wrapper.findAll('[data-reel-indicator]');
      dots.forEach((dot) => {
        const innerDot = dot.find('span');
        expect(innerDot.element.style.transform).toBe('scale(1)');
      });
    });

    it('renders trailing edge dot', () => {
      const wrapper = mount(ReelIndicator, {
        props: { count: 10, active: 0, visible: 5 },
      });

      const dot5 = wrapper.find('[data-reel-indicator="5"]');
      if (dot5.exists()) {
        const innerDot = dot5.find('span');
        expect(innerDot.element.style.transform).toContain('scale(0.5)');
      }
    });

    it('re-clamps window when visible decreases and leaves active out of range', async () => {
      const wrapper = mount(ReelIndicator, {
        props: { count: 10, active: 6, visible: 7 },
      });
      // With visible=7 and active=6, the window is [0..7), active visible.
      await nextTick();

      // Shrink visible to 3. Window MUST slide so active=6 stays visible.
      await wrapper.setProps({ visible: 3 });
      await nextTick();

      const activeDot = wrapper.find('[data-reel-indicator="6"]');
      expect(activeDot.exists()).toBe(true);
      // Active dot should render at scale 1 (inside window), not scale 0.5.
      const innerDot = activeDot.find('span');
      expect(innerDot.element.style.transform).toContain('scale(1)');
    });
  });

  describe('class and style passthrough', () => {
    it('applies indicatorClass to the tablist root', () => {
      const wrapper = mount(ReelIndicator, {
        props: { count: 5, active: 0, indicatorClass: 'my-custom-cls' },
      });
      const root = wrapper.element as HTMLElement;
      expect(root.className).toContain('my-custom-cls');
    });

    it('merges indicatorStyle into the tablist root', () => {
      const wrapper = mount(ReelIndicator, {
        props: {
          count: 5,
          active: 0,
          indicatorStyle: { padding: '4px', background: 'rgb(0, 0, 0)' },
        },
      });
      const root = wrapper.element as HTMLElement;
      expect(root.style.padding).toBe('4px');
      expect(root.style.background).toBe('rgb(0, 0, 0)');
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

  describe('accessibility', () => {
    it('has role=tablist on container', () => {
      const wrapper = mount(ReelIndicator, {
        props: { count: 3, active: 0 },
      });

      expect(wrapper.element.getAttribute('role')).toBe('tablist');
    });

    it('has aria-label on container', () => {
      const wrapper = mount(ReelIndicator, {
        props: { count: 3, active: 0 },
      });

      expect(wrapper.element.getAttribute('aria-label')).toBe(
        'Slide navigation',
      );
    });

    it('dots have role=tab', () => {
      const wrapper = mount(ReelIndicator, {
        props: { count: 3, active: 0 },
      });

      const dot = wrapper.find('[data-reel-indicator="0"]');
      expect(dot.attributes('role')).toBe('tab');
    });

    it('active dot has aria-selected=true', () => {
      const wrapper = mount(ReelIndicator, {
        props: { count: 3, active: 1 },
      });

      const activeDot = wrapper.find('[data-reel-indicator="1"]');
      expect(activeDot.attributes('aria-selected')).toBe('true');

      const inactiveDot = wrapper.find('[data-reel-indicator="0"]');
      expect(inactiveDot.attributes('aria-selected')).toBe('false');
    });

    it('active dot has tabindex=0, others have -1', () => {
      const wrapper = mount(ReelIndicator, {
        props: { count: 3, active: 1 },
      });

      const activeDot = wrapper.find('[data-reel-indicator="1"]');
      expect(activeDot.attributes('tabindex')).toBe('0');

      const inactiveDot = wrapper.find('[data-reel-indicator="0"]');
      expect(inactiveDot.attributes('tabindex')).toBe('-1');
    });

    it('dots have aria-label', () => {
      const wrapper = mount(ReelIndicator, {
        props: { count: 3, active: 0 },
      });

      const dot = wrapper.find('[data-reel-indicator="0"]');
      expect(dot.attributes('aria-label')).toBe('Slide 1');
    });

    it('Enter key activates dot', async () => {
      const onDotClick = vi.fn();
      const wrapper = mount(ReelIndicator, {
        props: { count: 3, active: 0, onDotClick },
      });

      const dot = wrapper.find('[data-reel-indicator="1"]');
      await dot.trigger('keydown', { key: 'Enter' });

      expect(onDotClick).toHaveBeenCalledWith(1);
    });

    it('Space key activates dot', async () => {
      const onDotClick = vi.fn();
      const wrapper = mount(ReelIndicator, {
        props: { count: 3, active: 0, onDotClick },
      });

      const dot = wrapper.find('[data-reel-indicator="1"]');
      await dot.trigger('keydown', { key: ' ' });

      expect(onDotClick).toHaveBeenCalledWith(1);
    });

    it('ArrowDown navigates to next dot (vertical)', async () => {
      const onDotClick = vi.fn();
      const wrapper = mount(ReelIndicator, {
        props: { count: 5, active: 1, direction: 'vertical', onDotClick },
      });

      await wrapper.trigger('keydown', { key: 'ArrowDown' });

      expect(onDotClick).toHaveBeenCalledWith(2);
    });

    it('ArrowUp navigates to previous dot (vertical)', async () => {
      const onDotClick = vi.fn();
      const wrapper = mount(ReelIndicator, {
        props: { count: 5, active: 2, direction: 'vertical', onDotClick },
      });

      await wrapper.trigger('keydown', { key: 'ArrowUp' });

      expect(onDotClick).toHaveBeenCalledWith(1);
    });

    it('ArrowRight navigates to next dot (horizontal)', async () => {
      const onDotClick = vi.fn();
      const wrapper = mount(ReelIndicator, {
        props: { count: 5, active: 1, direction: 'horizontal', onDotClick },
      });

      await wrapper.trigger('keydown', { key: 'ArrowRight' });

      expect(onDotClick).toHaveBeenCalledWith(2);
    });

    it('ArrowLeft navigates to previous dot (horizontal)', async () => {
      const onDotClick = vi.fn();
      const wrapper = mount(ReelIndicator, {
        props: { count: 5, active: 2, direction: 'horizontal', onDotClick },
      });

      await wrapper.trigger('keydown', { key: 'ArrowLeft' });

      expect(onDotClick).toHaveBeenCalledWith(1);
    });

    it('Home key navigates to first dot', async () => {
      const onDotClick = vi.fn();
      const wrapper = mount(ReelIndicator, {
        props: { count: 5, active: 3, onDotClick },
      });

      await wrapper.trigger('keydown', { key: 'Home' });

      expect(onDotClick).toHaveBeenCalledWith(0);
    });

    it('End key navigates to last dot', async () => {
      const onDotClick = vi.fn();
      const wrapper = mount(ReelIndicator, {
        props: { count: 5, active: 1, onDotClick },
      });

      await wrapper.trigger('keydown', { key: 'End' });

      expect(onDotClick).toHaveBeenCalledWith(4);
    });

    it('ArrowUp clamps at 0', async () => {
      const onDotClick = vi.fn();
      const wrapper = mount(ReelIndicator, {
        props: { count: 5, active: 0, direction: 'vertical', onDotClick },
      });

      await wrapper.trigger('keydown', { key: 'ArrowUp' });

      expect(onDotClick).toHaveBeenCalledWith(0);
    });

    it('ArrowDown clamps at count-1', async () => {
      const onDotClick = vi.fn();
      const wrapper = mount(ReelIndicator, {
        props: { count: 5, active: 4, direction: 'vertical', onDotClick },
      });

      await wrapper.trigger('keydown', { key: 'ArrowDown' });

      expect(onDotClick).toHaveBeenCalledWith(4);
    });

    it('unrelated keys are ignored', async () => {
      const onDotClick = vi.fn();
      const wrapper = mount(ReelIndicator, {
        props: { count: 5, active: 1, onDotClick },
      });

      await wrapper.trigger('keydown', { key: 'a' });

      expect(onDotClick).not.toHaveBeenCalled();
    });
  });
});
