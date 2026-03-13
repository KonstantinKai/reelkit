import { test, expect } from '@playwright/test';
import { SliderPage } from '../../../e2e-utils/slider-page';

test.describe('Reel React - Rendering', () => {
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

test.describe('Reel React - Button Navigation', () => {
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

test.describe('Reel React - Keyboard Navigation', () => {
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

test.describe('Reel React - Wheel Navigation', () => {
  // Mouse wheel not supported in mobile WebKit
  test.skip(
    ({ browserName, isMobile }) => isMobile && browserName === 'webkit',
    'Wheel not supported in mobile WebKit',
  );

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('wheel down navigates to next slide', async ({ page }) => {
    const slider = new SliderPage(page);

    await slider.expectSlideTitle('Slide 1');
    await slider.wheelDown();
    await slider.waitForAnimation();

    await slider.expectSlideTitle('Slide 2');
  });

  test('wheel up navigates to previous slide', async ({ page }) => {
    const slider = new SliderPage(page);

    await slider.wheelDown();
    await slider.waitForAnimation();
    await slider.waitForWheelDebounce();

    await slider.wheelUp();
    await slider.waitForAnimation();

    await slider.expectSlideTitle('Slide 1');
  });

  test('wheel navigation respects debounce', async ({ page }) => {
    const slider = new SliderPage(page);

    await slider.expectSlideTitle('Slide 1');

    // Multiple rapid wheel events should only trigger one navigation
    await slider.wheelDown();
    await page.waitForTimeout(50);
    await slider.wheelDown();
    await page.waitForTimeout(50);
    await slider.wheelDown();
    await slider.waitForAnimation();

    // Should only advance by one slide due to debounce
    await slider.expectSlideTitle('Slide 2');
  });

  test('cannot wheel before first slide', async ({ page }) => {
    const slider = new SliderPage(page);

    await slider.expectSlideTitle('Slide 1');
    await slider.wheelUp();
    await slider.waitForAnimation();

    await slider.expectSlideTitle('Slide 1');
  });
});

test.describe('Reel React - Touch Gestures', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'Touch API not supported',
  );

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

test.describe('Reel React - Animation', () => {
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

test.describe('Reel React - Indicator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
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

  test('indicator slides when navigating beyond visible window', async ({
    page,
  }) => {
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

test.describe('Reel React - Rapid Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('rapid next button clicks advance only one slide', async ({ page }) => {
    const slider = new SliderPage(page);

    await slider.expectSlideTitle('Slide 1');

    // Fire 5 synchronous clicks in the browser to ensure they all land
    // within the same animation window (300ms transition)
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Next'),
      );
      if (btn) for (let i = 0; i < 5; i++) btn.click();
    });

    await slider.waitForAnimation();

    // Only the first click should go through due to animation guard
    await slider.expectSlideTitle('Slide 2');
    await expect(page.locator('text=2 / 10,000')).toBeVisible();
  });

  test('rapid prev button clicks go back only one slide', async ({ page }) => {
    const slider = new SliderPage(page);

    // Navigate to slide 3 first
    await slider.clickNext();
    await slider.waitForAnimation();
    await slider.clickNext();
    await slider.waitForAnimation();
    await slider.expectSlideTitle('Slide 3');

    // Fire 5 synchronous prev clicks
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Previous'),
      );
      if (btn) for (let i = 0; i < 5; i++) btn.click();
    });

    await slider.waitForAnimation();

    // Only the first click should go through
    await slider.expectSlideTitle('Slide 2');
    await expect(page.locator('text=2 / 10,000')).toBeVisible();
  });

  test('rapid alternating next/prev clicks do not cause twitching', async ({
    page,
  }) => {
    const slider = new SliderPage(page);

    await slider.expectSlideTitle('Slide 1');

    // Fire alternating next/prev clicks synchronously
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      const nextBtn = Array.from(buttons).find((b) =>
        b.textContent?.includes('Next'),
      );
      const prevBtn = Array.from(buttons).find((b) =>
        b.textContent?.includes('Previous'),
      );
      if (nextBtn && prevBtn) {
        nextBtn.click();
        prevBtn.click();
        nextBtn.click();
        prevBtn.click();
      }
    });

    await slider.waitForAnimation();

    // First click (next) wins, rest ignored during animation
    await slider.expectSlideTitle('Slide 2');
    await expect(page.locator('text=2 / 10,000')).toBeVisible();
  });

  test('navigation works normally after rapid clicks settle', async ({
    page,
  }) => {
    const slider = new SliderPage(page);

    await slider.expectSlideTitle('Slide 1');

    // Rapid synchronous clicks
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Next'),
      );
      if (btn) for (let i = 0; i < 5; i++) btn.click();
    });

    await slider.waitForAnimation();
    await slider.expectSlideTitle('Slide 2');

    // Normal navigation should work fine after rapid burst
    await slider.clickNext();
    await slider.waitForAnimation();
    await slider.expectSlideTitle('Slide 3');

    await slider.clickPrev();
    await slider.waitForAnimation();
    await slider.expectSlideTitle('Slide 2');
  });
});

