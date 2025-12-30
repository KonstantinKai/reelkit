import { html, render, TemplateResult } from 'lit';
// Import components for side effects (registers custom elements)
import '@reelkit/lit';
import type { ReelSlider, ReelIndicator } from '@reelkit/lit';

const TOTAL_SLIDES = 10000;

// Generate color from index using HSL for nice variety
const getSlideColor = (index: number): string => {
  const hue = (index * 37) % 360; // Golden angle for good distribution
  return `hsl(${hue}, 70%, 65%)`;
};

// Generate slide content from index
const getSlideContent = (index: number) => ({
  title: `Slide ${index + 1}`,
  description:
    index === 0
      ? 'Swipe up or down to navigate'
      : `Item #${index + 1} of ${TOTAL_SLIDES.toLocaleString()}`,
});

// State
let activeIndex = 0;
let reel: ReelSlider | null = null;
let indicator: ReelIndicator | null = null;

// Update counter display
function updateCounter() {
  const counter = document.getElementById('counter');
  if (counter) {
    counter.textContent = `${(activeIndex + 1).toLocaleString()} / ${TOTAL_SLIDES.toLocaleString()}`;
  }
}

// Handle slide change
function handleSlideChange(e: CustomEvent<{ index: number }>) {
  activeIndex = e.detail.index;
  updateCounter();
  indicator?.setActive(activeIndex);
}

// Handle indicator click
function handleIndicatorClick(e: CustomEvent<{ index: number }>) {
  reel?.goTo(e.detail.index, true);
}

// Handle navigation
function handlePrev() {
  reel?.prev();
}

function handleNext() {
  reel?.next();
}

function handleGoTo() {
  const input = document.getElementById('goto-input') as HTMLInputElement;
  const index = parseInt(input.value, 10) - 1;
  if (index >= 0 && index < TOTAL_SLIDES) {
    reel?.goTo(index, true);
  }
}

function handleGoToKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    handleGoTo();
  }
}

// Item builder for slider
const itemBuilder = (index: number): TemplateResult => {
  const slide = getSlideContent(index);
  return html`
    <div
      style="
        width: 100%;
        height: 100%;
        background-color: ${getSlideColor(index)};
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: #000;
      "
    >
      <h1 style="font-size: 3rem; margin-bottom: 1rem;">${slide.title}</h1>
      <p style="font-size: 1.5rem; opacity: 0.7;">${slide.description}</p>
    </div>
  `;
};

// Create the app
function createApp() {
  const app = document.getElementById('app')!;

  render(
    html`
      <!-- Slider Container -->
      <reel-slider
        id="reel"
        count=${TOTAL_SLIDES}
        direction="vertical"
        transition-duration="300"
        .itemBuilder=${itemBuilder}
        @reel-change=${handleSlideChange}
        style="width: 100vw; height: 100vh; overflow: hidden;"
      ></reel-slider>

      <!-- Position Counter -->
      <div
        id="counter"
        style="
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
        "
      >
        1 / ${TOTAL_SLIDES.toLocaleString()}
      </div>

      <!-- Navigation Buttons -->
      <div
        style="
          position: fixed;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 16px;
          z-index: 10;
        "
      >
        <button
          @click=${handlePrev}
          style="
            padding: 12px 24px;
            font-size: 1rem;
            background-color: rgba(0, 0, 0, 0.5);
            color: #fff;
            border: none;
            border-radius: 8px;
            cursor: pointer;
          "
        >
          ↑ Previous
        </button>
        <button
          @click=${handleNext}
          style="
            padding: 12px 24px;
            font-size: 1rem;
            background-color: rgba(0, 0, 0, 0.5);
            color: #fff;
            border: none;
            border-radius: 8px;
            cursor: pointer;
          "
        >
          Next ↓
        </button>
      </div>

      <!-- GoTo Controls -->
      <div
        style="
          position: fixed;
          bottom: 100px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          z-index: 10;
        "
      >
        <input
          id="goto-input"
          type="number"
          min="1"
          max=${TOTAL_SLIDES}
          placeholder="Slide #"
          @keydown=${handleGoToKeydown}
          style="
            padding: 12px 16px;
            font-size: 1rem;
            background-color: rgba(0, 0, 0, 0.5);
            color: #fff;
            border: none;
            border-radius: 8px;
            width: 100px;
            outline: none;
          "
        />
        <button
          @click=${handleGoTo}
          style="
            padding: 12px 24px;
            font-size: 1rem;
            background-color: rgba(0, 0, 0, 0.7);
            color: #fff;
            border: none;
            border-radius: 8px;
            cursor: pointer;
          "
        >
          Go
        </button>
      </div>

      <!-- Indicator -->
      <reel-indicator
        id="indicator"
        count=${TOTAL_SLIDES}
        direction="vertical"
        visible="4"
        radius="4"
        gap="6"
        @reel-indicator-click=${handleIndicatorClick}
        style="
          position: fixed;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
        "
      ></reel-indicator>
    `,
    app
  );

  // Get references to components
  reel = document.getElementById('reel') as ReelSlider;
  indicator = document.getElementById('indicator') as ReelIndicator;

  // Handle resize
  window.addEventListener('resize', () => {
    reel?.adjust();
  });
}

// Start the app
createApp();
