import { test, expect } from '@playwright/test';
import { SliderPage } from '../../../e2e-utils/slider-page';

const BASE_URL = 'http://localhost:4202';

test.describe('Reel DOM - Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
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

  test('renders indicator dots', async ({ page }) => {
    // Instagram-style indicator shows: 4 normal dots + 1 small trailing dot (5 total at start)
    const dots = page.locator('[data-reel-indicator]');
    await expect(dots).toHaveCount(5);
  });
});

test.describe('Reel DOM - Button Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
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

test.describe('Reel DOM - Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
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

test.describe('Reel DOM - Touch Gestures', () => {
  // Touch constructor is only available in Chromium-based browsers on desktop
  // Skip these tests on Firefox, WebKit, and mobile browsers
  test.skip(({ browserName }) => browserName !== 'chromium', 'Touch API not supported');

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
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

test.describe('Reel DOM - Animation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('slide transitions complete correctly', async ({ page }) => {
    const slider = new SliderPage(page);

    await slider.expectSlideTitle('Slide 1');

    await slider.clickNext();
    await slider.waitForAnimation();

    // After animation completes, should show next slide
    await slider.expectSlideTitle('Slide 2');
    await expect(page.locator('text=2 / 10,000')).toBeVisible();
  });
});

test.describe('Reel DOM - Indicator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('shows indicator with visible dots plus edge dots', async ({ page }) => {
    const slider = new SliderPage(page);

    // At index 0, should show dots 0-4 (visible=4 plus trailing edge)
    const indices = await slider.getVisibleIndicatorIndices();
    expect(indices.length).toBe(5); // 4 visible + 1 trailing edge
    expect(indices[0]).toBe(0);
    expect(indices[4]).toBe(4);
  });

  test('active indicator matches current slide', async ({ page }) => {
    const slider = new SliderPage(page);

    // Initially at index 0
    const activeIndex = await slider.getActiveIndicatorIndex();
    expect(activeIndex).toBe(0);

    // Navigate to slide 2
    await slider.clickNext();
    await slider.waitForAnimation();
    await slider.clickNext();
    await slider.waitForAnimation();

    const newActiveIndex = await slider.getActiveIndicatorIndex();
    expect(newActiveIndex).toBe(2);
  });

  test('clicking indicator navigates to slide', async ({ page }) => {
    const slider = new SliderPage(page);

    await slider.expectSlideTitle('Slide 1');

    // Click on indicator 3
    await slider.clickIndicatorByIndex(3);
    await slider.waitForAnimation();

    await slider.expectSlideTitle('Slide 4');
    await expect(page.locator('text=4 / 10,000')).toBeVisible();
  });

  test('trailing edge dot has smaller scale', async ({ page }) => {
    const slider = new SliderPage(page);

    // At index 0, dot 4 should be the trailing edge with scale 0.5
    const scale = await slider.getIndicatorScale(4);
    expect(scale).toBeLessThan(1);
    expect(scale).toBeCloseTo(0.5, 1);
  });

  test('indicator slides when navigating beyond visible window', async ({ page }) => {
    const slider = new SliderPage(page);

    // Navigate forward 5 times to go beyond visible=4
    for (let i = 0; i < 5; i++) {
      await slider.clickNext();
      await slider.waitForAnimation();
    }

    // At index 5, visible window should include dots around index 5
    const indices = await slider.getVisibleIndicatorIndices();
    expect(indices).toContain(5);

    // Should now have leading edge dot (smaller scale)
    const leadingIndex = indices[0];
    const leadingScale = await slider.getIndicatorScale(leadingIndex);
    expect(leadingScale).toBeLessThan(1);
  });

  test('clicking edge dot updates indicator window', async ({ page }) => {
    const slider = new SliderPage(page);

    // Navigate forward to have both leading and trailing edges
    for (let i = 0; i < 5; i++) {
      await slider.clickNext();
      await slider.waitForAnimation();
    }

    // Click on a trailing edge dot if visible
    const indices = await slider.getVisibleIndicatorIndices();
    const trailingIndex = indices[indices.length - 1];
    await slider.clickIndicatorByIndex(trailingIndex);
    await slider.waitForAnimation();

    // Should navigate to that slide
    await slider.expectSlideTitle(`Slide ${trailingIndex + 1}`);
  });
});

test.describe('Reel DOM - GoTo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('goTo with animation navigates correctly', async ({ page }) => {
    const slider = new SliderPage(page);

    await slider.expectSlideTitle('Slide 1');

    // Type target slide number and trigger goTo with animation
    await page.locator('input[type="number"]').fill('100');
    await page.locator('button', { hasText: 'Go' }).click();

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

  test('goTo with Enter key', async ({ page }) => {
    const slider = new SliderPage(page);

    await slider.expectSlideTitle('Slide 1');

    // Type target slide number and press Enter
    const input = page.locator('input[type="number"]');
    await input.fill('25');
    await input.press('Enter');

    await slider.waitForAnimation();

    await slider.expectSlideTitle('Slide 25');
  });
});
