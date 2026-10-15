import { createSlideshowController, createSliderController } from '@reelkit/core';

const items = [{ type: 'image' }, { type: 'video' }, { type: 'image' }];

const slider = createSliderController(
  { count: items.length, direction: 'horizontal' },
  { onAfterChange: (index) => onSlideChange(index) },
);

const slideshow = createSlideshowController({
  interval: 5000,
  onAdvance: () => {
    if (slider.state.index.value >= items.length - 1) slideshow.pause();
    else slider.next();
  },
});

// Every slide change starts over and waits for the new slide.
function onSlideChange(index: number) {
  slideshow.setSlide(items[index].type === 'video' ? 'video' : 'image');
}

// From the slide: an image counts its interval once it loaded or failed,
// a video advances when it ends (let it play once rather than loop).
const onImageSettled = () => slideshow.ready();
const onVideoEnded = () => slideshow.ended();

// Holds stack: the slideshow runs again once every reason is released.
const onControlsEnter = () => slideshow.hold('hover');
const onControlsLeave = () => slideshow.release('hover');

onSlideChange(0);
slideshow.play();

// Later
slideshow.dispose();
