import { describe, it, expect } from 'vitest';
import { renderMarkdown } from '../lib/markdown';

describe('Markdown Pipeline', () => {
  it('renders standard headings and collects TOC entries with unique IDs', () => {
    const md = `
# Title
## Section One
### Subsection A
## Section Two
## Section One
    `;
    const { html, toc } = renderMarkdown(md);

    expect(html).toContain('id="title"');
    expect(html).toContain('id="section-one"');
    expect(html).toContain('id="section-two"');
    // Duplicate heading receives unique suffix
    expect(html).toContain('id="section-one-1"');

    expect(toc).toHaveLength(5);
    expect(toc[0]).toEqual({ id: 'title', text: 'Title', level: 1 });
    expect(toc[1]).toEqual({ id: 'section-one', text: 'Section One', level: 2 });
    expect(toc[4]).toEqual({ id: 'section-one-1', text: 'Section One', level: 2 });
  });

  it('renders GFM tables wrapped in scrollable table-wrapper', () => {
    const md = `
| Name | Role |
| :--- | ---: |
| Alice | Admin |
| Bob | User |
    `;
    const { html } = renderMarkdown(md);

    expect(html).toContain('<div class="table-wrapper">');
    expect(html).toContain('Name</th>');
    expect(html).toContain('Alice</td>');
  });

  it('renders GFM task lists with disabled checkboxes', () => {
    const md = `
- [x] Complete task
- [ ] Pending task
    `;
    const { html } = renderMarkdown(md);

    expect(html).toContain('task-list-item');
    expect(html).toContain('type="checkbox"');
    expect(html).toContain('checked');
  });

  it('renders GFM footnotes', () => {
    const md = `
Here is a footnote[^1].

[^1]: Footnote content details.
    `;
    const { html } = renderMarkdown(md);

    expect(html).toContain('class="footnote-ref"');
    expect(html).toContain('class="footnotes"');
    expect(html).toContain('Footnote content details');
  });

  it('renders fenced code blocks with language badge and copy button', () => {
    const md = '```typescript\nconst x: number = 42;\n```';
    const { html } = renderMarkdown(md);

    expect(html).toContain('class="code-block-wrapper"');
    expect(html).toContain('class="code-lang">typescript</span>');
    expect(html).toContain('class="code-copy-btn"');
    expect(html).toContain('hljs');
  });

  it('renders graceful placeholder for relative local images', () => {
    const md = '![Diagram](./local/diagram.png)';
    const { html } = renderMarkdown(md);

    expect(html).toContain('class="relative-image-fallback"');
    expect(html).toContain('Diagram');
    expect(html).toContain('./local/diagram.png');
    expect(html).not.toContain('<img src="./local/diagram.png"');
  });

  it('renders regular img tag for external https images', () => {
    const md = '![Photo](https://example.com/photo.jpg)';
    const { html } = renderMarkdown(md);

    expect(html).toContain('<img src="https://example.com/photo.jpg" alt="Photo"');
  });

  it('applies target="_blank" and rel="noopener noreferrer" to external links', () => {
    const md = '[External](https://google.com)';
    const { html } = renderMarkdown(md);

    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('efficiently parses and renders a long document (1,500+ lines)', () => {
    const lines: string[] = ['# Long Document Benchmark\n'];
    for (let i = 1; i <= 300; i++) {
      lines.push(`## Section ${i}\n`);
      lines.push(`Paragraph ${i} exploring typography principles and readability.\n`);
      lines.push(`- Item 1\n- Item 2\n- Item 3\n`);
    }
    const longMd = lines.join('\n');
    expect(longMd.split('\n').length).toBeGreaterThan(1500);

    const start = performance.now();
    const result = renderMarkdown(longMd);
    const duration = performance.now() - start;

    expect(result.toc).toHaveLength(301);
    expect(result.html).toContain('id="section-300"');
    // Long document parses well within 250ms
    expect(duration).toBeLessThan(250);
  });

  it('renders inline LaTeX math formulas with KaTeX', () => {
    const md = 'Model Dimension ($d_{\\text{model}}$) or $d_k = d_{\\text{model}} / H = 256 / 8$';
    const { html } = renderMarkdown(md);

    expect(html).toContain('class="katex"');
    expect(html).toContain('d_{\\text{model}}');
    expect(html).not.toContain('$d_{\\text{model}}$');
  });

  it('renders display block LaTeX math formulas with KaTeX', () => {
    const md = `
$$\\mathcal{L}(\\theta) = -\\frac{1}{B \\times T} \\sum_{b=1}^{B} \\log P(x)$$
    `;
    const { html } = renderMarkdown(md);

    expect(html).toContain('class="math-block-wrapper"');
    expect(html).toContain('class="katex-display"');
  });

  it('renders Mermaid diagram cards with diagram canvas, fullscreen button, and source toggle', () => {
    const md = `
\`\`\`mermaid
graph TD
    A --> B
\`\`\`
    `;
    const { html } = renderMarkdown(md);

    expect(html).toContain('class="mermaid-diagram-card"');
    expect(html).toContain('class="mermaid-render-target"');
    expect(html).toContain('class="mermaid-fullscreen-btn"');
    expect(html).toContain('Full Screen');
    expect(html).toContain('class="mermaid-toggle-view-btn"');
    expect(html).toContain('data-raw-mermaid');
  });

  it('successfully parses ARCHITECTURE.md containing math formulas and mermaid diagrams', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve('ARCHITECTURE.md');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const { html, toc } = renderMarkdown(content);

      // Verify KaTeX math rendered
      expect(html).toContain('class="katex"');
      // Verify Mermaid diagram cards rendered
      expect(html).toContain('class="mermaid-diagram-card"');
      // Verify table of contents extracted
      expect(toc.length).toBeGreaterThan(10);
    }
  });
});