test.describe('Reel React - Infinite List', () => {
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

  test('goTo current index stays at same slide', async ({ page }) => {
    const slider = new SliderPage(page);

    await slider.expectSlideTitle('Slide 1');

    await page.locator('input[type="number"]').fill('1');
    await page.locator('button', { hasText: 'Go' }).click();
    await slider.waitForAnimation();

    await slider.expectSlideTitle('Slide 1');
    await expect(page.locator('text=1 / 10,000')).toBeVisible();
  });

  test('goTo beyond max is handled gracefully', async ({ page }) => {
    const slider = new SliderPage(page);

    await slider.expectSlideTitle('Slide 1');

    await page.locator('input[type="number"]').fill('99999');
    await page.locator('button', { hasText: 'Go' }).click();
    await slider.waitForAnimation();

    // Guard: index >= 0 && index < 10000 — input is ignored
    await slider.expectSlideTitle('Slide 1');
    await expect(page.locator('text=1 / 10,000')).toBeVisible();
  });
});

test.describe('Reel React - GoTo with Resize', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('animated goTo completes after viewport resize mid-animation', async ({
    page,
  }) => {
    const slider = new SliderPage(page);
    const originalViewport = page.viewportSize();
    if (!originalViewport) throw new Error('No viewport');

    await slider.expectSlideTitle('Slide 1');

    // Start animated goTo
    await page.locator('input[type="number"]').fill('8555');
    await page.locator('button', { hasText: 'Go' }).click();

    // Resize viewport immediately during animation (simulates keyboard dismiss)
    await page.setViewportSize({
      width: originalViewport.width,
      height: originalViewport.height - 200,
    });

    await slider.waitForAnimation();

    // Should arrive at the target slide
    await slider.expectSlideTitle('Slide 8555');
    await expect(page.locator('text=8,555 / 10,000')).toBeVisible();

    // Restore viewport
    await page.setViewportSize(originalViewport);
  });

  test('navigation works after goTo + resize', async ({ page }) => {
    const slider = new SliderPage(page);
    const originalViewport = page.viewportSize();
    if (!originalViewport) throw new Error('No viewport');

    // Animated goTo with resize
    await page.locator('input[type="number"]').fill('500');
    await page.locator('button', { hasText: 'Go' }).click();

    await page.setViewportSize({
      width: originalViewport.width,
      height: originalViewport.height - 150,
    });

    await slider.waitForAnimation();
    await slider.expectSlideTitle('Slide 500');

    // Restore viewport
    await page.setViewportSize(originalViewport);
    await slider.waitForAnimation();

    // Navigation should still work — slider must not be frozen
    await slider.clickNext();
    await slider.waitForAnimation();
    await slider.expectSlideTitle('Slide 501');

    await slider.clickPrev();
    await slider.waitForAnimation();
    await slider.expectSlideTitle('Slide 500');
  });

  test('multiple goTo + resize cycles do not freeze slider', async ({
    page,
  }) => {
    const slider = new SliderPage(page);
    const originalViewport = page.viewportSize();
    if (!originalViewport) throw new Error('No viewport');

    // Cycle 1: goTo + resize
    await page.locator('input[type="number"]').fill('100');
    await page.locator('button', { hasText: 'Go' }).click();
    await page.setViewportSize({
      width: originalViewport.width,
      height: originalViewport.height - 100,
    });
    await slider.waitForAnimation();
    await slider.expectSlideTitle('Slide 100');

    // Restore viewport
    await page.setViewportSize(originalViewport);
    await slider.waitForAnimation();

    // Cycle 2: goTo + resize
    await page.locator('input[type="number"]').fill('5000');
    await page.locator('button', { hasText: 'Go' }).click();
    await page.setViewportSize({
      width: originalViewport.width,
      height: originalViewport.height - 200,
    });
    await slider.waitForAnimation();
    await slider.expectSlideTitle('Slide 5000');

    // Restore and verify navigation
    await page.setViewportSize(originalViewport);
    await slider.waitForAnimation();

    await slider.clickNext();
    await slider.waitForAnimation();
    await slider.expectSlideTitle('Slide 5001');
  });
});
