import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';

interface MermaidFullscreenModalProps {
  isOpen: boolean;
  svgHtml: string;
  rawCode: string;
  onClose: () => void;
}

const MIN_SCALE = 0.2;
const MAX_SCALE = 8.0;

export const MermaidFullscreenModal: React.FC<MermaidFullscreenModalProps> = ({
  isOpen,
  svgHtml,
  rawCode,
  onClose,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; origX: number; origY: number }>({
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
  });

  // Calculate natural base fit dimensions from the SVG's viewBox
  const baseDimensions = useMemo(() => {
    const viewBoxMatch = svgHtml.match(/viewBox=["']([0-9.\s-]+)["']/);
    let vbWidth = 960;
    let vbHeight = 600;
    if (viewBoxMatch) {
      const parts = viewBoxMatch[1].trim().split(/\s+/).map(Number);
      if (parts.length >= 4 && parts[2] > 0 && parts[3] > 0) {
        vbWidth = parts[2];
        vbHeight = parts[3];
      }
    }
    const maxW = typeof window !== 'undefined' ? window.innerWidth * 0.88 : 1000;
    const maxH = typeof window !== 'undefined' ? (window.innerHeight - 80) * 0.84 : 700;
    const scaleToFit = Math.min(maxW / vbWidth, maxH / vbHeight, 1.2);
    const width = Math.max(Math.round(vbWidth * scaleToFit), 280);
    const height = Math.max(Math.round(vbHeight * scaleToFit), 200);
    return { width, height };
  }, [svgHtml]);

  // Touch pinch zoom tracking
  const touchStateRef = useRef<{
    initialDist: number;
    initialScale: number;
  }>({ initialDist: 0, initialScale: 1 });

  // Zoom helpers
  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(Number((prev * 1.25).toFixed(2)), MAX_SCALE));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(Number((prev / 1.25).toFixed(2)), MIN_SCALE));
  }, []);

  const resetView = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Lock body scroll while modal is mounted
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Monitor native fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsNativeFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Keyboard controls inside the modal (capture phase to ensure immediate handling)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        e.stopPropagation();
        zoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        e.stopPropagation();
        zoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        e.stopPropagation();
        resetView();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setPosition((prev) => ({ ...prev, x: prev.x + 50 }));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setPosition((prev) => ({ ...prev, x: prev.x - 50 }));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setPosition((prev) => ({ ...prev, y: prev.y + 50 }));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setPosition((prev) => ({ ...prev, y: prev.y - 50 }));
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onClose, zoomIn, zoomOut, resetView]);

  // Mouse wheel zoom centered on cursor
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!viewportRef.current) return;

    const rect = viewportRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 1 / 1.15;

    setScale((prevScale) => {
      const newScale = Math.min(Math.max(Number((prevScale * zoomFactor).toFixed(3)), MIN_SCALE), MAX_SCALE);
      const ratio = newScale / prevScale;

      setPosition((prevPos) => ({
        x: Number((mouseX - (mouseX - prevPos.x) * ratio).toFixed(1)),
        y: Number((mouseY - (mouseY - prevPos.y) * ratio).toFixed(1)),
      }));

      return newScale;
    });
  }, []);

  // Pointer drag panning
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only primary mouse button
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: position.x,
      origY: position.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [position.x, position.y]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    setPosition({
      x: Math.round(dragStartRef.current.origX + dx),
      y: Math.round(dragStartRef.current.origY + dy),
    });
  }, [isDragging]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Pointer capture already released
      }
    }
  }, [isDragging]);

  // Touch pinch to zoom & pan
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStateRef.current = {
        initialDist: dist,
        initialScale: scale,
      };
    }
  }, [scale]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && touchStateRef.current.initialDist > 0) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / touchStateRef.current.initialDist;
      const newScale = Math.min(
        Math.max(Number((touchStateRef.current.initialScale * ratio).toFixed(2)), MIN_SCALE),
        MAX_SCALE
      );
      setScale(newScale);
    }
  }, []);

  // Double click toggles between 100% and 175%
  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (scale !== 1 || position.x !== 0 || position.y !== 0) {
      resetView();
    } else {
      if (!viewportRef.current) return;
      const rect = viewportRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - rect.width / 2;
      const mouseY = e.clientY - rect.top - rect.height / 2;
      const newScale = 1.75;
      const ratio = newScale / 1;
      setPosition({
        x: Number((mouseX - mouseX * ratio).toFixed(1)),
        y: Number((mouseY - mouseY * ratio).toFixed(1)),
      });
      setScale(newScale);
    }
  }, [scale, position.x, position.y, resetView]);

  // Toggle OS Fullscreen
  const handleToggleNativeFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        if (modalRef.current?.requestFullscreen) {
          await modalRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch {
      // Fullscreen request denied or not supported
    }
  }, []);

  // Copy raw mermaid code
  const handleCopyCode = useCallback(async () => {
    if (!rawCode) return;
    try {
      await navigator.clipboard.writeText(rawCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard denied
    }
  }, [rawCode]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={modalRef}
      className="diagram-fullscreen-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Full screen diagram viewer"
    >
      {/* Top Header & Navigation Bar */}
      <header className="diagram-fullscreen-header">
        <div className="diagram-header-left">
          <span className="diagram-header-badge">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            <span>Mermaid Diagram</span>
          </span>
          <span className="diagram-header-hint">
            Drag to pan • Scroll to zoom
          </span>
        </div>

        {/* Center Zoom & Reset Controls */}
        <div className="diagram-zoom-toolbar" role="toolbar" aria-label="Diagram zoom controls">
          <button
            type="button"
            className="diagram-toolbar-btn"
            onClick={zoomOut}
            disabled={scale <= MIN_SCALE}
            title="Zoom out (-)"
            aria-label="Zoom out"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          <button
            type="button"
            className="diagram-scale-indicator"
            onClick={resetView}
            title="Click to reset zoom (0)"
            aria-label={`Current zoom ${Math.round(scale * 100)}%, click to reset`}
          >
            {Math.round(scale * 100)}%
          </button>

          <button
            type="button"
            className="diagram-toolbar-btn"
            onClick={zoomIn}
            disabled={scale >= MAX_SCALE}
            title="Zoom in (+)"
            aria-label="Zoom in"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          <div className="diagram-toolbar-separator" />

          <button
            type="button"
            className="diagram-toolbar-btn"
            onClick={resetView}
            title="Reset position and zoom"
            aria-label="Reset view"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span className="diagram-btn-text">Reset</span>
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="diagram-header-right">
          {rawCode && (
            <button
              type="button"
              className={`diagram-action-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopyCode}
              title="Copy diagram source"
              aria-label="Copy diagram source"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          )}

          <button
            type="button"
            className="diagram-action-btn"
            onClick={handleToggleNativeFullscreen}
            title={isNativeFullscreen ? 'Exit OS Fullscreen' : 'OS Fullscreen'}
            aria-label={isNativeFullscreen ? 'Exit OS Fullscreen' : 'OS Fullscreen'}
          >
            {isNativeFullscreen ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              </svg>
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            )}
            <span className="diagram-btn-text">
              {isNativeFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </span>
          </button>

          <button
            type="button"
            className="diagram-close-btn"
            onClick={onClose}
            title="Close viewer (Esc)"
            aria-label="Close diagram viewer"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <span className="diagram-close-kbd">Esc</span>
          </button>
        </div>
      </header>

      {/* Main Interactive Pan & Zoom Viewport */}
      <div
        ref={viewportRef}
        className={`diagram-fullscreen-viewport ${isDragging ? 'is-dragging' : ''}`}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onDoubleClick={handleDoubleClick}
      >
        <div
          className="diagram-fullscreen-canvas"
          style={{
            width: `${baseDimensions.width}px`,
            height: `${baseDimensions.height}px`,
            transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          dangerouslySetInnerHTML={{ __html: svgHtml }}
        />
      </div>
    </div>,
    document.body
  );
};
