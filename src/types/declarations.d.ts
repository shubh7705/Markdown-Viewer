declare module 'markdown-it-task-lists' {
  import type MarkdownIt from 'markdown-it';
  export default function taskLists(md: MarkdownIt, options?: { enabled?: boolean; label?: boolean; labelAfter?: boolean }): void;
}

declare module 'markdown-it-footnote' {
  import type MarkdownIt from 'markdown-it';
  export default function footnote(md: MarkdownIt): void;
}
