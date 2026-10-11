import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import type { Theme } from '../lib/types';
import { MermaidFullscreenModal } from './MermaidFullscreenModal';

interface DocumentRendererProps {
  html: string;
  theme: Theme;
}

export const DocumentRenderer: React.FC<DocumentRendererProps> = ({ html, theme }) => {
  const containerRef = useRef<HTMLElement>(null);
  const [fullscreenData, setFullscreenData] = useState<{
    svgHtml: string;
    rawCode: string;
  } | null>(null);

  // Initialize and render Mermaid diagrams
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cards = container.querySelectorAll<HTMLElement>('.mermaid-diagram-card');
    if (cards.length === 0) return;

    let isMounted = true;

    mermaid.initialize({
      startOnLoad: false,
      theme: theme === 'dark' ? 'dark' : 'neutral',
      fontFamily: 'var(--font-sans), Inter, sans-serif',
      securityLevel: 'loose',
    });

    cards.forEach(async (card, index) => {
      const encoded = card.getAttribute('data-raw-mermaid');
      if (!encoded) return;

      const target = card.querySelector<HTMLElement>('.mermaid-render-target');
      if (!target) return;

      try {
        const rawCode = decodeURIComponent(encoded);
        const uniqueId = `mermaid-svg-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`;
        const { svg } = await mermaid.render(uniqueId, rawCode);

        if (isMounted) {
          target.innerHTML = svg;
          // Clean up any error div mermaid might insert in body
          const strayEl = document.getElementById(uniqueId);
          if (strayEl && strayEl.parentElement === document.body) {
            strayEl.remove();
          }
        }
      } catch {
        if (isMounted) {
          target.innerHTML = `
            <div class="mermaid-error-notice">
              <span>Could not render diagram. Click "View Code" to view source syntax.</span>
            </div>
          `.trim();
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [html, theme]);

  // Delegated click and double-click handler for copy, toggle view, and full screen
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleContainerClick = async (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      // Fullscreen button click
      const fullscreenBtn = target.closest<HTMLButtonElement>('.mermaid-fullscreen-btn');
      if (fullscreenBtn) {
        const card = fullscreenBtn.closest<HTMLElement>('.mermaid-diagram-card');
        if (card) {
          const svgEl = card.querySelector<SVGElement>('.mermaid-render-target svg');
          if (svgEl) {
            const rawCode = decodeURIComponent(card.getAttribute('data-raw-mermaid') || '');
            setFullscreenData({
              svgHtml: svgEl.outerHTML,
              rawCode,
            });
          }
        }
        return;
      }

      // Toggle Mermaid source code / diagram view
      const toggleViewBtn = target.closest<HTMLButtonElement>('.mermaid-toggle-view-btn');
      if (toggleViewBtn) {
        const card = toggleViewBtn.closest<HTMLElement>('.mermaid-diagram-card');
        if (card) {
          const canvas = card.querySelector<HTMLElement>('.mermaid-canvas');
          const sourceWrapper = card.querySelector<HTMLElement>('.mermaid-source-wrapper');
          const span = toggleViewBtn.querySelector('span') || toggleViewBtn;

          if (canvas && sourceWrapper) {
            const isViewingCode = sourceWrapper.style.display !== 'none';
            if (isViewingCode) {
              sourceWrapper.style.display = 'none';
              canvas.style.display = 'flex';
              span.textContent = 'View Code';
            } else {
              sourceWrapper.style.display = 'block';
              canvas.style.display = 'none';
              span.textContent = 'View Diagram';
            }
          }
        }
        return;
      }

      // Copy code snippet buttons
      const copyButton = target.closest<HTMLButtonElement>('.code-copy-btn');
      if (!copyButton) return;

      const encodedCode = copyButton.getAttribute('data-code');
      if (!encodedCode) return;

      try {
        const rawCode = decodeURIComponent(encodedCode);
        await navigator.clipboard.writeText(rawCode);

        const span = copyButton.querySelector('span');
        const originalText = span ? span.textContent : 'Copy';
        copyButton.classList.add('copied');
        if (span) span.textContent = 'Copied!';

        setTimeout(() => {
          copyButton.classList.remove('copied');
          if (span) span.textContent = originalText;
        }, 2000);
      } catch {
        // Clipboard write denied or not supported
      }
    };

    // Double-click canvas to enter full screen
    const handleContainerDblClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const canvas = target.closest<HTMLElement>('.mermaid-canvas');
      if (canvas) {
        const card = canvas.closest<HTMLElement>('.mermaid-diagram-card');
        if (card) {
          const svgEl = card.querySelector<SVGElement>('.mermaid-render-target svg');
          if (svgEl) {
            const rawCode = decodeURIComponent(card.getAttribute('data-raw-mermaid') || '');
            setFullscreenData({
              svgHtml: svgEl.outerHTML,
              rawCode,
            });
          }
        }
      }
    };

    container.addEventListener('click', handleContainerClick);
    container.addEventListener('dblclick', handleContainerDblClick);
    return () => {
      container.removeEventListener('click', handleContainerClick);
      container.removeEventListener('dblclick', handleContainerDblClick);
    };
  }, [html]);

  return (
    <>
      <main className="reading-main" id="reading-main-content">
        <article
          ref={containerRef}
          className="markdown-body document-article"
          id="markdown-article"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>

      {fullscreenData && (
        <MermaidFullscreenModal
          key={fullscreenData.svgHtml.slice(0, 40)}
          isOpen={!!fullscreenData}
          svgHtml={fullscreenData.svgHtml}
          rawCode={fullscreenData.rawCode}
          onClose={() => setFullscreenData(null)}
        />
      )}
    </>
  );
};

