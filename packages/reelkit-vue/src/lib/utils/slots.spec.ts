import { describe, expect, it } from 'vitest';
import { Comment, Fragment, createCommentVNode, h, type VNode } from 'vue';
import { hasRenderedNodes } from './slots';

describe('hasRenderedNodes', () => {
  it('returns false for null / undefined / empty arrays', () => {
    expect(hasRenderedNodes(null)).toBe(false);
    expect(hasRenderedNodes(undefined)).toBe(false);
    expect(hasRenderedNodes([])).toBe(false);
  });

  it('returns false for an array of Comment placeholders (v-if false branches)', () => {
    const nodes: VNode[] = [createCommentVNode('v-if'), createCommentVNode()];
    expect(hasRenderedNodes(nodes)).toBe(false);
    expect(nodes[0].type).toBe(Comment);
  });

  it('returns true for a real element VNode', () => {
    expect(hasRenderedNodes([h('div', 'content')])).toBe(true);
  });

  it('recurses into Fragments and ignores nested Comment-only branches', () => {
    const emptyFragment = h(Fragment, null, [createCommentVNode()]);
    const populatedFragment = h(Fragment, null, [h('span', 'x')]);
    expect(hasRenderedNodes([emptyFragment])).toBe(false);
    expect(hasRenderedNodes([populatedFragment])).toBe(true);
  });

  it('returns true when at least one sibling is renderable', () => {
    expect(hasRenderedNodes([createCommentVNode(), h('div', 'content')])).toBe(
      true,
    );
  });
});
