import React from 'react';
import {
  Sun,
  Moon,
  FolderOpen,
  PanelLeft,
  HelpCircle,
  RotateCcw,
  BookOpen,
  Maximize2,
  Minimize2,
  Type,
} from 'lucide-react';
import type { DocumentInfo, ReadingSettings, Theme } from '../lib/types';

interface TopBarProps {
  document: DocumentInfo | null;
  theme: Theme;
  onToggleTheme: () => void;
  onOpenFile: () => void;
  onClearDocument: () => void;
  isTocOpen: boolean;
  onToggleToc: () => void;
  onOpenShortcuts: () => void;
  readingSettings: ReadingSettings;
  onCycleFontSize: () => void;
  onToggleReadingWidth: () => void;
  onToggleBodyFont: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  document,
  theme,
  onToggleTheme,
  onOpenFile,
  onClearDocument,
  isTocOpen,
  onToggleToc,
  onOpenShortcuts,
  readingSettings,
  onCycleFontSize,
  onToggleReadingWidth,
  onToggleBodyFont,
}) => {
  return (
    <header className="topbar" id="app-topbar">
      <div className="topbar-left">
        {document && (
          <button
            type="button"
            className={`btn-icon ${isTocOpen ? 'active' : ''}`}
            onClick={onToggleToc}
            aria-label={isTocOpen ? 'Hide Table of Contents ([)' : 'Show Table of Contents ([)'}
            title="Toggle Table of Contents ([)"
            id="toc-toggle-button"
          >
            <PanelLeft aria-hidden="true" />
          </button>
        )}

        <div className="brand-mark">
          <BookOpen className="brand-icon" aria-hidden="true" />
          <span className="brand-text">Markdown Viewer</span>
        </div>

        {document && (
          <>
            <div className="divider-vertical" aria-hidden="true" />
            <div className="document-meta-pill">
              <span className="document-title" title={document.name} id="document-title">
                {document.name}
              </span>
              <span className="document-stats" id="document-stats">
                • {document.wordCount.toLocaleString()} words • ~{document.readingTimeMin} min read
              </span>
            </div>
          </>
        )}
      </div>

      <div className="topbar-right">
        {document && (
          <>
            {/* Reading width toggle */}
            <button
              type="button"
              className="btn-icon"
              onClick={onToggleReadingWidth}
              aria-label={`Reading measure: ${readingSettings.readingWidth === 'narrow' ? 'Narrow' : 'Wide'}`}
              title={`Reading measure: ${readingSettings.readingWidth === 'narrow' ? 'Switch to Wide' : 'Switch to Narrow'}`}
              id="reading-width-button"
            >
              {readingSettings.readingWidth === 'narrow' ? (
                <Maximize2 aria-hidden="true" />
              ) : (
                <Minimize2 aria-hidden="true" />
              )}
            </button>

            {/* Font size cycler */}
            <button
              type="button"
              className="btn-pill"
              onClick={onCycleFontSize}
              aria-label={`Font size: ${readingSettings.fontSize}. Click to change.`}
              title="Adjust text size"
              id="font-size-button"
            >
              <span>{readingSettings.fontSize === 'small' ? '15px' : readingSettings.fontSize === 'medium' ? '17px' : '19px'}</span>
            </button>

            {/* Font family toggle (sans / serif) */}
            <button
              type="button"
              className={`btn-icon ${readingSettings.bodyFont === 'serif' ? 'active' : ''}`}
              onClick={onToggleBodyFont}
              aria-label={`Font style: ${readingSettings.bodyFont}. Click to toggle.`}
              title={`Switch typography to ${readingSettings.bodyFont === 'sans' ? 'Editorial Serif' : 'Sans'}`}
              id="body-font-button"
            >
              <Type aria-hidden="true" />
            </button>

            {/* Clear document */}
            <button
              type="button"
              className="btn-icon"
              onClick={onClearDocument}
              aria-label="Clear document"
              title="Clear current document"
              id="clear-doc-button"
            >
              <RotateCcw aria-hidden="true" />
            </button>
          </>
        )}

        {/* Keyboard shortcut guide */}
        <button
          type="button"
          className="btn-icon"
          onClick={onOpenShortcuts}
          aria-label="Keyboard shortcuts (?)"
          title="Keyboard shortcuts (?)"
          id="shortcuts-help-button"
        >
          <HelpCircle aria-hidden="true" />
        </button>

        {/* Theme toggle */}
        <button
          type="button"
          className="btn-icon"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode (T)`}
          aria-pressed={theme === 'dark'}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode (T)`}
          id="theme-toggle-button"
        >
          {theme === 'dark' ? (
            <Sun aria-hidden="true" />
          ) : (
            <Moon aria-hidden="true" />
          )}
        </button>

        {/* Primary Open File Button */}
        <button
          type="button"
          className="btn-primary"
          onClick={onOpenFile}
          aria-label="Open markdown file (O)"
          title="Open markdown file (O)"
          id="open-file-topbar-button"
        >
          <FolderOpen aria-hidden="true" />
          <span>Open</span>
        </button>
      </div>
    </header>
  );
};
