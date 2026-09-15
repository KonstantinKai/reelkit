<ReelPlayerOverlay
  isOpen={isOpen}
  onClose={handleClose}
  content={content}
  renderNavigation={({ onPrev, onNext, activeIndex, count }) => (
    <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)' }}>
      <button onClick={onPrev} disabled={activeIndex === 0}>Up</button>
      <span>{activeIndex + 1}/{count}</span>
      <button onClick={onNext} disabled={activeIndex === count - 1}>Down</button>
    </div>
  )}
/>
