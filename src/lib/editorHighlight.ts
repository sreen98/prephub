// Syntax highlighting and bracket decoration for the Code Playground editor.
//
// Extracted from CodePlayground.tsx: these are pure string→string transforms,
// so they belong outside a 1,900-line component where they could never be
// tested. `decorateBrackets` in particular walks rendered highlight.js HTML and
// is exactly the kind of code that needs a test.
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';   // JSX-ish tags

// Register languages once at module load. JS handles JSX tag syntax fine
// for our purposes, with xml as a fallback for tag-only snippets.
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);

export function highlightCode(code: string, langId: string): string {
  try {
    return hljs.highlight(code, { language: langId, ignoreIllegals: true }).value;
  } catch {
    return hljs.highlight(code, { language: 'javascript', ignoreIllegals: true }).value;
  }
}

// ===== Bracket decoration: rainbow depth + match-at-caret =====
// Walks the hljs HTML output and wraps every `( [ {` and `) ] }` in a span with
// a depth-based class (`bd-0`/`bd-1`/`bd-2`). When `caretMatch` names a pair,
// those two brackets also get `bd-match`. We skip brackets inside strings,
// comments, and regex literals (those already live in `.hljs-string` etc.).
const OPEN_TO_CLOSE: Record<string, string> = { '(': ')', '[': ']', '{': '}' };
const CLOSE_TO_OPEN: Record<string, string> = { ')': '(', ']': '[', '}': '{' };

/**
 * Marks every index that sits inside a string, a line comment or a block
 * comment — i.e. the positions where a bracket is just text.
 *
 * Split out of buildBracketMatches so each half is a simple loop. Combined,
 * the two concerns (skip-zone lexing and bracket pairing) pushed a single
 * function past the complexity limit and made it hard to follow.
 */
function markNonCodeSpans(code: string): Uint8Array {
  const skip = new Uint8Array(code.length);
  let inStr: string | null = null;
  let inLine = false;
  let inBlock = false;

  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    const nx = code[i + 1];

    if (inLine) {
      skip[i] = 1;
      if (ch === '\n') inLine = false;
      continue;
    }
    if (inBlock) {
      skip[i] = 1;
      if (ch === '*' && nx === '/') { skip[i + 1] = 1; inBlock = false; i++; }
      continue;
    }
    if (inStr !== null) {
      skip[i] = 1;
      if (ch === '\\') { skip[i + 1] = 1; i++; continue; }   // escaped char
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '/' && nx === '/') { skip[i] = skip[i + 1] = 1; inLine = true; i++; continue; }
    if (ch === '/' && nx === '*') { skip[i] = skip[i + 1] = 1; inBlock = true; i++; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { skip[i] = 1; inStr = ch; }
  }
  return skip;
}

/**
 * Maps each bracket position to its partner, in both directions. Brackets in
 * strings and comments are ignored, and an unmatched or mismatched bracket
 * simply gets no entry.
 */
export function buildBracketMatches(code: string): Map<number, number> {
  const skip = markNonCodeSpans(code);
  const stack: { ch: string; pos: number }[] = [];
  const matches = new Map<number, number>();

  for (let i = 0; i < code.length; i++) {
    if (skip[i]) continue;
    const ch = code[i];
    if (ch in OPEN_TO_CLOSE) {
      stack.push({ ch, pos: i });
    } else if (ch in CLOSE_TO_OPEN) {
      const top = stack.pop();
      if (top && OPEN_TO_CLOSE[top.ch] === ch) {
        matches.set(top.pos, i);
        matches.set(i, top.pos);
      }
    }
  }
  return matches;
}

export function findCaretMatch(code: string, caret: number, matches: Map<number, number>): [number, number] | null {
  if (caret < 0) return null;
  const candidates = caret > 0 ? [caret - 1, caret] : [caret];
  for (const idx of candidates) {
    if (idx < 0 || idx >= code.length) continue;
    const ch = code[idx];
    if (!(ch in OPEN_TO_CLOSE) && !(ch in CLOSE_TO_OPEN)) continue;
    const m = matches.get(idx);
    if (m !== undefined) return [Math.min(idx, m), Math.max(idx, m)];
  }
  return null;
}

const EXCLUDED_HLJS = ['hljs-string', 'hljs-comment', 'hljs-regexp', 'hljs-meta-string'];

export function decorateBrackets(html: string, code: string, caret: number): string {
  if (typeof document === 'undefined') return html;
  const matches = buildBracketMatches(code);
  const pair = findCaretMatch(code, caret, matches);
  const container = document.createElement('div');
  container.innerHTML = html;
  let pos = 0;
  let depth = 0;

  const isExcluded = (el: Element | null): boolean => {
    let cur: Element | null = el;
    while (cur) {
      for (const cls of EXCLUDED_HLJS) {
        if (cur.classList.contains(cls)) return true;
      }
      cur = cur.parentElement;
    }
    return false;
  };

  const walk = (node: Node) => {
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === 3) {
        const text = (child as Text).nodeValue || '';
        if (isExcluded((child as Text).parentElement)) {
          pos += text.length;
          continue;
        }
        wrapText(child as Text, text);
      } else if (child.nodeType === 1) {
        const el = child as Element;
        let excluded = false;
        for (const cls of EXCLUDED_HLJS) {
          if (el.classList.contains(cls)) { excluded = true; break; }
        }
        if (excluded) {
          pos += (el.textContent || '').length;
          continue;
        }
        walk(el);
      }
    }
  };

  const wrapText = (textNode: Text, text: string) => {
    if (!/[(){}[\]]/.test(text)) {
      pos += text.length;
      return;
    }
    const parent = textNode.parentNode!;
    const frag = document.createDocumentFragment();
    let buf = '';
    const flushBuf = () => {
      if (buf) {
        frag.appendChild(document.createTextNode(buf));
        buf = '';
      }
    };
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const charPos = pos + i;
      const isOpen = ch in OPEN_TO_CLOSE;
      const isClose = ch in CLOSE_TO_OPEN;
      if (!isOpen && !isClose) { buf += ch; continue; }
      flushBuf();
      let useDepth: number;
      if (isOpen) { useDepth = depth; depth++; }
      else { depth = Math.max(0, depth - 1); useDepth = depth; }
      const span = document.createElement('span');
      const classes = [`bd-${useDepth % 3}`];
      if (pair && (pair[0] === charPos || pair[1] === charPos)) {
        classes.push('bd-match');
      }
      span.className = classes.join(' ');
      span.textContent = ch;
      frag.appendChild(span);
    }
    flushBuf();
    parent.replaceChild(frag, textNode);
    pos += text.length;
  };

  walk(container);
  return container.innerHTML;
}

// Prettier is a ~80 KB gzipped chunk — lazy-loaded on first format click.
