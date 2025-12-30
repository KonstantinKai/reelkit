import { test, expect } from '@playwright/test';
import { SliderPage } from '../../../e2e-utils/slider-page';

test.describe('OneItemSlider React - Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200');
  });

  test('renders initial slide correctly', async ({ page }) => {
    const slider = new SliderPage(page);

    await slider.expectSlideTitle('Slide 1');
    await expect(page.locator('p').first()).toContainText('Swipe');
  });

  test('renders correct number of indicators', async ({ page }) => {
    const slider = new SliderPage(page);

    const count = await slider.getIndicatorCount();
    expect(count).toBe(5);
  });

  test('first indicator is active initially', async ({ page }) => {
    const slider = new SliderPage(page);

    await slider.expectActiveIndicator(0);
  });
});

test.describe('OneItemSlider React - Button Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200');
  });

  test('navigates to next slide with Next button', async ({ page }) => {
    const slider = new SliderPage(page);

    await slider.expectSlideTitle('Slide 1');
    await slider.clickNext();
    await slider.waitForAnimation();

    await slider.expectSlideTitle('Slide 2');
    await slider.expectActiveIndicator(1);
  });

  test('navigates to previous slide with Previous button', async ({ page }) => {
    const slider = new SliderPage(page);

    // Go to slide 2 first
    await slider.clickNext();
    await slider.waitForAnimation();
    await slider.expectSlideTitle('Slide 2');

    // Go back to slide 1
    await slider.clickPrev();
    await slider.waitForAnimation();

    await slider.expectSlideTitle('Slide 1');
    await slider.expectActiveIndicator(0);
  });

  test('navigates through all slides', async ({ page }) => {
    const slider = new SliderPage(page);
    const expectedTitles = ['Slide 1', 'Slide 2', 'Slide 3', 'Slide 4', 'Slide 5'];

    for (let i = 0; i < expectedTitles.length; i++) {
      await slider.expectSlideTitle(expectedTitles[i]);
      await slider.expectActiveIndicator(i);

      if (i < expectedTitles.length - 1) {
        await slider.clickNext();
        await slider.waitForAnimation();
      }
    }
  });

  test('cannot navigate past last slide', async ({ page }) => {
    const slider = new SliderPage(page);

    // Navigate to last slide
    for (let i = 0; i < 4; i++) {
      await slider.clickNext();
      await slider.waitForAnimation();
    }

    await slider.expectSlideTitle('Slide 5');

    // Try to go past last slide
    await slider.clickNext();
    await slider.waitForAnimation();

    // Should still be on slide 5
    await slider.expectSlideTitle('Slide 5');
    await slider.expectActiveIndicator(4);
  });

  test('cannot navigate before first slide', async ({ page }) => {
    const slider = new SliderPage(page);

    await slider.expectSlideTitle('Slide 1');

    // Try to go before first slide
    await slider.clickPrev();
    await slider.waitForAnimation();

    // Should still be on slide 1
    await slider.expectSlideTitle('Slide 1');
    await slider.expectActiveIndicator(0);
  });
});

test.describe('OneItemSlider React - Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200');
  });

  test('navigates with ArrowDown key', async ({ page }) => {
    const slider = new SliderPage(page);

    await slider.expectSlideTitle('Slide 1');
    await slider.pressArrowDown();
    await slider.waitForAnimation();

    await slider.expectSlideTitle('Slide 2');
  });

  test('navigates with ArrowUp key', async ({ page }) => {
    const slider = new SliderPage(page);

    // Go to slide 2 first
    await slider.pressArrowDown();
    await slider.waitForAnimation();

    // Wait for keyboard throttle to reset before next key press
    await slider.waitForKeyboardThrottle();

    // Go back with ArrowUp
    await slider.pressArrowUp();
    await slider.waitForAnimation();

    await slider.expectSlideTitle('Slide 1');
  });
});

test.describe('OneItemSlider React - Indicator Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200');
  });

  test('navigates by clicking indicator', async ({ page }) => {
    const slider = new SliderPage(page);

    await slider.expectSlideTitle('Slide 1');

    // Click third indicator (index 2)
    await slider.clickIndicator(2);
    await slider.waitForAnimation();
    await slider.waitForAnimation(); // goTo may need multiple animations

    await slider.expectSlideTitle('Slide 3');
    await slider.expectActiveIndicator(2);
  });

  test('navigates to last slide via indicator', async ({ page }) => {
    const slider = new SliderPage(page);

    await slider.clickIndicator(4);
    // Wait for multiple animations (goTo steps through each slide)
    for (let i = 0; i < 4; i++) {
      await slider.waitForAnimation();
    }

    await slider.expectSlideTitle('Slide 5');
  });
});

test.describe('OneItemSlider React - Touch Gestures', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200');
  });

  test('swipe up navigates to next slide', async ({ page }) => {

    const slider = new SliderPage(page);

    await slider.expectSlideTitle('Slide 1');
    await slider.swipeUp();
    await slider.waitForAnimation();

    await slider.expectSlideTitle('Slide 2');
  });

  test('swipe down navigates to previous slide', async ({ page }) => {

    const slider = new SliderPage(page);

    // Go to slide 2 first
    await slider.clickNext();
    await slider.waitForAnimation();

    await slider.swipeDown();
    await slider.waitForAnimation();

    await slider.expectSlideTitle('Slide 1');
  });
});

test.describe('OneItemSlider React - Animation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200');
  });

  test('slide transition is animated', async ({ page }) => {
    const slider = new SliderPage(page);

    const initialTransform = await slider.getTransformValue();

    await slider.clickNext();

    // Check that animation is happening (value should be changing)
    await page.waitForTimeout(100);
    const midTransform = await slider.getTransformValue();

    // Transform should have changed from initial
    expect(midTransform).not.toBe(initialTransform);

    await slider.waitForAnimation();

    // After animation, should be at final position
    const finalTransform = await slider.getTransformValue();
    expect(finalTransform).not.toBe(initialTransform);
  });
});
