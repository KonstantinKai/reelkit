// Inside renderSlide — wire callbacks to your custom media
renderSlide={({ item, size, isActive, onReady, onWaiting, onError }) => (
  <div style={{ width: size[0], height: size[1] }}>
    {item.media[0].type === 'image' ? (
      <img
        src={item.media[0].src}
        onLoad={onReady}
        onError={onError}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    ) : (
      <video
        src={item.media[0].src}
        autoPlay={isActive}
        onCanPlay={onReady}
        onWaiting={onWaiting}
        onError={onError}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    )}
  </div>
)}
