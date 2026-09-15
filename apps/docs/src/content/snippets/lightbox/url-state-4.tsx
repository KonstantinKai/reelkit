const photo = useOverlayUrlState({
  param: 'photo',
  ...urlStableIdKey({ items: () => images }),
});

<LightboxUrlOverlay controller={photo} images={images} />
