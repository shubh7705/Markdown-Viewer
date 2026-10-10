import { test, expect } from '@playwright/test';

test.describe('Markdown Viewer E2E Smoke Tests', () => {
  test('loads empty state and renders sample document with all features', async ({ page }) => {
    await page.goto('/');

    // 1. Verify empty state presence
    const emptyState = page.locator('#empty-state-view');
    await expect(emptyState).toBeVisible();
    await expect(page.locator('.drop-zone-text')).toHaveText('Drop a Markdown file here to begin reading');
    await expect(page.locator('.drop-zone-subtext')).toHaveText('Client-side only. Files never leave your browser.');

    // 2. Load sample document
    await page.locator('#empty-state-sample-btn').click();

    // 3. Verify document title and metadata pill
    const docTitle = page.locator('#document-title');
    await expect(docTitle).toBeVisible();
    await expect(docTitle).toHaveText('sample.md');
    await expect(page.locator('#document-stats')).toContainText('words');

    // 4. Verify Table of Contents is generated and visible
    const tocNav = page.locator('#table-of-contents-nav');
    await expect(tocNav).toBeVisible();
    await expect(tocNav.locator('a[href="#the-architecture-of-modern-typography"]')).toBeVisible();

    // 5. Verify headings in article
    const article = page.locator('#markdown-article');
    await expect(article.locator('h1')).toHaveText('The Architecture of Modern Typography');

    // 6. Verify GFM task lists
    const checkbox = article.locator('.task-list-item-checkbox').first();
    await expect(checkbox).toBeVisible();
    await expect(checkbox).toBeDisabled();

    // 7. Verify GFM tables
    const tableWrapper = article.locator('.table-wrapper').first();
    await expect(tableWrapper).toBeVisible();

    // 8. Verify syntax-highlighted code block with copy button
    const copyBtn = article.locator('.code-copy-btn').first();
    await expect(copyBtn).toBeVisible();

    // 9. Verify relative image fallback
    const fallbackImage = article.locator('.relative-image-fallback').first();
    await expect(fallbackImage).toBeVisible();
    await expect(fallbackImage).toContainText('System Architecture Diagram');
  });

  test('theme toggle works and persists', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    const initialTheme = await html.getAttribute('data-theme');

    // Click theme toggle button
    const themeBtn = page.locator('#theme-toggle-button');
    await themeBtn.click();

    const newTheme = await html.getAttribute('data-theme');
    expect(newTheme).not.toBe(initialTheme);

    // Refresh page to verify persistence without flash
    await page.reload();
    const persistedTheme = await html.getAttribute('data-theme');
    expect(persistedTheme).toBe(newTheme);
  });

  test('reading settings adjust text size and column width', async ({ page }) => {
    await page.goto('/');
    await page.locator('#empty-state-sample-btn').click();

    const html = page.locator('html');

    // Cycle font size
    const fontSizeBtn = page.locator('#font-size-button');
    await fontSizeBtn.click();
    await expect(html).toHaveAttribute('data-font-size', 'large');

    // Toggle reading width
    const widthBtn = page.locator('#reading-width-button');
    await widthBtn.click();
    await expect(html).toHaveAttribute('data-reading-width', 'wide');
  });

  test('keyboard shortcuts function properly', async ({ page }) => {
    await page.goto('/');
    await page.locator('body').click();

    // Press '?' to open shortcuts modal
    await page.keyboard.press('?');
    await expect(page.locator('#shortcuts-modal-title')).toBeVisible();

    // Press 'Escape' to close
    await page.keyboard.press('Escape');
    await expect(page.locator('#shortcuts-modal-title')).not.toBeVisible();

    // Press 'T' to toggle theme
    const html = page.locator('html');
    const themeBefore = await html.getAttribute('data-theme');
    await page.keyboard.press('t');
    const themeAfter = await html.getAttribute('data-theme');
    expect(themeAfter).not.toBe(themeBefore);
  });
});
