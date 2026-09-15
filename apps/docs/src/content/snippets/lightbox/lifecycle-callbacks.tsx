// Inside renderSlide — wire callbacks to your custom media
renderSlide={({ item, index, size, isActive, onReady, onWaiting, onError }) => (
  <div style={{ width: size[0], height: size[1] }}>
    {item.type === 'video' ? (
      <video
        src={item.src}
        poster={item.poster}
        autoPlay={isActive}
        onCanPlay={onReady}
        onWaiting={onWaiting}
        onError={onError}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    ) : (
      <img
        src={item.src}
        onLoad={onReady}
        onError={onError}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    )}
  </div>
)}
