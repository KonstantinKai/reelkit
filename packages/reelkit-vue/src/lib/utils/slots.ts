import type { VNode } from 'vue';
import { Comment, Fragment } from 'vue';

/**
 * True if the slot result contains at least one node that will produce
 * actual DOM output (not just `v-if` placeholder comments). Used to
 * decide whether to render the consumer's customization or fall back
 * to a component's built-in default rendering.
 *
 * Vue's slot compiler emits a `Comment` placeholder VNode for `v-if`
 * branches that evaluate to false, so a slot like
 * `<template #slide><CustomSlide v-if="…" /></template>` returns a
 * non-empty array of comment nodes for the falsy branch — checking
 * `length > 0` alone would treat that as customization and skip the
 * default. This helper unwraps `Fragment`s and ignores comments.
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
