import DOMPurify from 'dompurify';

// Hook to ensure all links with target="_blank" strictly include rel="noopener noreferrer"
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    const href = node.getAttribute('href');
    if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
  }
});

const PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'blockquote', 'hr', 'br',
    'ul', 'ol', 'li',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'pre', 'code',
    'a', 'img', 'span', 'div',
    'strong', 'em', 'del', 'sub', 'sup',
    'input', 'button', 'section',
    // MathML tags (KaTeX)
    'math', 'semantics', 'annotation', 'mrow', 'mi', 'mo', 'mn',
    'msup', 'msub', 'msubsup', 'mfrac', 'mroot', 'msqrt',
    'mtable', 'mtr', 'mtd', 'mtext', 'mspace', 'mover', 'munder', 'munderover',
    // SVG tags (Mermaid & KaTeX roots)
    'svg', 'g', 'path', 'line', 'polygon', 'polyline', 'rect',
    'circle', 'ellipse', 'text', 'tspan', 'foreignObject', 'marker',
    'defs', 'style', 'clippath', 'use',
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'class', 'id',
    'target', 'rel', 'type', 'disabled', 'checked',
    'role', 'aria-label', 'aria-live', 'aria-hidden', 'tabindex',
    'data-code', 'data-lang', 'data-raw-mermaid',
    // MathML & SVG attributes
    'viewBox', 'width', 'height', 'xmlns', 'fill', 'stroke',
    'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'd',
    'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry',
    'points', 'transform', 'marker-end', 'marker-start',
    'text-anchor', 'font-size', 'font-family', 'dominant-baseline',
    'display', 'mathvariant', 'encoding', 'style',
  ],
  ALLOW_DATA_ATTR: true,
  SANITIZE_DOM: false,
  // Disallow javascript: and data: in hyperlinks to strictly prevent XSS
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
};

export function sanitizeHtml(dirtyHtml: string): string {
  if (!dirtyHtml) return '';
  return DOMPurify.sanitize(dirtyHtml, PURIFY_CONFIG);
}
