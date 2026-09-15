import { captureFocusForReturn, createFocusTrap } from '@reelkit/core';

// When your modal opens:
const restoreFocus = captureFocusForReturn();
container.focus({ preventScroll: true });
const releaseTrap = createFocusTrap(container);

// When the modal closes:
releaseTrap();
restoreFocus();
