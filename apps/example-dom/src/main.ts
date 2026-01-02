import { Reel, ReelIndicator } from '@reelkit/dom';

const TOTAL_SLIDES = 10000;

// Generate color from index using HSL for nice variety
const getSlideColor = (index: number): string => {
  const hue = (index * 37) % 360; // Golden angle for good distribution
  return `hsl(${hue}, 70%, 65%)`;
};

// Generate slide content from index
const getSlideContent = (index: number) => ({
  title: `Slide ${index + 1}`,
  description: index === 0
    ? 'Swipe up or down to navigate'
    : `Item #${index + 1} of ${TOTAL_SLIDES.toLocaleString()}`,
});

// State
let activeIndex = 0;
let reel: Reel;
let indicator: ReelIndicator;

// Create the app
function createApp() {
  const app = document.getElementById('app')!;

  // Container
  const container = document.createElement('div');
  container.id = 'slider-container';
  container.style.width = '100vw';
  container.style.height = '100vh';
  container.style.overflow = 'hidden';

  // Position counter
  const counter = document.createElement('div');
  counter.id = 'counter';
  counter.style.cssText = `
    position: fixed;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    padding: 8px 16px;
    background-color: rgba(0, 0, 0, 0.5);
    color: #fff;
    border-radius: 20px;
    font-size: 0.9rem;
    z-index: 10;
  `;
  updateCounter();

  // Navigation buttons
  const navContainer = document.createElement('div');
  navContainer.style.cssText = `
    position: fixed;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 16px;
    z-index: 10;
  `;

  const prevButton = createButton('↑ Previous', () => reel.prev());
  const nextButton = createButton('Next ↓', () => reel.next());
  navContainer.appendChild(prevButton);
  navContainer.appendChild(nextButton);

  // GoTo controls
  const goToContainer = document.createElement('div');
  goToContainer.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
    z-index: 10;
  `;

  const goToInput = document.createElement('input');
  goToInput.type = 'number';
  goToInput.min = '1';
  goToInput.max = String(TOTAL_SLIDES);
  goToInput.placeholder = 'Slide #';
  goToInput.style.cssText = `
    padding: 12px 16px;
    font-size: 1rem;
    background-color: rgba(0, 0, 0, 0.5);
    color: #fff;
    border: none;
    border-radius: 8px;
    width: 100px;
    outline: none;
  `;

  const goToButton = createButton('Go', () => {
    const index = parseInt(goToInput.value, 10) - 1;
    if (index >= 0 && index < TOTAL_SLIDES) {
      reel.goTo(index, true);
    }
  });
  goToButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';

  goToInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const index = parseInt(goToInput.value, 10) - 1;
      if (index >= 0 && index < TOTAL_SLIDES) {
        reel.goTo(index, true);
      }
    }
  });

  goToContainer.appendChild(goToInput);
  goToContainer.appendChild(goToButton);

  // Indicator container
  const indicatorContainer = document.createElement('div');
  indicatorContainer.id = 'indicator';
  indicatorContainer.style.cssText = `
    position: fixed;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
  `;

  // Append all to app
  app.appendChild(container);
  app.appendChild(counter);
  app.appendChild(navContainer);
  app.appendChild(goToContainer);
  app.appendChild(indicatorContainer);

  // Initialize Reel
  reel = new Reel(
    {
      element: container,
      count: TOTAL_SLIDES,
      direction: 'vertical',
      enableWheel: true,
      itemBuilder: (index) => {
        const slide = getSlideContent(index);
        const div = document.createElement('div');
        div.style.cssText = `
          width: 100%;
          height: 100%;
          background-color: ${getSlideColor(index)};
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: #000;
        `;

        const h1 = document.createElement('h1');
        h1.textContent = slide.title;
        h1.style.cssText = 'font-size: 3rem; margin-bottom: 1rem;';

        const p = document.createElement('p');
        p.textContent = slide.description;
        p.style.cssText = 'font-size: 1.5rem; opacity: 0.7;';

        div.appendChild(h1);
        div.appendChild(p);

        return div;
      },
    },
    {
      onChange: (index) => {
        activeIndex = index;
        updateCounter();
        indicator.setActive(index);
      },
    }
  );

  // Initialize Indicator
  indicator = new ReelIndicator({
    element: indicatorContainer,
    count: TOTAL_SLIDES,
    direction: 'vertical',
    visible: 4,
    radius: 4,
    gap: 6,
  });

  indicator.onClick((index) => {
    reel.goTo(index, true);
  });

  // Handle resize
  window.addEventListener('resize', () => {
    reel.adjust();
  });

  function updateCounter() {
    counter.textContent = `${(activeIndex + 1).toLocaleString()} / ${TOTAL_SLIDES.toLocaleString()}`;
  }
}

function createButton(text: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.textContent = text;
  button.style.cssText = `
    padding: 12px 24px;
    font-size: 1rem;
    background-color: rgba(0, 0, 0, 0.5);
    color: #fff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  `;
  button.addEventListener('click', onClick);
  return button;
}

// Start the app
createApp();
