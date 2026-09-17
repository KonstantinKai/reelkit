<StoriesOverlay
  isOpen={isOpen}
  onClose={handleClose}
  groups={groups}
  desktopLayout="carousel"
  renderGroupPreview={({ group, story, onOpen }) => (
    <button
      type="button"
      className="my-story-card"
      aria-label={`Open stories by ${group.author.name}`}
      onClick={onOpen}
    >
      {story?.poster && <img src={story.poster} alt="" />}
      <span>{group.author.name}</span>
    </button>
  )}
/>
