import MarkdownIt from 'markdown-it';
import katex from 'katex';

interface InlineState {
  src: string;
  pos: number;
  pending: string;
  push: (type: string, tag: string, nesting: 0 | 1 | -1) => {
    content: string;
    markup: string;
    block?: boolean;
    map?: [number, number] | null;
  };
}

interface BlockState {
  src: string;
  bMarks: number[];
  eMarks: number[];
  tShift: number[];
  line: number;
  push: (type: string, tag: string, nesting: 0 | 1 | -1) => {
    content: string;
    markup: string;
    block?: boolean;
    map?: [number, number] | null;
  };
}

interface MathToken {
  content: string;
}

function isValidDelim(src: string, pos: number): { can_open: boolean; can_close: boolean } {
  const prevChar = pos > 0 ? src.charCodeAt(pos - 1) : 0x20;
  const nextChar = pos + 1 < src.length ? src.charCodeAt(pos + 1) : 0x20;

  // Whitespace checks: 0x20 space, 0x09 tab, 0x0a lf, 0x0d cr
  const isPrevWhitespace = prevChar === 0x20 || prevChar === 0x09 || prevChar === 0x0a || prevChar === 0x0d;
  const isNextWhitespace = nextChar === 0x20 || nextChar === 0x09 || nextChar === 0x0a || nextChar === 0x0d;

  return {
    can_open: !isNextWhitespace,
    can_close: !isPrevWhitespace,
  };
}

export function mathPlugin(md: InstanceType<typeof MarkdownIt>): void {
  // Inline math rule
  md.inline.ruler.before('escape', 'math_inline', (state: InlineState, silent: boolean): boolean => {
    if (state.src.charCodeAt(state.pos) !== 0x24 /* $ */) {
      return false;
    }

    const start = state.pos;
    const isDouble = state.src.charCodeAt(start + 1) === 0x24;
    const delimLength = isDouble ? 2 : 1;

    const delim = isValidDelim(state.src, start);
    if (!delim.can_open) {
      if (!silent) state.pending += state.src.slice(start, start + delimLength);
      state.pos += delimLength;
      return true;
    }

    let end = -1;
    let pos = start + delimLength;

    while (pos < state.src.length) {
      if (state.src.charCodeAt(pos) === 0x24) {
        if (state.src.charCodeAt(pos - 1) === 0x5c /* \ */) {
          pos++;
          continue;
        }

        if (isDouble) {
          if (state.src.charCodeAt(pos + 1) === 0x24) {
            end = pos;
            break;
          }
        } else {
          // Verify closing delimiter
          const closeDelim = isValidDelim(state.src, pos);
          if (closeDelim.can_close) {
            end = pos;
            break;
          }
        }
      }
      pos++;
    }

    if (end === -1) {
      if (!silent) state.pending += state.src.slice(start, start + delimLength);
      state.pos += delimLength;
      return true;
    }

    const content = state.src.slice(start + delimLength, end).trim();

    if (!silent) {
      const token = state.push(isDouble ? 'math_block' : 'math_inline', 'math', 0);
      token.content = content;
      token.markup = isDouble ? '$$' : '$';
    }

    state.pos = end + delimLength;
    return true;
  });

  // Block math rule
  md.block.ruler.before('fence', 'math_block', (state: BlockState, startLine: number, endLine: number, silent: boolean): boolean => {
    const startPos = state.bMarks[startLine] + state.tShift[startLine];
    const maxPos = state.eMarks[startLine];

    if (startPos + 2 > maxPos || state.src.slice(startPos, startPos + 2) !== '$$') {
      return false;
    }

    // Single line block $$ math $$
    const lineText = state.src.slice(startPos, maxPos).trim();
    if (lineText.length > 4 && lineText.endsWith('$$')) {
      if (silent) return true;
      const content = lineText.slice(2, -2).trim();
      const token = state.push('math_block', 'math', 0);
      token.block = true;
      token.content = content;
      token.map = [startLine, startLine + 1];
      token.markup = '$$';
      state.line = startLine + 1;
      return true;
    }

    // Multiline block
    let nextLine = startLine;
    let found = false;

    while (nextLine < endLine) {
      nextLine++;
      if (nextLine >= endLine) break;

      const pos = state.bMarks[nextLine] + state.tShift[nextLine];
      const max = state.eMarks[nextLine];

      if (state.src.slice(pos, max).trim() === '$$') {
        found = true;
        break;
      }
    }

    if (!found) return false;
    if (silent) return true;

    const lines: string[] = [];
    for (let i = startLine + 1; i < nextLine; i++) {
      const pos = state.bMarks[i] + state.tShift[i];
      const max = state.eMarks[i];
      lines.push(state.src.slice(pos, max));
    }

    const token = state.push('math_block', 'math', 0);
    token.block = true;
    token.content = lines.join('\n').trim();
    token.map = [startLine, nextLine + 1];
    token.markup = '$$';

    state.line = nextLine + 1;
    return true;
  });

  // KaTeX Renderers
  md.renderer.rules.math_inline = (tokens: MathToken[], idx: number) => {
    const formula = tokens[idx].content;
    try {
      return katex.renderToString(formula, {
        displayMode: false,
        throwOnError: false,
      });
    } catch {
      return `<span class="katex-error">${formula}</span>`;
    }
  };

  md.renderer.rules.math_block = (tokens: MathToken[], idx: number) => {
    const formula = tokens[idx].content;
    try {
      const rendered = katex.renderToString(formula, {
        displayMode: true,
        throwOnError: false,
      });
      return `<div class="math-block-wrapper">${rendered}</div>`;
    } catch {
      return `<div class="math-block-wrapper katex-error">${formula}</div>`;
    }
  };
}
