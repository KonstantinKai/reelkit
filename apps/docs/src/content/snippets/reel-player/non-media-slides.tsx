<ReelPlayerOverlay
  isOpen={isOpen}
  onClose={handleClose}
  content={content}
  renderSlide={({ index, size }) => {
    // CTA card on last slide
    if (index === content.length - 1) {
      return (
        <div style={{
          width: size[0],
          height: size[1],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: '#fff',
        }}>
          <div style={{ textAlign: 'center' }}>
            <h2>Follow for more!</h2>
            <button>Subscribe</button>
          </div>
        </div>
      );
    }
    // Fall back to default MediaSlide + overlay
    return null;
  }}
/>
