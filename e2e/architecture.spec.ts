import { test, expect } from '@playwright/test';
import fs from 'fs';

const ARTIFACT_DIR = 'C:/Users/shubh/.gemini/antigravity-ide/brain/baf52617-5f2b-4e9b-b9c9-1302b325087d';

test('verify math equations and mermaid diagram rendering with ARCHITECTURE.md', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');

  // Read content of ARCHITECTURE.md
  const archContent = fs.readFileSync('ARCHITECTURE.md', 'utf-8');

  // Open paste modal and submit ARCHITECTURE.md
  await page.locator('#empty-state-paste-btn').click();
  await page.locator('#paste-markdown-input').fill(archContent);
  await page.locator('#paste-markdown-submit-btn').click();

  // 1. Verify KaTeX math elements exist and render
  const katexElements = page.locator('.katex');
  await expect(katexElements.first()).toBeVisible({ timeout: 10000 });
  const count = await katexElements.count();
  expect(count).toBeGreaterThan(10);

  // 2. Scroll to section with Model Dimension and d_k formulas
  const mathTable = page.locator('table:has-text("Model Dimension")');
  await mathTable.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // Capture screenshot of math equations in the table
  await page.screenshot({
    path: `${ARTIFACT_DIR}/architecture_math_rendering.png`,
    fullPage: false,
  });

  // 3. Verify Mermaid diagram rendering
  const mermaidCards = page.locator('.mermaid-diagram-card');
  await expect(mermaidCards.first()).toBeVisible();

  // Scroll to the Mermaid system architecture diagram in section 1.2
  const mermaidCard = mermaidCards.first();
  await mermaidCard.scrollIntoViewIfNeeded();

  // Verify that an SVG was successfully generated inside the render target
  const svg = mermaidCard.locator('.mermaid-render-target svg');
  await expect(svg).toBeVisible({ timeout: 15000 });

  // Capture screenshot of the rendered Mermaid diagram
  await page.screenshot({
    path: `${ARTIFACT_DIR}/architecture_mermaid_diagram.png`,
    fullPage: false,
  });

  // 4. Test "View Code" toggle button on the diagram
  const toggleBtn = mermaidCard.locator('.mermaid-toggle-view-btn');
  await toggleBtn.click();
  await expect(mermaidCard.locator('.mermaid-source-wrapper')).toBeVisible();
  await expect(mermaidCard.locator('.mermaid-canvas')).not.toBeVisible();

  // Toggle back to diagram
  await toggleBtn.click();
  await expect(mermaidCard.locator('.mermaid-canvas')).toBeVisible();
  await expect(svg).toBeVisible();
});
