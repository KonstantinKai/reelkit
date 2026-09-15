import { createSignal, createComputed, reaction } from '@reelkit/core';

// Create a signal
const count = createSignal(0);

// Observe changes (returns a disposer function)
const dispose = count.observe(() => console.log(count.value));

// Update value
count.value = 5;

// Create computed signal (requires a deps factory)
const doubled = createComputed(() => count.value * 2, () => [count]);

// Run side effects on signal changes
const disposeReaction = reaction(
  () => [count],
  () => console.log('Count changed:', count.value)
);

// Cleanup
dispose();
disposeReaction();
