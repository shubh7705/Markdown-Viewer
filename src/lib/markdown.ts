import MarkdownIt from 'markdown-it';
import taskLists from 'markdown-it-task-lists';
import footnote from 'markdown-it-footnote';
import hljs from 'highlight.js';
import { createSlugger } from './slugify';
import { sanitizeHtml } from './sanitize';
import { mathPlugin } from './mathPlugin';
import type { TocItem } from './types';

export interface RenderResult {
  html: string;
  toc: TocItem[];
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Creates and configures the Markdown-it engine with GFM support and custom renderers.
 */
export function renderMarkdown(markdownText: string): RenderResult {
  const toc: TocItem[] = [];
  const slugger = createSlugger();

  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: (code: string, lang: string): string => {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
        } catch {
          // Fallback to auto
        }
      }
      try {
        return hljs.highlightAuto(code).value;
      } catch {
        return escapeHtml(code);
      }
    },
  });

  // Enable GFM plugins (disabled checkboxes for reader view)
  md.use(taskLists, { enabled: false, label: true });
  md.use(footnote);
  md.use(mathPlugin);

  // Custom table wrapper for responsive scrolling
  const defaultTableOpen = md.renderer.rules.table_open || ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));
  const defaultTableClose = md.renderer.rules.table_close || ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

  md.renderer.rules.table_open = (tokens, idx, options, env, self) => {
    return `<div class="table-wrapper">${defaultTableOpen(tokens, idx, options, env, self)}`;
  };

  md.renderer.rules.table_close = (tokens, idx, options, env, self) => {
    return `${defaultTableClose(tokens, idx, options, env, self)}</div>`;
  };

  // Custom fenced code block renderer with language badge, copy button, and Mermaid diagrams
  md.renderer.rules.fence = (tokens, idx, _options) => {
    const token = tokens[idx];
    const rawCode = token.content;
    const info = token.info ? token.info.trim() : '';
    const lang = info ? info.split(/\s+/)[0] : '';
    const encodedCode = encodeURIComponent(rawCode);

    if (lang === 'mermaid') {
      let highlighted = '';
      try {
        highlighted = hljs.highlight(rawCode, { language: 'markdown', ignoreIllegals: true }).value;
      } catch {
        highlighted = escapeHtml(rawCode);
      }

      return `
<div class="mermaid-diagram-card" data-raw-mermaid="${encodedCode}">
  <div class="mermaid-toolbar">
    <span class="mermaid-badge">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
        <circle cx="9" cy="9" r="2"/>
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
      </svg>
      <span>Mermaid Diagram</span>
    </span>
    <div class="mermaid-actions">
      <button class="mermaid-fullscreen-btn" type="button" aria-label="Full screen diagram" title="Full screen diagram with zoom & pan">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
        </svg>
        <span>Full Screen</span>
      </button>
      <button class="mermaid-toggle-view-btn" type="button" aria-label="Toggle diagram and source code">
        <span>View Code</span>
      </button>
      <button class="code-copy-btn" data-code="${encodedCode}" type="button" aria-label="Copy Mermaid source">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
        </svg>
        <span>Copy</span>
      </button>
    </div>
  </div>
  <div class="mermaid-canvas" title="Double-click or click Full Screen to zoom and pan">
    <div class="mermaid-render-target">
      <div class="mermaid-loading-state">Rendering diagram...</div>
    </div>
  </div>
  <div class="mermaid-source-wrapper" style="display: none;">
    <pre><code class="hljs language-mermaid">${highlighted}</code></pre>
  </div>
</div>`.trim();
    }

    let highlighted = '';
    if (lang && hljs.getLanguage(lang)) {
      try {
        highlighted = hljs.highlight(rawCode, { language: lang, ignoreIllegals: true }).value;
      } catch {
        highlighted = escapeHtml(rawCode);
      }
    } else {
      try {
        highlighted = hljs.highlightAuto(rawCode).value;
      } catch {
        highlighted = escapeHtml(rawCode);
      }
    }

    const langLabel = lang || 'text';

    return `
<div class="code-block-wrapper">
  <div class="code-header">
    <span class="code-lang">${escapeHtml(langLabel)}</span>
    <button class="code-copy-btn" data-code="${encodedCode}" type="button" aria-label="Copy code snippet">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
      </svg>
      <span>Copy</span>
    </button>
  </div>
  <pre><code class="hljs ${escapeHtml(lang ? `language-${lang}` : '')}">${highlighted}</code></pre>
</div>`.trim();
  };

  // Custom image renderer with graceful relative image fallback
  md.renderer.rules.image = (tokens, idx, _options) => {
    const token = tokens[idx];
    const src = String(token.attrGet('src') ?? '');
    const alt = String(token.content || token.attrGet('alt') || 'Image');
    const title = token.attrGet('title') != null ? String(token.attrGet('title')) : null;

    // External image: http(s) or base64 data uri
    const isExternal = /^https?:\/\//i.test(src) || /^data:image\//i.test(src);

    if (isExternal) {
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
      return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${titleAttr} loading="lazy" />`;
    }

    // Relative local image placeholder fallback
    return `
<span class="relative-image-fallback" role="img" aria-label="Local image: ${escapeHtml(alt)}">
  <svg class="relative-image-fallback-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
    <circle cx="9" cy="9" r="2"/>
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
  </svg>
  <span>${escapeHtml(alt)}</span>
  <span class="relative-image-path">(${escapeHtml(src)})</span>
</span>`.trim();
  };

  // Heading slugger and Table of Contents collection
  const defaultHeadingOpen = md.renderer.rules.heading_open || ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

  md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const level = parseInt(token.tag.slice(1), 10);
    const nextToken = tokens[idx + 1];
    const headingText = nextToken && nextToken.children
      ? nextToken.children.reduce((acc, t) => acc + (t.content || ''), '')
      : (nextToken ? nextToken.content : '');

    const id = slugger(headingText || `section-${idx}`);
    token.attrSet('id', id);

    if (level >= 1 && level <= 4) {
      toc.push({
        id,
        text: headingText.trim(),
        level,
      });
    }

    return defaultHeadingOpen(tokens, idx, options, env, self);
  };

  // External link target handling
  const defaultLinkOpen = md.renderer.rules.link_open || ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const href = String(token.attrGet('href') ?? '');
    if (/^https?:\/\//i.test(href)) {
      token.attrSet('target', '_blank');
      token.attrSet('rel', 'noopener noreferrer');
    }
    return defaultLinkOpen(tokens, idx, options, env, self);
  };

  const rawHtml = md.render(markdownText);
  const sanitizedHtml = sanitizeHtml(rawHtml);

  return {
    html: sanitizedHtml,
    toc,
  };
}
