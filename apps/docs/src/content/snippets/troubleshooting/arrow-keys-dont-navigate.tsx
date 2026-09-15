<Reel
  onNavKeyPress={(increment) => {
    // Your custom logic here
    console.log('Nav key:', increment);
    // You must trigger navigation yourself:
    apiRef.current?.[increment === 1 ? 'next' : 'prev']();
  }}
/>
