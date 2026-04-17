import { test, expect } from '@playwright/test';
import { SliderPage } from './slider-page';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('renders initial slide', async ({ page }) => {
  const slider = new SliderPage(page);
  await slider.expectSlideTitle('Slide 1');
});

test('next button navigates forward', async ({ page }) => {
  const slider = new SliderPage(page);
  await slider.clickNext();
  await slider.waitForAnimation();
  await slider.expectSlideTitle('Slide 2');
});

test('prev button navigates back', async ({ page }) => {
  const slider = new SliderPage(page);
  await slider.clickNext();
  await slider.waitForAnimation();
  await slider.clickPrev();
  await slider.waitForAnimation();
  await slider.expectSlideTitle('Slide 1');
});

test('cannot navigate before first slide', async ({ page }) => {
  const slider = new SliderPage(page);
  await slider.clickPrev();
  await slider.waitForAnimation();
  await slider.expectSlideTitle('Slide 1');
});

test('ArrowDown key navigates forward', async ({ page }) => {
  const slider = new SliderPage(page);
  await slider.pressArrowDown();
  await slider.waitForAnimation();
  await slider.expectSlideTitle('Slide 2');
});

test('ArrowUp key navigates back', async ({ page }) => {
  const slider = new SliderPage(page);
  await slider.clickNext();
  await slider.waitForAnimation();
  await slider.pressArrowUp();
  await slider.waitForAnimation();
  await slider.expectSlideTitle('Slide 1');
});

test('wheel down navigates forward', async ({
  page,
  browserName,
  isMobile,
}) => {
  test.skip(isMobile && browserName === 'webkit', 'Wheel not supported');
  const slider = new SliderPage(page);
  await slider.wheelDown();
  await slider.waitForAnimation();
  await slider.expectSlideTitle('Slide 2');
});

test('wheel up navigates back', async ({ page, browserName, isMobile }) => {
  test.skip(isMobile && browserName === 'webkit', 'Wheel not supported');
  const slider = new SliderPage(page);
  await slider.clickNext();
  await slider.waitForAnimation();
  await slider.wheelUp();
  await slider.waitForAnimation();
  await slider.expectSlideTitle('Slide 1');
});

test('swipe navigates on desktop', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Touch API not supported');
  const slider = new SliderPage(page);
  await slider.swipeUp();
  await slider.waitForAnimation();
  await slider.expectSlideTitle('Slide 2');
});

test('swipe navigates on mobile', async ({ page, isMobile, browserName }) => {
  test.skip(!isMobile, 'Mobile only');
  test.skip(browserName !== 'chromium', 'Touch API not supported');
  const slider = new SliderPage(page);
  await slider.swipeUp();
  await slider.waitForAnimation();
  await slider.expectSlideTitle('Slide 2');
  await slider.swipeDown();
  await slider.waitForAnimation();
  await slider.expectSlideTitle('Slide 1');
});

test('indicator click navigates', async ({ page }) => {
  const slider = new SliderPage(page);
  await slider.clickIndicatorByIndex(3);
  await slider.waitForAnimation();
  await slider.expectSlideTitle('Slide 4');
});

test('indicator tracks active slide', async ({ page }) => {
  const slider = new SliderPage(page);
  const dot = (i: number) =>
    page.locator(`[data-reel-indicator="${i}"][aria-selected="true"]`);
  await expect(dot(0)).toBeAttached();
  await slider.clickNext();
  await slider.waitForAnimation();
  await expect(dot(1)).toBeAttached();
  await slider.clickNext();
  await slider.waitForAnimation();
  await expect(dot(2)).toBeAttached();
});

test('nested slider has its own indicator', async ({ page }) => {
  const slider = new SliderPage(page);
  await slider.clickNext();
  await slider.waitForAnimation();
  await slider.clickNext();
  await slider.waitForAnimation();
  await slider.expectSlideTitle('Slide 3');

  const allIndicators = page.locator('[data-reel-indicator]');
  const allTabLists = page.locator('[role="tablist"]');
  await expect.poll(() => allTabLists.count()).toBeGreaterThanOrEqual(2);
  await expect.poll(() => allIndicators.count()).toBeGreaterThan(5);
});

test('goTo with animation', async ({ page }) => {
  const slider = new SliderPage(page);
  await page.locator('input[type="number"]').fill('50');
  await page.locator('button', { hasText: 'Go' }).click();
  await slider.waitForAnimation();
  await slider.expectSlideTitle('Slide 50');
  await expect(page.locator('text=50 / 10,000')).toBeVisible();
});

test('nested horizontal slider renders on 3rd slide', async ({ page }) => {
  const slider = new SliderPage(page);
  await slider.clickNext();
  await slider.waitForAnimation();
  await slider.clickNext();
  await slider.waitForAnimation();
  await slider.expectSlideTitle('Slide 3');
});

test('horizontal keyboard navigation in nested slider', async ({ page }) => {
  const slider = new SliderPage(page);
  await slider.clickNext();
  await slider.waitForAnimation();
  await slider.clickNext();
  await slider.waitForAnimation();
  await slider.expectSlideTitle('Slide 3');
  await slider.pressArrowRight();
  await slider.waitForAnimation();
  await expect(page.locator('h1', { hasText: 'Slide 3.2' })).toBeVisible();
});

test('auto-size mode toggle', async ({ page }) => {
  const sizeBtn = page.locator('button', { hasText: /size:/ });
  await expect(sizeBtn).toContainText('[');
  await sizeBtn.click();
  await expect(sizeBtn).toContainText('auto');
  const slider = new SliderPage(page);
  await slider.expectSlideTitle('Slide 1');
  await slider.clickNext();
  await slider.waitForAnimation();
  await slider.expectSlideTitle('Slide 2');
});

test('controlled indicator mode toggle', async ({ page }) => {
  const indicatorBtn = page.locator('button', { hasText: /indicator:/ });
  await expect(indicatorBtn).toContainText('auto');
  await indicatorBtn.click();
  await expect(indicatorBtn).toContainText('controlled');
  const slider = new SliderPage(page);
  await slider.clickIndicatorByIndex(1);
  await slider.waitForAnimation();
  await slider.expectSlideTitle('Slide 2');
});

test('navKeys toggle disables and re-enables keyboard', async ({ page }) => {
  const navKeysBtn = page.locator('button', { hasText: /navKeys:/ });
  const slider = new SliderPage(page);
  await navKeysBtn.click();
  await expect(navKeysBtn).toContainText('off');
  await slider.pressArrowDown();
  await slider.waitForAnimation();
  await slider.expectSlideTitle('Slide 1');
  await navKeysBtn.click();
  await expect(navKeysBtn).toContainText('on');
  await slider.pressArrowDown();
  await slider.waitForAnimation();
  await slider.expectSlideTitle('Slide 2');
});

test('wheel toggle disables and re-enables wheel', async ({
  page,
  browserName,
  isMobile,
}) => {
  test.skip(isMobile && browserName === 'webkit', 'Wheel not supported');
  const wheelBtn = page.locator('button', { hasText: /wheel:/ });
  const slider = new SliderPage(page);
  await wheelBtn.click();
  await expect(wheelBtn).toContainText('off');
  await slider.wheelDown();
  await slider.waitForAnimation();
  await slider.expectSlideTitle('Slide 1');
  await wheelBtn.click();
  await expect(wheelBtn).toContainText('on');
  await slider.wheelDown();
  await slider.waitForAnimation();
  await slider.expectSlideTitle('Slide 2');
});
