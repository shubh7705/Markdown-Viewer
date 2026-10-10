import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from '../lib/sanitize';
import { renderMarkdown } from '../lib/markdown';

describe('Sanitization & Security Pipeline', () => {
  it('strips script tags completely', () => {
    const malicious = '<p>Safe</p><script>alert("xss")</script>';
    const cleaned = sanitizeHtml(malicious);
    expect(cleaned).not.toContain('<script>');
    expect(cleaned).not.toContain('alert("xss")');
    expect(cleaned).toContain('<p>Safe</p>');
  });

  it('removes onerror handlers from images', () => {
    const malicious = '<img src="invalid" onerror="alert(\'xss\')" alt="Test" />';
    const cleaned = sanitizeHtml(malicious);
    expect(cleaned).not.toContain('onerror');
  });

  it('blocks javascript: URI links in HTML', () => {
    const malicious = '<a href="javascript:alert(1)">Exploit</a>';
    const cleaned = sanitizeHtml(malicious);
    expect(cleaned).not.toContain('href="javascript:');
  });

  it('neutralizes malicious markdown injection end-to-end', () => {
    const maliciousMd = `
# Safe Title
<a href="javascript:alert('pwned')">Malicious Link</a>
<img src="x" onerror="alert('hacked')" />
<script>window.location='https://attacker.com';</script>
    `;
    const { html } = renderMarkdown(maliciousMd);

    expect(html).not.toContain('<script>');
    expect(html).not.toContain('onerror');
    expect(html).not.toContain('href="javascript:');
    expect(html).toContain('Safe Title');
  });
});
