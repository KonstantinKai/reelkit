useEffect(() => {
  if (!isOpen) return;
  const html = document.documentElement;
  const prev = html.style.overscrollBehaviorY;
  html.style.overscrollBehaviorY = 'contain';
  return () => {
    html.style.overscrollBehaviorY = prev;
  };
}, [isOpen]);
