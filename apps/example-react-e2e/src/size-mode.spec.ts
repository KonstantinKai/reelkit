import { test, expect, type Page } from '@playwright/test';
import { SliderPage } from '../../../e2e-utils/slider-page';

const SIZE_MODE_KEY = 'reelkit-fullpage-size-mode';

// JS click to bypass nav bar overlap on mobile/tablet viewports
const clickToggle = (page: Page) =>
  page.locator('button', { hasText: /^size:/ }).evaluate((el: HTMLElement) => el.click());

test.describe('Reel React - Explicit Size Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Ensure explicit mode (default)
    await page.evaluate((key) => localStorage.removeItem(key), SIZE_MODE_KEY);
    await page.reload();
  });

  test('toggle button shows explicit size dimensions', async ({ page }) => {
    const toggle = page.locator('button', { hasText: /^size:/ });
    const text = await toggle.textContent();
    expect(text).toMatch(/size: \[\d+, \d+\]/);
  });

  test('Reel root has inline pixel dimensions', async ({ page }) => {
    // The Reel root is the element with both overflow:hidden and explicit pixel width
    const reelRoot = page
      .locator('[style*="overflow: hidden"][style*="px"]')
      .first();
    const style = await reelRoot.getAttribute('style');
    expect(style).toMatch(/width:\s*\d+px/);
    expect(style).toMatch(/height:\s*\d+px/);
  });

  test('slider renders and navigates in explicit mode', async ({ page }) => {
    const slider = new SliderPage(page);

    await slider.expectSlideTitle('Slide 1');
    await slider.clickNext();
    await slider.waitForAnimation();
    await slider.expectSlideTitle('Slide 2');
  });
});

test.describe('Reel React - Auto Size Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Set auto mode via localStorage before loading
    await page.addInitScript((key) => {
      localStorage.setItem(key, 'auto');
    }, SIZE_MODE_KEY);
    await page.goto('/');
  });

  test('toggle button shows auto label', async ({ page }) => {
    const toggle = page.locator('button', { hasText: /^size:/ });
    await expect(toggle).toHaveText('size: auto');
  });

  test('root element has 100% width and height instead of pixel values', async ({
    page,
  }) => {
    // The Reel's own root div should have width: 100% / height: 100%
    const reelRoot = page
      .locator('[style*="overflow: hidden"][style*="100%"]')
      .first();
    await expect(reelRoot).toBeVisible();
  });

  test('slider renders slides after auto-measurement', async ({ page }) => {
    const slider = new SliderPage(page);
    await slider.expectSlideTitle('Slide 1');
    await expect(page.locator('text=1 / 10,000')).toBeVisible();
  });

  test('navigation works in auto mode', async ({ page }) => {
    const slider = new SliderPage(page);

    await slider.expectSlideTitle('Slide 1');
    await slider.clickNext();
    await slider.waitForAnimation();
    await slider.expectSlideTitle('Slide 2');
    await expect(page.locator('text=2 / 10,000')).toBeVisible();
  });

  test('keyboard navigation works in auto mode', async ({ page }) => {
    const slider = new SliderPage(page);

    await slider.expectSlideTitle('Slide 1');
    await slider.pressArrowDown();
    await slider.waitForAnimation();
    await slider.expectSlideTitle('Slide 2');
  });

  test('goTo works in auto mode', async ({ page }) => {
    const slider = new SliderPage(page);

    await slider.expectSlideTitle('Slide 1');
    await page.locator('input[type="number"]').fill('50');
    await page.locator('button', { hasText: 'Go' }).click();
    await slider.waitForAnimation();
    await slider.expectSlideTitle('Slide 50');
  });

  test('indicator updates in auto mode', async ({ page }) => {
    const slider = new SliderPage(page);

    await slider.clickNext();
    await slider.waitForAnimation();
    await slider.clickNext();
    await slider.waitForAnimation();

    const activeIndex = await slider.getActiveIndicatorIndex();
    expect(activeIndex).toBe(2);
  });
});

test.describe('Reel React - Size Mode Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('clicking toggle switches from explicit to auto', async ({ page }) => {
    const toggle = page.locator('button', { hasText: /^size:/ });

    // Default is explicit
    await expect(toggle).toHaveText(/size: \[\d+, \d+\]/);

    await clickToggle(page);

    await expect(toggle).toHaveText('size: auto');
  });

  test('clicking toggle twice returns to explicit', async ({ page }) => {
    const toggle = page.locator('button', { hasText: /^size:/ });

    await clickToggle(page);
    await expect(toggle).toHaveText('size: auto');

    await clickToggle(page);
    await expect(toggle).toHaveText(/size: \[\d+, \d+\]/);
  });

  test('slider still works after toggling to auto', async ({ page }) => {
    const slider = new SliderPage(page);
    const toggle = page.locator('button', { hasText: /^size:/ });

    // Switch to auto
    await clickToggle(page);
    await expect(toggle).toHaveText('size: auto');

    // Wait for ResizeObserver to measure
    await page.waitForTimeout(200);

    await slider.expectSlideTitle('Slide 1');
    await slider.clickNext();
    await slider.waitForAnimation();
    await slider.expectSlideTitle('Slide 2');
  });

  test('slider still works after toggling back to explicit', async ({
    page,
  }) => {
    const slider = new SliderPage(page);

    // Toggle to auto, then back
    await clickToggle(page);
    await page.waitForTimeout(200);
    await clickToggle(page);

    await slider.expectSlideTitle('Slide 1');
    await slider.clickNext();
    await slider.waitForAnimation();
    await slider.expectSlideTitle('Slide 2');
  });
});

test.describe('Reel React - Size Mode Persistence', () => {
  test('explicit mode persists across page reload', async ({ page }) => {
    await page.goto('/');

    const toggle = page.locator('button', { hasText: /^size:/ });
    await expect(toggle).toHaveText(/size: \[\d+, \d+\]/);

    await page.reload();

    await expect(toggle).toHaveText(/size: \[\d+, \d+\]/);
  });

  test('auto mode persists across page reload', async ({ page }) => {
    await page.goto('/');

    const toggle = page.locator('button', { hasText: /^size:/ });
    await clickToggle(page);
    await expect(toggle).toHaveText('size: auto');

    await page.reload();

    await expect(toggle).toHaveText('size: auto');
  });

  test('localStorage value is set correctly', async ({ page }) => {
    await page.goto('/');

    await clickToggle(page);

    const stored = await page.evaluate(
      (key) => localStorage.getItem(key),
      SIZE_MODE_KEY,
    );
    expect(stored).toBe('auto');
  });
});
