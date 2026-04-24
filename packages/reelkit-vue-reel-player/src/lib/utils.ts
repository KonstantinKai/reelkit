import type { Slot, VNode } from 'vue';

/**
 * Cast a named slot to a typed render-fn-style callable.
 *
 * When `ReelPlayerOverlay` forwards a slot to a deeper component (e.g.
 * `nestedNavigation` to `NestedSlider`), the deeper component takes a
 * plain function prop — not a Vue slot. This helper wraps the cast in a
 * single typed call so the forwarding sites stay readable.
 *
 * Returns `undefined` when the slot isn't provided so the consuming
 * component can use its own default rendering.
 *
 * @internal
 */
export function slotAsRender<TScope>(
  slot: Slot | undefined,
): ((scope: TScope) => VNode | VNode[] | null) | undefined {
  return slot as ((scope: TScope) => VNode | VNode[] | null) | undefined;
}
