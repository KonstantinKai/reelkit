import type { Slot, VNode } from 'vue';
import { Comment, Fragment } from 'vue';

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

/**
 * True if the slot result contains at least one node that will produce
 * actual DOM output (not just `v-if` placeholder comments). Used to
 * decide whether to render the consumer's customization or fall back to
 * the built-in default rendering.
 *
 * Vue's slot compiler emits a `Comment` placeholder VNode for `v-if`
 * branches that evaluate to false, so a slot like
 * `<template #slide><CtaSlide v-if="..." /></template>` returns a
 * non-empty array of comment nodes for the falsy branch — checking
 * `length > 0` alone would treat that as customization and skip the
 * default. This helper unwraps `Fragment`s and ignores comments.
 *
 * @internal
 */
export function hasRenderedNodes(nodes: VNode[] | null | undefined): boolean {
  if (!nodes) return false;
  return nodes.some((vn) => {
    if (vn == null) return false;
    if (vn.type === Comment) return false;
    if (vn.type === Fragment) {
      return hasRenderedNodes(vn.children as VNode[]);
    }
    return true;
  });
}
