export interface DocumentInfo {
  name: string;
  content: string;
  sizeBytes: number;
  wordCount: number;
  readingTimeMin: number;
  lastLoaded: number;
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export type Theme = 'light' | 'dark';

export type FontSize = 'small' | 'medium' | 'large';

export type ReadingWidth = 'narrow' | 'wide';

export type BodyFont = 'sans' | 'serif';

export interface ReadingSettings {
  fontSize: FontSize;
  readingWidth: ReadingWidth;
  bodyFont: BodyFont;
}
