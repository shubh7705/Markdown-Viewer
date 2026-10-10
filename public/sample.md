# The Architecture of Modern Typography

Typography is the craft of endowing human language with a durable visual form. When executed with precision and restraint, it transforms reading from a cognitive effort into an effortless journey.

---

## 1. Editorial Principles

An enduring reading environment respects the cadence of prose. In document design, the rendered text is the hero. Excess decoration, frivolous gradients, and heavy frames only distract from the core meaning of the author's argument.

> "A good reader does not notice the typography; they notice the thoughts."
> 
> — Beatrice Warde, *The Crystal Goblet*
>
> > Nested commentary: When clarity is preserved across all viewport widths, the reader maintains deep comprehension.

### 1.1 Structural Hierarchy

Text hierarchy is reinforced through a proportional modular scale rather than arbitrary font weight shifts:

- **Measure & Leading:** Optimal line lengths span between 65 and 75 characters.
- **Rhythm:** Spacing follows a consistent 4px baseline rhythm.
- **Contrast:** Strict WCAG 2.1 AA compliance in both ambient daylight and dark reading modes.

---

## 2. GitHub-Flavored Features

This document validates comprehensive GitHub-Flavored Markdown (GFM) features.

### 2.1 Task Lists & Deliverables

- [x] Implement zero-flash theme persistence using client-side pre-rendering
- [x] Configure strict HTML sanitization via DOMPurify whitelist
- [x] Provide graceful fallback for local relative images
- [ ] Implement multi-stage Docker container deployment
- [ ] Execute comprehensive Vitest and Playwright test suites

### 2.2 Tables with Alignment

| Component | Responsibility | Performance Target | Status |
| :--- | :---: | :---: | ---: |
| `markdown.ts` | Parser Pipeline & AST | < 12ms / 1,000 lines | Active |
| `sanitize.ts` | Security whitelisting | Zero XSS vectors | Verified |
| `useScrollSpy` | Heading section spy | 60 FPS scrolling | Active |
| `useTheme` | Zero-flash preference | < 1ms paint sync | Verified |

### 2.3 Footnotes & Text Formatting

Markdown Viewer supports footnotes[^editorial-note] as well as strikethrough like ~~legacy browser defaults~~, bold **emphasis**, italic *reflection*, and combined ***subtlety***. Autolinks such as https://github.com are automatically detected and secured with `rel="noopener noreferrer"`.

[^editorial-note]: Footnotes provide ancillary bibliographic notes without obstructing the continuous flow of the primary article column.

---

## 3. Code Highlighting & Copy Functionality

Fenced code blocks are styled to harmonize with the theme palette, complete with language badges and one-click copy support.

### 3.1 TypeScript Pipeline

```typescript
import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';

export interface RenderResult {
  html: string;
  headings: Array<{ id: string; text: string; level: number }>;
}

export function parseDocument(rawMarkdown: string): RenderResult {
  const parser = new MarkdownIt({ html: true, linkify: true });
  const rawHtml = parser.render(rawMarkdown);
  const cleanHtml = DOMPurify.sanitize(rawHtml);
  return { html: cleanHtml, headings: [] };
}
```

### 3.2 Python Script Example

```python
from dataclasses import dataclass
import re

@dataclass
class DocumentStats:
    word_count: int
    reading_time_min: int

def analyze_reading_time(content: str) -> DocumentStats:
    words = re.findall(r'\b\w+\b', content)
    count = len(words)
    est_time = max(1, (count + 219) // 220)
    return DocumentStats(word_count=count, reading_time_min=est_time)
```

### 3.3 Rust Type System

```rust
pub struct DocumentMetadata {
    pub title: String,
    pub word_count: usize,
    pub client_side_only: bool,
}

impl DocumentMetadata {
    pub fn new(title: &str, count: usize) -> Self {
        Self {
            title: title.to_string(),
            word_count: count,
            client_side_only: true,
        }
    }
}
```

### 3.4 Shell Command

```bash
# Build and run the web service container
docker build -t markdown-viewer:latest .
docker run -p 8080:80 markdown-viewer:latest
```

---

## 4. Media & Graceful Relative Fallbacks

### 4.1 External Web Image
An external image hosted with HTTPS loads directly:

![Minimalist Mountain](https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80 "Scenic Mountain")

### 4.2 Local Relative Image Placeholder
Local relative images (which are inaccessible in client-side web sandboxes without a folder picker) render as a calm, graceful placeholder rather than a broken image icon:

![System Architecture Diagram](./assets/diagrams/system-architecture.png)

![Database Schema Flowchart](../diagrams/schema.svg)

---

## 5. Security & Privacy Guarantees

All parsing and rendering takes place strictly in the browser using JavaScript and Web APIs. **Documents are never transmitted across the network**, and sanitization prevents script injection attacks.
