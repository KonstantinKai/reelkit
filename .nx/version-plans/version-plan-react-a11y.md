---
'@reelkit/react': minor
---

Carousel ARIA: role=region, aria-roledescription=carousel, ariaLabel prop on Reel
aria-live polite region announces slide changes without re-rendering the component tree
inert attribute on inactive slides prevents focus and hides from assistive technology
role=tabpanel on each slide wrapper
ReelIndicator: role=tablist with role=tab, aria-selected, and roving tabindex on dots
Keyboard navigation: Arrow keys, Home, End move focus between dots; Enter and Space activate
