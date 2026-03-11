import { test, expect } from '@playwright/test';

test.describe('Cross-page Navigation', () => {
  test('navigates to Reel Player via nav link', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav a', { hasText: 'Reel Player' }).click();

    await expect(page).toHaveURL(/\/reel-player/);
    await expect(page.getByRole('heading', { name: 'Reel Player Demo' })).toBeVisible();
  });

  test('navigates to Image Gallery via nav link', async ({ page }) => {
    await page.goto('/reel-player');
    await page.locator('nav a', { hasText: 'Image Gallery' }).click();

    await expect(page).toHaveURL(/\/image-preview/);
    await expect(page.getByRole('heading', { name: 'Image Gallery' })).toBeVisible();
  });

  test('navigates to Full Page Slider via nav link', async ({ page }) => {
    await page.goto('/image-preview');
    await page.locator('nav a', { hasText: 'Full Page Slider' }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('text=1 / 10,000')).toBeVisible();
  });

  test('active nav link has distinct background', async ({ page }) => {
    await page.goto('/');

    const sliderLink = page.locator('nav a', { hasText: 'Full Page Slider' });
    const reelLink = page.locator('nav a', { hasText: 'Reel Player' });

    const activeBg = await sliderLink.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor
    );
    const inactiveBg = await reelLink.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor
    );

    expect(activeBg).not.toBe(inactiveBg);

    // Navigate and wait for style change with retry
    await reelLink.click();
    await expect(page).toHaveURL(/\/reel-player/);

    await expect(async () => {
      const newReelBg = await reelLink.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor
      );
      const newSliderBg = await sliderLink.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor
      );

      // After navigation, reel link should be active and slider should be inactive
      expect(newReelBg).not.toBe(newSliderBg);
      expect(newSliderBg).not.toBe(activeBg);
    }).toPass();
  });
});
