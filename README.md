# Markdown Viewer

An editorial, client-side web application for reading Markdown documents with refined typography, GitHub-Flavored Markdown (GFM) support, and privacy preservation.

**Live Application:** [https://markdown-viewer-kappa-drab.vercel.app](https://markdown-viewer-kappa-drab.vercel.app/)

---

## 1. Key Principles & Design Decisions

### 1.1 Editorial Reading Experience
Markdown Viewer prioritizes the rendered text as the focal point of the interface:
- **Restrained Neutral Palette:** Warm off-white canvas (`#fbfbf9`) paired with deep ink body copy (`#1c1d21`) in Light mode; soft charcoal (`#151618`) paired with dimmed chalk copy (`#ededed`) in Dark mode.
- **Single Restrained Accent:** Refined Steel Indigo (`#3b5bdb` in Light / `#748ffc` in Dark) reserved strictly for interactive hyperlinks, active Table of Contents indicators, and keyboard focus outlines.
- **Strict WCAG 2.1 AA Contrast:** Contrast ratios exceed 7:1 for body copy in both themes.
- **Typography Scale:** Major Third (1.25) modular scale using self-hosted `@fontsource/inter` (UI and sans body), `@fontsource/source-serif-4` (editorial serif option), and `@fontsource/jetbrains-mono` (code blocks).
- **Measure & Line Length:** Body text is sized at 17px (`15px` small, `19px` large) with line-height `1.72` and optimal reading measures of `66ch` (narrow) and `86ch` (wide).
- **Hairline Structure:** Subtle 1px borders (`var(--border-subtle)`) and crisp minimal shadows instead of heavy blur, glowing cards, or neon borders.
- **Zero Decorative Noise:** No purple/blue gradients, glowing blobs, glassmorphism, or emojis used as UI icons.

---

## 2. Core Features

1. **File Ingestion:**
   - Full-window drag-and-drop target with a calm overlay.
   - File picker supporting `.md`, `.markdown`, and `.txt` files.
   - Direct raw Markdown paste dialog.
   - Built-in comprehensive sample document (`sample.md`).
2. **GitHub-Flavored Markdown (GFM):**
   - Headings 1 through 6 with deterministic slug anchors.
   - Tables with responsive horizontal scroll wrapper.
   - Task lists with read-only styled checkboxes.
   - Footnotes with back-references.
   - Strikethrough, bold, italic, and autolinks.
   - Fenced code blocks with language badges and one-click copy with visual feedback.
3. **LaTeX Math Support (KaTeX):**
   - High-performance, client-side typesetting for both inline (`$d_{\text{model}}$`, `$d_k = d_{\text{model}} / H = 256 / 8$`) and display math (`$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$`).
   - Clean horizontal scrolling on mobile/narrow viewports for long mathematical equations.
   - Whitelisted MathML and KaTeX markup in DOMPurify sanitization.
4. **Mermaid Diagram Viewer:**
   - Seamlessly renders Mermaid diagrams (`graph TD`, `sequenceDiagram`, `classDiagram`, `stateDiagram-v2`, `erDiagram`, etc.).
   - Interactive viewer card with a header toolbar allowing readers to toggle between the rendered interactive diagram and the raw Mermaid definition.
   - Theme-adaptive diagram theming (`dark` vs `neutral`) syncing seamlessly with light and dark mode toggles.
   - Copy-to-clipboard button for diagram source code.
   - Graceful inline error fallback preserving raw code if diagram syntax is invalid.
5. **Graceful Relative Image Fallback:**
   - Detects relative image paths (which cannot resolve in a browser without local filesystem access) and presents an elegant placeholder badge showing the alt text and target path rather than a broken image icon.
   - External HTTPS images load with lazy loading.
6. **Interactive Table of Contents (TOC):**
   - Automatically generated from document headings.
   - `IntersectionObserver` scroll-spy highlighting the active heading in real time.
   - Sticky sidebar on desktop; responsive slide-out drawer on mobile viewports (< 860px).
7. **Zero-Flash Theme Switching:**
   - Synchronous inline script in `index.html` resolves theme from `localStorage` or `prefers-color-scheme` before first paint, preventing theme flicker on reload.
8. **Reading Controls & Persistence:**
   - Stepper for 3 font sizes (`15px`, `17px`, `19px`).
   - Measure toggle between narrow (`66ch`) and wide (`86ch`).
   - Font switcher between Sans and Editorial Serif.
   - Remembers the current document in `localStorage` with a 2.5 MB safe quota limit.
   - Instant "Clear" action.
9. **Keyboard Navigation:**
   - `O`: Open file picker
   - `T`: Toggle light / dark theme
   - `[`: Toggle Table of Contents sidebar / drawer
   - `?`: Open keyboard shortcut guide
   - `Esc`: Close modals and drawers
   - Hotkeys are automatically ignored while typing in input or textarea fields.
10. **Clean Print Stylesheet:**
    - `@media print` eliminates UI headers, drawers, buttons, and drop zones, resetting the layout to pure ink on paper.
11. **Security & Local Privacy:**
    - All parsing and rendering happens strictly client-side. Documents never leave the browser.
    - Strict `DOMPurify` whitelisting strips malicious `<script>`, `onerror`, `onload`, and `javascript:` URIs.

---

## 3. Architecture & Directory Structure

```
markdown-viewer/
├── public/
│   ├── sample.md             # Complete GFM feature demonstration file
│   └── favicon.svg           # Clean SVG brand icon
├── src/
│   ├── main.tsx              # Strict mode React mount
│   ├── App.tsx               # Primary layout, drag/drop, and shortcut handling
│   ├── index.css             # Entry stylesheet importing design tokens
│   ├── components/
│   │   ├── TopBar.tsx        # Slim navigation bar with reading controls
│   │   ├── TableOfContents.tsx # Sticky sidebar and mobile drawer
│   │   ├── DocumentRenderer.tsx# Sanitized article container with KaTeX & Mermaid rendering
│   │   ├── EmptyState.tsx    # Minimal, calm drop zone
│   │   ├── DropOverlay.tsx   # Fullscreen drag-over indicator
│   │   ├── PasteModal.tsx    # Raw markdown text paste modal
│   │   └── ShortcutsModal.tsx# Keyboard shortcuts helper dialog
│   ├── hooks/
│   │   ├── useTheme.ts       # Theme synchronization & storage
│   │   ├── useReadingSettings.ts # Font size, width, and font family settings
│   │   ├── useScrollSpy.ts   # IntersectionObserver heading tracker
│   │   └── useKeyboardShortcuts.ts # Global hotkey dispatcher
│   ├── lib/
│   │   ├── types.ts          # TypeScript interfaces & types
│   │   ├── slugify.ts        # URL-safe heading slug generator
│   │   ├── readingTime.ts    # Word counter and reading duration estimator
│   │   ├── storage.ts        # Quota-safe localStorage persistence
│   │   ├── sanitize.ts       # DOMPurify configuration with MathML & SVG whitelisting
│   │   ├── mathPlugin.ts     # Markdown-it KaTeX plugin for inline & display math
│   │   └── markdown.ts       # Markdown-it GFM pipeline, KaTeX, & Mermaid renderer
│   ├── styles/
│   │   ├── tokens.css        # CSS variables for themes, radii, and spacing
│   │   ├── base.css          # Reset, self-hosted fonts, KaTeX styles, and scrollbars
│   │   ├── layout.css        # Responsive layouts, headers, and drawers
│   │   ├── markdown.css      # Editorial typography, math blocks, Mermaid cards, and print styles
│   │   └── code-theme.css    # Highlight.js themes matching light and dark modes
│   ├── test/
│   │   ├── setup.ts          # Vitest and Jest DOM setup
│   │   ├── markdown.test.ts  # GFM parsing, KaTeX math, Mermaid diagrams, & ARCHITECTURE.md tests
│   │   ├── sanitize.test.ts  # Security sanitization & MathML/SVG preservation tests
│   │   ├── readingTime.test.ts # Reading stats tests
│   │   └── storage.test.ts   # LocalStorage quota tests
│   └── types/
│       └── declarations.d.ts # Plugin module declarations
├── e2e/
│   ├── smoke.spec.ts         # Playwright smoke test suite
│   ├── architecture.spec.ts  # E2E test verifying KaTeX math and Mermaid SVGs on ARCHITECTURE.md
│   └── screenshots.spec.ts   # Automated multi-viewport screenshot capture
├── Dockerfile                # Multi-stage production container
├── nginx.conf                # High-performance static web server config
├── vitest.config.ts          # Vitest runner configuration
└── playwright.config.ts      # Playwright end-to-end configuration
```

---

## 4. Scripts & Development

### Prerequisites
- Node.js `20+` or `23+`
- npm `10+`

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Starts the Vite dev server at `http://localhost:5173`.

### Unit Tests (Vitest)
```bash
npm test
```
Runs the 23 unit tests covering GFM parsing, KaTeX math typesetting, Mermaid diagram generation, security sanitization, reading statistics, storage, and performance benchmarks.

### End-to-End Tests (Playwright)
```bash
npm run test:e2e
```
Runs headless browser smoke tests validating file loading, theme persistence, reading controls, and keyboard shortcuts.

### Production Build
```bash
npm run build
```
Typechecks with strict TypeScript and generates the optimized production bundle in `dist/`.

### Linting
```bash
npm run lint
```
Runs `oxlint` across all source files.

---

## 5. Docker Deployment

Markdown Viewer includes a production-ready, multi-stage `Dockerfile`:
```bash
# Build the container image
docker build -t markdown-viewer:latest .

# Run the container on port 8080
docker run -d -p 8080:80 --name markdown-reader markdown-viewer:latest
```
Access the application at `http://localhost:8080`.
