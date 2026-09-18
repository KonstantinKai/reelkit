// The same controller the ring list takes: the cards draw the same rings and
// repaint by themselves when a story is marked seen.
<StoriesOverlay
  isOpen={open}
  onClose={() => setOpen(false)}
  groups={groups}
  initialGroupIndex={group}
  desktopLayout="carousel"
  viewed={viewed}
/>;
