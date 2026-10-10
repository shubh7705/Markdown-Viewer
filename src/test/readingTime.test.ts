import { describe, it, expect } from 'vitest';
import { calculateReadingStats } from '../lib/readingTime';

describe('Reading Statistics Calculator', () => {
  it('returns zeros for empty or whitespace-only text', () => {
    expect(calculateReadingStats('')).toEqual({ wordCount: 0, readingTimeMin: 0 });
    expect(calculateReadingStats('   \n  \t ')).toEqual({ wordCount: 0, readingTimeMin: 0 });
  });

  it('accurately counts words and computes reading time', () => {
    const text = 'The quick brown fox jumps over the lazy dog.';
    const stats = calculateReadingStats(text);
    expect(stats.wordCount).toBe(9);
    expect(stats.readingTimeMin).toBe(1);
  });

  it('excludes code blocks from skewing the word count', () => {
    const markdown = `
Introduction to the algorithm.

\`\`\`python
for i in range(1000):
    print("code snippet line")
\`\`\`

Conclusion paragraph here.
    `;
    const stats = calculateReadingStats(markdown);
    // Only "Introduction to the algorithm." (4) and "Conclusion paragraph here." (3)
    expect(stats.wordCount).toBe(7);
    expect(stats.readingTimeMin).toBe(1);
  });
});
