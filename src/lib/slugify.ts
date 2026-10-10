/**
 * Converts a heading string into a URL-friendly slug.
 * Handles Unicode characters, strips special punctuation, and ensures stable IDs.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\u4e00-\u9fa5\-_]+/g, '') // Remove non-word characters except Chinese & hyphen/underscore
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, '') || 'section'; // Trim - from end or fallback
}

/**
 * Creates a unique slug generator to prevent duplicate IDs in the same document.
 */
export function createSlugger(): (text: string) => string {
  const occurrences = new Map<string, number>();

  return (text: string): string => {
    const base = slugify(text);
    const count = occurrences.get(base) ?? 0;
    occurrences.set(base, count + 1);

    if (count === 0) {
      return base;
    }
    return `${base}-${count}`;
  };
}
