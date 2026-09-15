<ReelPlayerOverlay
  isOpen={isOpen}
  onClose={handleClose}
  content={content}
  renderSlideOverlay={(item, index, isActive) => (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
      color: '#fff',
    }}>
      <h3>{item.author.name}</h3>
      <p>{item.description}</p>
      <span>Slide {index + 1} {isActive ? '(active)' : ''}</span>
    </div>
  )}
/>
