// Wrap default slides with rounded corners
<ReelPlayerOverlay
  isOpen={isOpen}
  onClose={handleClose}
  content={content}
  renderNestedSlide={({ defaultContent }) => (
    <div style={{ borderRadius: 16, overflow: 'hidden' }}>
      {defaultContent}
    </div>
  )}
/>

// Fully custom nested slide for images
<ReelPlayerOverlay
  isOpen={isOpen}
  onClose={handleClose}
  content={content}
  renderNestedSlide={({ item, size, isActive, slideKey, onVideoRef, defaultContent }) => {
    if (item.type === 'video') return defaultContent; // keep default video
    return (
      <ImageSlide
        src={item.src}
        size={size}
        imgStyle={{ objectFit: 'contain' }}
        style={{ backgroundColor: '#111' }}
      />
    );
  }}
/>
