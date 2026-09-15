// Connect to DOM element
controller.attach(element);

// Start gesture, keyboard, and wheel observation
controller.observe();

// Stop gesture, keyboard, and wheel observation
controller.unobserve();

// Detach DOM listeners (reversible — use for React effect cleanup)
controller.detach();

// Permanent teardown (use for Angular onDestroy)
controller.dispose();

// Recalculate positions
controller.adjust();

// Update size
controller.setPrimarySize(600);
