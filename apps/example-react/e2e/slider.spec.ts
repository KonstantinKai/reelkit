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

  test('displays position counter', async ({ page }) => {
    // Check for "1 / 10,000" counter
    await expect(page.locator('text=1 / 10,000')).toBeVisible();
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
    await expect(page.locator('text=2 / 10,000')).toBeVisible();
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
    await expect(page.locator('text=1 / 10,000')).toBeVisible();
  });

  test('navigates through multiple slides', async ({ page }) => {
    const slider = new SliderPage(page);

    // Navigate forward 5 times
    for (let i = 1; i <= 5; i++) {
      await slider.expectSlideTitle(`Slide ${i}`);
      await slider.clickNext();
      await slider.waitForAnimation();
    }

    await slider.expectSlideTitle('Slide 6');
  });

  test('cannot navigate before first slide', async ({ page }) => {
    const slider = new SliderPage(page);

    await slider.expectSlideTitle('Slide 1');

    // Try to go before first slide
    await slider.clickPrev();
    await slider.waitForAnimation();

    // Should still be on slide 1
    await slider.expectSlideTitle('Slide 1');
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

test.describe('OneItemSlider React - Infinite List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200');
  });

  test('can navigate to high index slides', async ({ page }) => {
    const slider = new SliderPage(page);

    // Navigate forward 20 times rapidly
    for (let i = 0; i < 20; i++) {
      await slider.clickNext();
      await slider.waitForAnimation();
    }

    await slider.expectSlideTitle('Slide 21');
    await expect(page.locator('text=21 / 10,000')).toBeVisible();
  });

  test('renders dynamically generated titles', async ({ page }) => {
    const slider = new SliderPage(page);

    // Navigate to various slides and verify dynamic title generation
    await slider.expectSlideTitle('Slide 1');

    await slider.clickNext();
    await slider.waitForAnimation();
    await slider.expectSlideTitle('Slide 2');

    // Navigate to slide 10
    for (let i = 0; i < 8; i++) {
      await slider.clickNext();
      await slider.waitForAnimation();
    }
    await slider.expectSlideTitle('Slide 10');
  });

  test('goTo with animation shows smooth transition', async ({ page }) => {
    const slider = new SliderPage(page);

    await slider.expectSlideTitle('Slide 1');

    // Get initial transform value
    const initialTransform = await slider.getTransformValue();

    // Type target slide number and trigger goTo with animation
    await page.locator('input[type="number"]').fill('100');
    await page.locator('button', { hasText: 'Go' }).click();

    // Check that animation is happening (transform should be changing)
    await page.waitForTimeout(100);
    const midTransform = await slider.getTransformValue();
    expect(midTransform).not.toBe(initialTransform);

    // Wait for animation to complete
    await slider.waitForAnimation();

    // Verify we landed on the correct slide
    await slider.expectSlideTitle('Slide 100');
    await expect(page.locator('text=100 / 10,000')).toBeVisible();
  });

  test('goTo backwards with animation works correctly', async ({ page }) => {
    const slider = new SliderPage(page);

    // First navigate to slide 50
    await page.locator('input[type="number"]').fill('50');
    await page.locator('button', { hasText: 'Go' }).click();
    await slider.waitForAnimation();
    await slider.expectSlideTitle('Slide 50');

    // Now go backwards to slide 10
    await page.locator('input[type="number"]').fill('10');
    await page.locator('button', { hasText: 'Go' }).click();
    await slider.waitForAnimation();

    await slider.expectSlideTitle('Slide 10');
    await expect(page.locator('text=10 / 10,000')).toBeVisible();
  });
});
