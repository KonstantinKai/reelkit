import { describe, expect, expectTypeOf, it } from 'vitest';
import * as entry from './index';
import type { OverlayUrlStateOptions } from './index';

// What a consumer imports comes from this one entry point, so anything the
// package documents has to be reachable from it.
describe('package entry point', () => {
  it('exports the composable that reads the viewed store before the player opens', () => {
    expect(entry.useAttachViewedState).toBeTypeOf('function');
  });

  // Checked by the type checker: an import of a type the entry point does not
  // export fails the build rather than this run.
  it('exports the options type of the url state composable', () => {
    expectTypeOf<OverlayUrlStateOptions>().toHaveProperty('param');
  });
});
