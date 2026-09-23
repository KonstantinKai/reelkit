import {
  defineComponent,
  onUnmounted,
  shallowRef,
  watch,
  type ExtractPropTypes,
  type PropType,
} from 'vue';
import { reaction, type Dispose, type Subscribable } from '@reelkit/core';

const sameSignals = (a: readonly Subscribable[], b: readonly Subscribable[]) =>
  a.length === b.length && a.every((signal, at) => signal === b[at]);

/** Props accepted by the {@link Observe} component. */
const observeProps = {
  /** Signals whose changes re-render the default slot. */
  signals: {
    type: Array as PropType<readonly Subscribable[]>,
    required: true as const,
  },
};

/** Public props interface for the {@link Observe} component. */
export type ObserveProps = ExtractPropTypes<typeof observeProps>;

/**
 * Re-renders its default slot whenever one of `signals` changes, and nothing
 * around it. Reading a core signal in a render function does not subscribe to
 * it; this component is where the subscription lives, so a signal that
 * changes often repaints only the part that shows it.
 *
 * Use it for a region inside a component that also renders something heavy,
 * such as a `Reel`. When a whole small component follows the signal,
 * `toVueRef` in its setup is enough.
 *
 * @example
 * ```vue
 * <Observe :signals="[progress]">
 *   <span>{{ Math.round(progress.value * 100) }}%</span>
 * </Observe>
 * ```
 *
 * From a render function the slot is a plain function:
 * `h(Observe, { signals: [progress] }, { default: () => … })`.
 */
export const Observe = defineComponent({
  name: 'Observe',
  props: observeProps,
  setup(props, { slots }) {
    const version = shallowRef(0);
    let followed: readonly Subscribable[] = [];
    let stop: Dispose | null = null;

    // The parent hands over a fresh array on every render; only a different
    // set of signals is followed again, and the old set let go.
    const follow = (signals: readonly Subscribable[]) => {
      if (stop && sameSignals(signals, followed)) return;
      stop?.();
      followed = signals;
      stop = reaction(
        () => signals,
        () => {
          version.value++;
        },
      );
    };

    watch(() => props.signals, follow, { immediate: true });

    onUnmounted(() => {
      stop?.();
      stop = null;
    });

    return () => {
      // Read so a signal change schedules this render.
      void version.value;
      return slots['default']?.();
    };
  },
});
