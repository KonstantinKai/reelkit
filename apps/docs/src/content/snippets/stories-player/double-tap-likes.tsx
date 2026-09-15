<StoriesOverlay
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  groups={groups}
  onDoubleTap={(groupIndex, storyIndex) => {
    // Built-in heart animation plays automatically.
    // Handle the like in your own state:
    const story = groups[groupIndex].stories[storyIndex];
    toggleLike(story.id);
  }}
/>
