import { test, expect } from '@playwright/test';
import { SliderPage } from '../../../e2e-utils/slider-page';

test.describe('Reel Svelte - Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders initial slide correctly', async ({ page }) => {
    const slider = new SliderPage(page);
    await slider.expectSlideTitle('Slide 1');
    await expect(page.locator('p').first()).toContainText('Swipe');
  });

  test('displays position counter', async ({ page }) => {
    await expect(page.locator('text=1 / 10,000')).toBeVisible();
  });
});

test.describe('Reel Svelte - Button Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
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
    await slider.clickNext();
    await slider.waitForAnimation();
    await slider.expectSlideTitle('Slide 2');
    await slider.clickPrev();
    await slider.waitForAnimation();
    await slider.expectSlideTitle('Slide 1');
    await expect(page.locator('text=1 / 10,000')).toBeVisible();
  });

  test('navigates through multiple slides', async ({ page }) => {
    const slider = new SliderPage(page);
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
    await slider.clickPrev();
    await slider.waitForAnimation();
    await slider.expectSlideTitle('Slide 1');
  });
});

test.describe('Reel Svelte - Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
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
    await slider.pressArrowDown();
    await slider.waitForAnimation();
    await slider.waitForKeyboardThrottle();
    await slider.pressArrowUp();
    await slider.waitForAnimation();
    await slider.expectSlideTitle('Slide 1');
  });
});

test.describe('Reel Svelte - Touch Gestures', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Touch API not supported');

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
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
    await slider.clickNext();
    await slider.waitForAnimation();
    await slider.swipeDown();
    await slider.waitForAnimation();
    await slider.expectSlideTitle('Slide 1');
  });
});

test.describe('Reel Svelte - Animation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('slide transition is animated', async ({ page }) => {
    const slider = new SliderPage(page);
    const initialTransform = await slider.getTransformValue();
    await slider.clickNext();
    await page.waitForTimeout(100);
    const midTransform = await slider.getTransformValue();
    expect(midTransform).not.toBe(initialTransform);
    await slider.waitForAnimation();
    const finalTransform = await slider.getTransformValue();
    expect(finalTransform).not.toBe(initialTransform);
  });
});

test.describe('Reel Svelte - Indicator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders indicator dots', async ({ page }) => {
    const dots = page.locator('[data-reel-indicator]');
    await expect(dots).toHaveCount(5);
  });

  test('shows indicator with visible dots plus edge dots', async ({ page }) => {
    const slider = new SliderPage(page);
    const indices = await slider.getVisibleIndicatorIndices();
    expect(indices.length).toBe(5);
    expect(indices[0]).toBe(0);
    expect(indices[4]).toBe(4);
  });

  test('active indicator matches current slide', async ({ page }) => {
    const slider = new SliderPage(page);
    const activeIndex = await slider.getActiveIndicatorIndex();
    expect(activeIndex).toBe(0);
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
    await slider.clickIndicatorByIndex(3);
    await slider.waitForAnimation();
    await slider.expectSlideTitle('Slide 4');
    await expect(page.locator('text=4 / 10,000')).toBeVisible();
  });

  test('trailing edge dot has smaller scale', async ({ page }) => {
    const slider = new SliderPage(page);
    const scale = await slider.getIndicatorScale(4);
    expect(scale).toBeLessThan(1);
    expect(scale).toBeCloseTo(0.5, 1);
  });

  test('indicator slides when navigating beyond visible window', async ({ page }) => {
    const slider = new SliderPage(page);
    for (let i = 0; i < 5; i++) {
      await slider.clickNext();
      await slider.waitForAnimation();
    }
    const indices = await slider.getVisibleIndicatorIndices();
    expect(indices).toContain(5);
    const leadingIndex = indices[0];
    const leadingScale = await slider.getIndicatorScale(leadingIndex);
    expect(leadingScale).toBeLessThan(1);
  });

  test('clicking edge dot updates indicator window', async ({ page }) => {
    const slider = new SliderPage(page);
    for (let i = 0; i < 5; i++) {
      await slider.clickNext();
      await slider.waitForAnimation();
    }
    const indices = await slider.getVisibleIndicatorIndices();
    const trailingIndex = indices[indices.length - 1];
    await slider.clickIndicatorByIndex(trailingIndex);
    await slider.waitForAnimation();
    await slider.expectSlideTitle(`Slide ${trailingIndex + 1}`);
  });
});

test.describe('Reel Svelte - Infinite List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('can navigate to high index slides', async ({ page }) => {
    const slider = new SliderPage(page);
    for (let i = 0; i < 20; i++) {
      await slider.clickNext();
      await slider.waitForAnimation();
    }
    await slider.expectSlideTitle('Slide 21');
    await expect(page.locator('text=21 / 10,000')).toBeVisible();
  });

  test('renders dynamically generated titles', async ({ page }) => {
    const slider = new SliderPage(page);
    await slider.expectSlideTitle('Slide 1');
    await slider.clickNext();
    await slider.waitForAnimation();
    await slider.expectSlideTitle('Slide 2');
    for (let i = 0; i < 8; i++) {
      await slider.clickNext();
      await slider.waitForAnimation();
    }
    await slider.expectSlideTitle('Slide 10');
  });

  test('goTo with animation shows smooth transition', async ({ page }) => {
    const slider = new SliderPage(page);
    await slider.expectSlideTitle('Slide 1');
    const initialTransform = await slider.getTransformValue();
    await page.locator('input[type="number"]').fill('100');
    await page.locator('button', { hasText: 'Go' }).click();
    await page.waitForTimeout(100);
    const midTransform = await slider.getTransformValue();
    expect(midTransform).not.toBe(initialTransform);
    await slider.waitForAnimation();
    await slider.expectSlideTitle('Slide 100');
    await expect(page.locator('text=100 / 10,000')).toBeVisible();
  });

  test('goTo backwards with animation works correctly', async ({ page }) => {
    const slider = new SliderPage(page);
    await page.locator('input[type="number"]').fill('50');
    await page.locator('button', { hasText: 'Go' }).click();
    await slider.waitForAnimation();
    await slider.expectSlideTitle('Slide 50');
    await page.locator('input[type="number"]').fill('10');
    await page.locator('button', { hasText: 'Go' }).click();
    await slider.waitForAnimation();
    await slider.expectSlideTitle('Slide 10');
    await expect(page.locator('text=10 / 10,000')).toBeVisible();
  });
});
