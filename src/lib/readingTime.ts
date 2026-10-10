/**
 * Calculates word count and estimated reading time in minutes.
 * Average reading speed: 220 words per minute.
 */
export function calculateReadingStats(markdownText: string): { wordCount: number; readingTimeMin: number } {
  if (!markdownText || !markdownText.trim()) {
    return { wordCount: 0, readingTimeMin: 0 };
  }

  // Strip code blocks and HTML tags to prevent skewed word counts
  const cleanText = markdownText
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<[^>]*>/g, '')
    .trim();

  // Match words across standard alphanumeric tokens
  const words = cleanText.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu);
  const wordCount = words ? words.length : 0;

  if (wordCount === 0) {
    return { wordCount: 0, readingTimeMin: 0 };
  }

  const readingTimeMin = Math.max(1, Math.ceil(wordCount / 220));

  return {
    wordCount,
    readingTimeMin,
  };
}
