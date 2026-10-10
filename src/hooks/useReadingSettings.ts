import { useState, useEffect, useCallback } from 'react';
import type { ReadingSettings, FontSize, ReadingWidth, BodyFont } from '../lib/types';
import { loadSettingsFromStorage, saveSettingsToStorage } from '../lib/storage';

export function useReadingSettings(): {
  settings: ReadingSettings;
  cycleFontSize: () => void;
  toggleReadingWidth: () => void;
  toggleBodyFont: () => void;
  setFontSize: (size: FontSize) => void;
  setReadingWidth: (width: ReadingWidth) => void;
  setBodyFont: (font: BodyFont) => void;
} {
  const [settings, setSettings] = useState<ReadingSettings>(() => loadSettingsFromStorage());

  const applySettings = useCallback((newSettings: ReadingSettings) => {
    setSettings(newSettings);
    saveSettingsToStorage(newSettings);

    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-font-size', newSettings.fontSize);
      document.documentElement.setAttribute('data-reading-width', newSettings.readingWidth);
      document.documentElement.setAttribute('data-body-font', newSettings.bodyFont);
    }
  }, []);

  const cycleFontSize = useCallback(() => {
    const nextSize: Record<FontSize, FontSize> = {
      small: 'medium',
      medium: 'large',
      large: 'small',
    };
    applySettings({ ...settings, fontSize: nextSize[settings.fontSize] });
  }, [settings, applySettings]);

  const toggleReadingWidth = useCallback(() => {
    applySettings({
      ...settings,
      readingWidth: settings.readingWidth === 'narrow' ? 'wide' : 'narrow',
    });
  }, [settings, applySettings]);

  const toggleBodyFont = useCallback(() => {
    applySettings({
      ...settings,
      bodyFont: settings.bodyFont === 'sans' ? 'serif' : 'sans',
    });
  }, [settings, applySettings]);

  useEffect(() => {
    // Sync initial attributes on mount
    document.documentElement.setAttribute('data-font-size', settings.fontSize);
    document.documentElement.setAttribute('data-reading-width', settings.readingWidth);
    document.documentElement.setAttribute('data-body-font', settings.bodyFont);
  }, [settings]);

  return {
    settings,
    cycleFontSize,
    toggleReadingWidth,
    toggleBodyFont,
    setFontSize: (fontSize) => applySettings({ ...settings, fontSize }),
    setReadingWidth: (readingWidth) => applySettings({ ...settings, readingWidth }),
    setBodyFont: (bodyFont) => applySettings({ ...settings, bodyFont }),
  };
}
