// Every group carries its own progress bar and header, so both turn with the
// group instead of switching above the player once it has changed.
<StoriesOverlay
  isOpen={open}
  onClose={() => setOpen(false)}
  groups={groups}
  chromePlacement="group"
/>;
