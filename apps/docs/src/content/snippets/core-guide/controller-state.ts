const { index, axisValue, indexes } = controller.state;

// Observe index changes (returns a disposer function)
const disposeIndex = index.observe(() => {
  console.log('Current index:', index.value);
});

// Observe visible indexes for virtualization
const disposeIndexes = indexes.observe(() => {
  console.log('Visible:', indexes.value);
});

// Cleanup when done
disposeIndex();
disposeIndexes();
