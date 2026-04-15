import { test, expect } from '@playwright/test';

test.describe('Cross-page Navigation', () => {
  test('navigates to Reel Player via nav link', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav a', { hasText: 'Reel Player' }).click();

    await expect(page).toHaveURL(/\/reel-player/);
    await expect(
      page.getByRole('heading', { name: 'Reel Player Demo' }),
    ).toBeVisible();
  });

  test('navigates to Image Gallery via nav link', async ({ page }) => {
    await page.goto('/reel-player');
    await page.locator('nav a', { hasText: 'Image Gallery' }).click();

    await expect(page).toHaveURL(/\/image-preview/);
    await expect(
      page.getByRole('heading', { name: 'Image Gallery' }),
    ).toBeVisible();
  });

  test('navigates to Full Page Slider via nav link', async ({ page }) => {
    await page.goto('/image-preview');
    await page.locator('nav a', { hasText: 'Full Page Slider' }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('text=1 / 10,000')).toBeVisible();
  });

  test('navigates to Custom Player via nav link', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav a', { hasText: 'Custom Player' }).click();

    await expect(page).toHaveURL(/\/reel-player-custom/);
    await expect(
      page.getByRole('heading', { name: 'Custom Reel Player' }),
    ).toBeVisible();
  });

  test('navigates to Custom Gallery via nav link', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav a', { hasText: 'Custom Gallery' }).click();

    await expect(page).toHaveURL(/\/image-preview-custom/);
    await expect(
      page.getByRole('heading', { name: 'Custom Lightbox' }),
    ).toBeVisible();
  });

  test('navigates to Video Gallery via nav link', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav a', { hasText: 'Video Gallery' }).click();

    await expect(page).toHaveURL(/\/image-preview-video/);
    await expect(
      page.getByRole('heading', { name: /Mixed Gallery/ }),
    ).toBeVisible();
  });

  test('all 6 nav links are visible', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.locator('nav a', { hasText: 'Full Page Slider' }),
    ).toBeVisible();
    await expect(
      page.locator('nav a', { hasText: 'Reel Player' }),
    ).toBeVisible();
    await expect(
      page.locator('nav a', { hasText: 'Custom Player' }),
    ).toBeVisible();
    await expect(
      page.locator('nav a', { hasText: 'Image Gallery' }),
    ).toBeVisible();
    await expect(
      page.locator('nav a', { hasText: 'Custom Gallery' }),
    ).toBeVisible();
    await expect(
      page.locator('nav a', { hasText: 'Video Gallery' }),
    ).toBeVisible();
  });

  test('active nav link has distinct background', async ({ page }) => {
    await page.goto('/');

    const sliderLink = page.locator('nav a', { hasText: 'Full Page Slider' });
    const reelLink = page.locator('nav a', { hasText: 'Reel Player' });

    const activeBg = await sliderLink.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    const inactiveBg = await reelLink.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );

    expect(activeBg).not.toBe(inactiveBg);

    // toPass retries because Angular's router-link-active class applies after navigation
    await reelLink.click();
    await expect(page).toHaveURL(/\/reel-player/);

    await expect(async () => {
      const newReelBg = await reelLink.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );
      const newSliderBg = await sliderLink.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );

      expect(newReelBg).not.toBe(newSliderBg);
      expect(newSliderBg).not.toBe(activeBg);
    }).toPass();
  });
});
