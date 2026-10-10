import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { DocumentInfo } from './lib/types';
import { renderMarkdown } from './lib/markdown';
import { calculateReadingStats } from './lib/readingTime';
import {
  saveDocumentToStorage,
  loadDocumentFromStorage,
  clearDocumentFromStorage,
} from './lib/storage';
import { useTheme } from './hooks/useTheme';
import { useReadingSettings } from './hooks/useReadingSettings';
import { useScrollSpy } from './hooks/useScrollSpy';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { TopBar } from './components/TopBar';
import { TableOfContents } from './components/TableOfContents';
import { DocumentRenderer } from './components/DocumentRenderer';
import { EmptyState } from './components/EmptyState';
import { DropOverlay } from './components/DropOverlay';
import { PasteModal } from './components/PasteModal';
import { ShortcutsModal } from './components/ShortcutsModal';

const MAX_SAFE_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const App: React.FC = () => {
  const [doc, setDoc] = useState<DocumentInfo | null>(() => loadDocumentFromStorage());
  const [isDragging, setIsDragging] = useState(false);
  const [isTocOpen, setIsTocOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth > 860 : true));
  const [isPasteOpen, setIsPasteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const { theme, toggleTheme } = useTheme();
  const {
    settings,
    cycleFontSize,
    toggleReadingWidth,
    toggleBodyFont,
  } = useReadingSettings();

  // Render markdown with memoization for performance
  const renderResult = useMemo(() => {
    if (!doc || !doc.content) {
      return { html: '', toc: [] };
    }
    return renderMarkdown(doc.content);
  }, [doc]);

  const headingIds = useMemo(() => renderResult.toc.map((t) => t.id), [renderResult.toc]);
  const activeHeadingId = useScrollSpy(headingIds);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => {
      setNotice((current) => (current === msg ? null : current));
    }, 4500);
  };

  const processMarkdownFile = useCallback((file: File) => {
    const validExtensions = ['.md', '.markdown', '.txt'];
    const nameLower = file.name.toLowerCase();
    const isValidExtension = validExtensions.some((ext) => nameLower.endsWith(ext));

    if (!isValidExtension) {
      showNotice('Unsupported file format. Please upload a .md, .markdown, or .txt file.');
      return;
    }

    if (file.size > MAX_SAFE_FILE_SIZE_BYTES) {
      showNotice('Notice: File is larger than 5 MB. Performance may be degraded.');
    }

    if (file.size === 0) {
      showNotice('The selected file is empty.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || '';
      const stats = calculateReadingStats(text);
      const newDoc: DocumentInfo = {
        name: file.name,
        content: text,
        sizeBytes: file.size,
        wordCount: stats.wordCount,
        readingTimeMin: stats.readingTimeMin,
        lastLoaded: Date.now(),
      };

      setDoc(newDoc);
      const saveRes = saveDocumentToStorage(newDoc);
      if (!saveRes.saved && saveRes.error) {
        showNotice(saveRes.error);
      }
    };

    reader.onerror = () => {
      showNotice('Failed to read the file. Please verify it is a valid UTF-8 text file.');
    };

    reader.readAsText(file, 'utf-8');
  }, []);

  const handlePasteSubmit = useCallback((content: string) => {
    const stats = calculateReadingStats(content);
    const newDoc: DocumentInfo = {
      name: 'Pasted Document.md',
      content,
      sizeBytes: new Blob([content]).size,
      wordCount: stats.wordCount,
      readingTimeMin: stats.readingTimeMin,
      lastLoaded: Date.now(),
    };
    setDoc(newDoc);
    const saveRes = saveDocumentToStorage(newDoc);
    if (!saveRes.saved && saveRes.error) {
      showNotice(saveRes.error);
    }
  }, []);

  const handleLoadSample = useCallback(async () => {
    try {
      const response = await fetch('/sample.md');
      if (!response.ok) {
        throw new Error('Failed to load sample.md');
      }
      const text = await response.text();
      const stats = calculateReadingStats(text);
      const newDoc: DocumentInfo = {
        name: 'sample.md',
        content: text,
        sizeBytes: new Blob([text]).size,
        wordCount: stats.wordCount,
        readingTimeMin: stats.readingTimeMin,
        lastLoaded: Date.now(),
      };
      setDoc(newDoc);
      saveDocumentToStorage(newDoc);
    } catch {
      showNotice('Unable to load sample document.');
    }
  }, []);

  const handleClearDocument = useCallback(() => {
    setDoc(null);
    clearDocumentFromStorage();
  }, []);

  const handleOpenFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processMarkdownFile(file);
    }
    // Reset file input so re-selecting same file triggers onChange
    e.target.value = '';
  };

  // Full-window drag and drop event listeners
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current += 1;
      if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current -= 1;
      if (dragCounterRef.current <= 0) {
        setIsDragging(false);
        dragCounterRef.current = 0;
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      setIsDragging(false);

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        processMarkdownFile(files[0]);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [processMarkdownFile]);

  // Keyboard shortcut binding
  useKeyboardShortcuts({
    onOpenFile: handleOpenFileInput,
    onToggleTheme: toggleTheme,
    onToggleToc: () => setIsTocOpen((prev) => !prev),
    onToggleHelp: () => setIsShortcutsOpen((prev) => !prev),
    onEscape: () => {
      setIsPasteOpen(false);
      setIsShortcutsOpen(false);
      setIsTocOpen(false);
    },
  });

  return (
    <div className="app-container" id="markdown-viewer-app">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown,.txt"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
        id="hidden-file-input"
        aria-label="Upload markdown document"
      />

      {/* Top Header */}
      <TopBar
        document={doc}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenFile={handleOpenFileInput}
        onClearDocument={handleClearDocument}
        isTocOpen={isTocOpen}
        onToggleToc={() => setIsTocOpen((prev) => !prev)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        readingSettings={settings}
        onCycleFontSize={cycleFontSize}
        onToggleReadingWidth={toggleReadingWidth}
        onToggleBodyFont={toggleBodyFont}
      />

      {/* Ephemeral Notification Banner */}
      {notice && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 90,
            padding: '10px 16px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-strong)',
            borderRadius: '6px',
            boxShadow: 'var(--shadow-dropdown)',
            fontSize: '13px',
            color: 'var(--text-primary)',
          }}
        >
          {notice}
        </div>
      )}

      {/* Main Content Area */}
      <div className="content-layout">
        {doc ? (
          <>
            <TableOfContents
              toc={renderResult.toc}
              activeId={activeHeadingId}
              isOpen={isTocOpen}
              onClose={() => setIsTocOpen(false)}
            />
            <DocumentRenderer html={renderResult.html} theme={theme} />
          </>
        ) : (
          <EmptyState
            onOpenFile={handleOpenFileInput}
            onOpenPasteModal={() => setIsPasteOpen(true)}
            onLoadSample={handleLoadSample}
          />
        )}
      </div>

      {/* Drag & Drop Fullscreen Overlay */}
      <DropOverlay isDragging={isDragging} />

      {/* Modals */}
      <PasteModal
        isOpen={isPasteOpen}
        onClose={() => setIsPasteOpen(false)}
        onSubmit={handlePasteSubmit}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};

export default App;
