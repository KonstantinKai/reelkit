import { createUrlStateController, urlIndexKey } from '@reelkit/core';

const controller = createUrlStateController({
  param: 'photo',
  ...urlIndexKey(() => items.length),
});

const detach = controller.attach(); // begin mirroring the URL
controller.position.observe(() => {
  // null → closed; a number → open at that slide
  render(controller.position.value);
});

// Write back: opening pushes once, navigating replaces, closing clears
controller.set(3);
controller.set(null);
