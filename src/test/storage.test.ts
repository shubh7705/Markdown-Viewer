import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveDocumentToStorage,
  loadDocumentFromStorage,
  clearDocumentFromStorage,
  saveSettingsToStorage,
  loadSettingsFromStorage,
  DEFAULT_SETTINGS,
} from '../lib/storage';
import type { DocumentInfo, ReadingSettings } from '../lib/types';

describe('Storage Persistence Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and loads a valid document', () => {
    const doc: DocumentInfo = {
      name: 'notes.md',
      content: '# Hello World',
      sizeBytes: 13,
      wordCount: 2,
      readingTimeMin: 1,
      lastLoaded: Date.now(),
    };

    const saveResult = saveDocumentToStorage(doc);
    expect(saveResult.saved).toBe(true);

    const loaded = loadDocumentFromStorage();
    expect(loaded).not.toBeNull();
    expect(loaded?.name).toBe('notes.md');
    expect(loaded?.content).toBe('# Hello World');
  });

  it('clears stored document', () => {
    const doc: DocumentInfo = {
      name: 'notes.md',
      content: '# Notes',
      sizeBytes: 7,
      wordCount: 1,
      readingTimeMin: 1,
      lastLoaded: Date.now(),
    };

    saveDocumentToStorage(doc);
    expect(loadDocumentFromStorage()).not.toBeNull();

    clearDocumentFromStorage();
    expect(loadDocumentFromStorage()).toBeNull();
  });

  it('saves and loads reading settings', () => {
    expect(loadSettingsFromStorage()).toEqual(DEFAULT_SETTINGS);

    const customSettings: ReadingSettings = {
      fontSize: 'large',
      readingWidth: 'wide',
      bodyFont: 'serif',
    };

    saveSettingsToStorage(customSettings);
    expect(loadSettingsFromStorage()).toEqual(customSettings);
  });
});
