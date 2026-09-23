import { effect } from '@angular/core';
import type { StoriesViewedStateController } from '@reelkit/stories-core';

/**
 * Reads the viewed store and follows other tabs for as long as the calling
 * component lives, releasing it on destroy and re-attaching if the controller
 * is swapped for another.
 *
 * Call it in an injection context — a field initialiser or the constructor —
 * and hand it the `viewed` input itself, not its value: an input cannot be
 * read before the first change detection, and this has to survive the input
 * changing afterwards.
 *
 * It belongs in the components that exist before the player opens, because
 * the player picks its opening story while it first renders and the store has
 * to be readable by then. Attaching is counted, so a ring list and a player
 * can each call this and be destroyed in either order. Nothing is read before
 * the component renders, so a server render and the first client render
 * agree.
 *
 * @param viewed - The `viewed` input signal. A player configured without a
 * controller reads nothing, which is what it wants.
 */
export function attachViewedState(
  viewed: () => StoriesViewedStateController | undefined,
): void {
  effect((onCleanup) => {
    const release = viewed()?.attach();
    if (release) onCleanup(release);
  });
}
