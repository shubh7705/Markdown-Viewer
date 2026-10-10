import { test } from '@playwright/test';

const ARTIFACT_DIR = 'C:/Users/shubh/.gemini/antigravity-ide/brain/baf52617-5f2b-4e9b-b9c9-1302b325087d';

test('capture desktop and mobile screenshots in light and dark modes', async ({ page }) => {
  // 1. Desktop Light Mode (1440x900)
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.locator('#empty-state-sample-btn').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${ARTIFACT_DIR}/desktop_light_mode.png`, fullPage: false });

  // 2. Desktop Dark Mode (1440x900)
  await page.locator('#theme-toggle-button').click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${ARTIFACT_DIR}/desktop_dark_mode.png`, fullPage: false });

  // 3. Mobile Dark Mode (390x844) with TOC drawer closed
  await page.setViewportSize({ width: 390, height: 844 });
  // Ensure TOC is closed for the pure document reading view
  const isTocOpen = await page.locator('#table-of-contents-nav').evaluate((el) => el.classList.contains('drawer-open'));
  if (isTocOpen) {
    await page.locator('#toc-toggle-button').click();
    await page.waitForTimeout(300);
  }
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_dark_mode.png`, fullPage: false });

  // 4. Mobile TOC Drawer Open
  await page.locator('#toc-toggle-button').click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_drawer_open.png`, fullPage: false });

  // 5. Mobile Light Mode (390x844) with drawer closed
  await page.locator('#toc-toggle-button').click(); // close drawer
  await page.locator('#theme-toggle-button').click(); // switch to light
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${ARTIFACT_DIR}/mobile_light_mode.png`, fullPage: false });
});
