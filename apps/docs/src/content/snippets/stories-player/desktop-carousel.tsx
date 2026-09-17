<Observe signals={[seen.entries]}>
  {() => (
    <StoriesOverlay
      isOpen={open}
      onClose={() => setOpen(false)}
      groups={groups}
      initialGroupIndex={group}
      desktopLayout="carousel"
      viewedState={viewed.viewedCounts()}
      resumeStoryIndex={viewed.resumeStoryIndex}
      onStoryViewed={viewed.markViewed}
    />
  )}
</Observe>
