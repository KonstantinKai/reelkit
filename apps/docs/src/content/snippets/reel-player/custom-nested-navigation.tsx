<ReelPlayerOverlay
  isOpen={isOpen}
  onClose={handleClose}
  content={content}
  renderNestedNavigation={({ onPrev, onNext, activeIndex, count }) => (
    <div style={{
      position: 'absolute',
      bottom: 48,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'center',
      gap: 8,
      zIndex: 10,
    }}>
      <button onClick={onPrev} disabled={activeIndex === 0}>Prev</button>
      <span>{activeIndex + 1} / {count}</span>
      <button onClick={onNext} disabled={activeIndex === count - 1}>Next</button>
    </div>
  )}
/>
