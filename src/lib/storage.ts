import type { DocumentInfo, ReadingSettings, Theme } from './types';

const STORAGE_KEYS = {
  DOCUMENT: 'mdv_document',
  THEME: 'mdv_theme',
  SETTINGS: 'mdv_settings',
} as const;

// 2.5 MB safe limit for browser localStorage
const MAX_STORAGE_BYTES = 2.5 * 1024 * 1024;

export const DEFAULT_SETTINGS: ReadingSettings = {
  fontSize: 'medium',
  readingWidth: 'narrow',
  bodyFont: 'sans',
};

export function saveDocumentToStorage(doc: DocumentInfo): { saved: boolean; error?: string } {
  try {
    const serialized = JSON.stringify(doc);
    if (new Blob([serialized]).size > MAX_STORAGE_BYTES) {
      return {
        saved: false,
        error: 'Document exceeds localStorage persistence limit (2.5 MB). Displaying in-memory only.',
      };
    }
    localStorage.setItem(STORAGE_KEYS.DOCUMENT, serialized);
    return { saved: true };
  } catch (err) {
    return {
      saved: false,
      error: err instanceof Error ? err.message : 'Failed to save document to localStorage.',
    };
  }
}

export function loadDocumentFromStorage(): DocumentInfo | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCUMENT);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DocumentInfo;
    if (parsed && typeof parsed.content === 'string' && typeof parsed.name === 'string') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearDocumentFromStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.DOCUMENT);
  } catch {
    // Ignore storage deletion errors
  }
}

export function saveThemeToStorage(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch {
    // Ignore
  }
}

export function loadThemeFromStorage(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveSettingsToStorage(settings: ReadingSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // Ignore
  }
}

export function loadSettingsFromStorage(): ReadingSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<ReadingSettings>;
    return {
      fontSize: parsed.fontSize === 'small' || parsed.fontSize === 'large' ? parsed.fontSize : 'medium',
      readingWidth: parsed.readingWidth === 'wide' ? 'wide' : 'narrow',
      bodyFont: parsed.bodyFont === 'serif' ? 'serif' : 'sans',
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
