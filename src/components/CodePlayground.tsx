import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import * as ReactDOM from 'react-dom/client';
import { Link } from 'react-router-dom';
import { Play, Trash2, ArrowLeft, Loader2, X, Search, BookOpen, PanelLeftOpen, ChevronRight, Lightbulb, Wand2, Braces, Sparkles, RotateCcw, WrapText, Shuffle, StickyNote, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from 'react-simple-code-editor';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';   // JSX-ish tags

// Register languages once at module load. JS handles JSX tag syntax fine
// for our purposes, with xml as a fallback for tag-only snippets.
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);

function highlightCode(code: string, langId: string): string {
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

function buildBracketMatches(code: string): Map<number, number> {
  const stack: { ch: string; pos: number }[] = [];
  const matches = new Map<number, number>();
  let inStr: string | null = null;
  let inLine = false;
  let inBlock = false;
  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    const nx = code[i + 1];
    if (inLine) { if (ch === '\n') inLine = false; continue; }
    if (inBlock) { if (ch === '*' && nx === '/') { inBlock = false; i++; } continue; }
    if (inStr) {
      if (ch === '\\') { i++; continue; }
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '/' && nx === '/') { inLine = true; i++; continue; }
    if (ch === '/' && nx === '*') { inBlock = true; i++; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; continue; }
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

function findCaretMatch(code: string, caret: number, matches: Map<number, number>): [number, number] | null {
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

function decorateBrackets(html: string, code: string, caret: number): string {
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
    if (!/[(){}\[\]]/.test(text)) {
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
// Cached in module scope so subsequent formats are instant.
let prettierBundle: { format: (code: string, opts: object) => Promise<string>; plugins: object[] } | null = null;
async function loadPrettier() {
  if (prettierBundle) return prettierBundle;
  const [prettierMod, babelMod, estreeMod, tsMod] = await Promise.all([
    import('prettier/standalone'),
    import('prettier/plugins/babel'),
    import('prettier/plugins/estree'),
    import('prettier/plugins/typescript'),
  ]);
  prettierBundle = {
    format: prettierMod.format,
    plugins: [
      babelMod.default ?? babelMod,
      estreeMod.default ?? estreeMod,
      tsMod.default ?? tsMod,
    ],
  };
  return prettierBundle;
}

async function formatCode(source: string, lang: string): Promise<string> {
  const { format, plugins } = await loadPrettier();
  // Pick parser by what the source actually contains, not just by template lang.
  // The `typescript` parser handles both pure TS and TSX (TS + JSX) reliably,
  // while `babel-ts` in Prettier 3's standalone bundle chokes on some generics
  // when JSX is present. `babel` covers plain JS and JSX-without-TS.
  const hasTS = lang === 'ts' || lang === 'tsx' || detectTS(source);
  const parser = hasTS ? 'typescript' : 'babel';
  return format(source, {
    parser,
    plugins,
    tabWidth: 2,
    useTabs: false,
    semi: true,
    singleQuote: true,
    trailingComma: 'all',
    printWidth: 80,
    arrowParens: 'always',
    bracketSpacing: true,
  });
}

// ===== Editor key handlers (auto-indent + bracket auto-close) =====
const BRACKET_PAIRS: Record<string, string> = {
  '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`',
};
const CLOSERS = new Set([')', ']', '}', '"', "'", '`']);
import {
  Template,
  TemplateCategory,
  TemplateLang,
  Pattern,
  Difficulty,
  ALL_PATTERNS,
  PATTERN_GROUPS,
  templateCategories,
  allTemplates,
  blankStarters,
} from './playgroundTemplates';
import { OutputPanel, OutputEntry } from './OutputPanel';
import { playgroundSolutionKeys } from './playgroundSolutionKeys';
import { usePlaygroundProgress } from '../hooks/usePlaygroundProgress';
import ExplanationModal from './ExplanationModal';
import Toast from './Toast';
import type { Explanation } from './playgroundExplanations';
import { playgroundExplanationKeys } from './playgroundExplanationKeys';

// Explanation module shares the same lazy-cache pattern as solutions —
// the data itself is small now but will grow as more challenges get
// step-by-step explanations.
let explanationsCache: Record<string, Explanation> | null = null;
async function loadExplanations(): Promise<Record<string, Explanation>> {
  if (explanationsCache) return explanationsCache;
  const mod = await import('./playgroundExplanations');
  explanationsCache = mod.playgroundExplanations;
  return explanationsCache;
}

// Solutions module is dynamically imported on first "Show Solution" click —
// keeps ~50 KB of solution-body strings out of the playground's initial chunk.
// Cached after first load so subsequent toggles are instant.
let solutionsCache: Record<string, string> | null = null;
async function loadSolutions(): Promise<Record<string, string>> {
  if (solutionsCache) return solutionsCache;
  const mod = await import('./playgroundSolutions');
  solutionsCache = mod.playgroundSolutions;
  return solutionsCache;
}

// ==================== Helpers ====================

function formatValue(val: any): string {
  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (typeof val === 'string') return val;
  if (typeof val === 'function') return `[Function: ${val.name || 'anonymous'}]`;
  if (val instanceof Error) return `${val.name}: ${val.message}`;
  try {
    return JSON.stringify(val, null, 2);
  } catch {
    return String(val);
  }
}

function detectJSX(code: string): boolean {
  // Explicit render call or capitalized component tag.
  if (/render\s*\(/.test(code)) return true;
  if (/<[A-Z][A-Za-z0-9]*/.test(code)) return true;
  // Function returning a JSX tag (lowercase HTML or uppercase component).
  if (/return\s*\(?\s*<[a-zA-Z]/.test(code)) return true;
  // React hook usage strongly implies a React component.
  if (/\b(useState|useEffect|useRef|useMemo|useCallback|useReducer|useContext|useLayoutEffect)\s*\(/.test(code)) return true;
  return false;
}

let babelModule: any = null;
async function transpileSource(code: string, opts: { jsx: boolean; ts: boolean }): Promise<string> {
  if (!babelModule) {
    babelModule = await import('@babel/standalone');
  }
  const presets: (string | [string, object])[] = [];
  if (opts.ts) {
    // typescript preset strips type annotations; isTSX must match jsx flag
    presets.push(['typescript', { isTSX: opts.jsx, allExtensions: true }]);
  }
  if (opts.jsx) presets.push('react');
  const result = babelModule.transform(code, {
    presets,
    filename: opts.ts ? (opts.jsx ? 'playground.tsx' : 'playground.ts') : 'playground.jsx',
  });
  return result.code;
}

// TS-syntax detection — used when the loaded template has no explicit lang
// (e.g., user pasted TS code into a JS-marked template).
function detectTS(code: string): boolean {
  return /\binterface\s+[A-Z]/.test(code) ||
         /:\s*(string|number|boolean|any|unknown|void|never|object|Array|Record|Map|Set|Promise)\b/.test(code) ||
         /\bas\s+(string|number|boolean|const|unknown)\b/.test(code) ||
         /<[A-Za-z][\w]*\s*,\s*[A-Za-z]/.test(code);   // generics like Map<string, X>
}

// ==================== Component ====================

export default function CodePlayground() {
  const initialCode: string = sessionStorage.getItem('playground-code') || allTemplates[0].code;

  const [code, setCode] = useState<string>(initialCode);
  const [output, setOutput] = useState<OutputEntry[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [hasPreview, setHasPreview] = useState<boolean>(false);
  const [selectedName, setSelectedName] = useState<string | null>(sessionStorage.getItem('playground-code') ? null : 'Hello World');
  const [showingSolution, setShowingSolution] = useState<boolean>(false);
  const [drawerSearch, setDrawerSearch] = useState<string>('');
  const [drawerFilter, setDrawerFilter] = useState<string>('all');
  // Pattern filter — only relevant in 'challenges' modal mode. 'all' shows everything.
  const [patternFilter, setPatternFilter] = useState<Pattern | 'all'>('all');
  // Difficulty filter — only relevant in 'challenges' modal mode.
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  // Modal mode: separates teaching templates from problems-to-solve from blank starters
  const [modalMode, setModalMode] = useState<'templates' | 'challenges' | 'blank'>('templates');
  // Current source language — drives transpiler preset selection.
  // Defaults to 'js'; loading a JSX template flips to 'jsx', etc.
  const [currentLang, setCurrentLang] = useState<TemplateLang>(
    allTemplates[0]?.jsx ? 'jsx' : (allTemplates[0]?.lang ?? 'js')
  );
  const previewRef = useRef<HTMLDivElement>(null);
  const reactRootRef = useRef<any>(null);
  const drawerSearchRef = useRef<HTMLInputElement>(null);
  const logsRef = useRef<OutputEntry[]>([]);
  const flushTimerRef = useRef<number | null>(null);
  const splitContainerRef = useRef<HTMLDivElement>(null);
  // Editor pane width as a percentage (md+ only). Persists across reloads so
  // the user's chosen split survives. Clamped 20–80% on read and on drag.
  const [editorPct, setEditorPct] = useState<number>(() => {
    const stored = parseFloat(localStorage.getItem('playground-split-pct') || '');
    return Number.isFinite(stored) && stored >= 20 && stored <= 80 ? stored : 50;
  });
  const [isResizing, setIsResizing] = useState<boolean>(false);
  // Caret position in the editor textarea — drives matching-bracket highlight.
  // -1 = editor not focused (no match shown).
  const [caretPos, setCaretPos] = useState<number>(-1);
  // ===== Save-progress state =====
  const progressHook = usePlaygroundProgress();
  const { getEntry, saveEntry, markSolved, clearEntry, setLastSession,
          solvedCount, lastSessionName } = progressHook;
  const [notes, setNotes] = useState<string>('');
  const [notesOpen, setNotesOpen] = useState<boolean>(false);
  // Run-result summary pill: counts of ✅/❌ from last execution.
  const [runSummary, setRunSummary] = useState<{ pass: number; fail: number } | null>(null);
  // Resume pill is dismissed only for the current page-view session.
  const [resumeDismissed, setResumeDismissed] = useState<boolean>(false);
  // Word-wrap in editor — default ON, persists.
  const [wrapOn, setWrapOn] = useState<boolean>(() =>
    (typeof window !== 'undefined' && localStorage.getItem('playground-wrap')) !== '0'
  );
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const isJSX: boolean = detectJSX(code) || currentLang === 'jsx' || currentLang === 'tsx';
  // Pick a highlight.js grammar based on the editor's current language.
  const hljsLang: string = (currentLang === 'ts' || currentLang === 'tsx') ? 'typescript' : 'javascript';
  // Friendly label shown in the editor's chrome.
  const langLabel: string =
    currentLang === 'tsx' ? 'React TSX' :
    currentLang === 'ts'  ? 'TypeScript' :
    currentLang === 'jsx' ? 'React JSX'  :
    isJSX                 ? 'React JSX'  : 'JavaScript';

  // Total number of JS coding challenges — drives the "X / Y solved" header chip.
  const totalJsChallenges: number = useMemo(
    () => allTemplates.filter(t => t.kind === 'challenge' && t.tag === 'JS').length,
    [],
  );

  // Unique tags for filter pills
  const tagOptions: string[] = useMemo(() => {
    const tags = [...new Set(templateCategories.map(c => c.tag))];
    return ['all', ...tags.map(t => t.toLowerCase())];
  }, []);

  // Filtered templates — also filtered by the top-level mode toggle.
  const filteredCategories: TemplateCategory[] = useMemo(() => {
    const wantedKind = modalMode === 'challenges' ? 'challenge' : 'template';
    return templateCategories
      .filter(cat => (cat.kind ?? 'template') === wantedKind)
      .filter(cat => drawerFilter === 'all' || cat.tag.toLowerCase() === drawerFilter)
      .map(cat => ({
        ...cat,
        templates: cat.templates.filter(t => {
          if (!t.name.toLowerCase().includes(drawerSearch.toLowerCase())) return false;
          if (patternFilter !== 'all' && (!t.patterns || !t.patterns.includes(patternFilter))) return false;
          if (difficultyFilter !== 'all' && t.difficulty !== difficultyFilter) return false;
          return true;
        })
      }))
      .filter(cat => cat.templates.length > 0);
  }, [drawerSearch, drawerFilter, modalMode, patternFilter, difficultyFilter]);

  // Per-difficulty challenge counts for the filter chips.
  const difficultyCounts: Record<Difficulty, number> = useMemo(() => {
    const counts: Record<Difficulty, number> = { Easy: 0, Medium: 0, Hard: 0 };
    for (const t of allTemplates) {
      if (t.kind !== 'challenge' || !t.difficulty) continue;
      counts[t.difficulty]++;
    }
    return counts;
  }, []);

  // Per-pattern challenge counts for the filter chips.
  const patternCounts: Record<Pattern, number> = useMemo(() => {
    const counts = Object.fromEntries(ALL_PATTERNS.map(p => [p, 0])) as Record<Pattern, number>;
    for (const t of allTemplates) {
      if (t.kind !== 'challenge' || !t.patterns) continue;
      for (const p of t.patterns) counts[p] = (counts[p] || 0) + 1;
    }
    return counts;
  }, []);

  // Clear sessionStorage code after loading. This is the "Try it" handoff
  // bootstrap from study guides — single-shot, then cleared so a refresh
  // does not re-seed it.
  useEffect(() => {
    sessionStorage.removeItem('playground-code');
  }, []);

  // On first mount, if the selected template (default 'Hello World' or a
  // resumed session) has saved progress, restore it. Runs ONCE — subsequent
  // template loads go through handleTemplate.
  useEffect(() => {
    if (!selectedName) return;
    const saved = getEntry(selectedName);
    if (saved && saved.code && saved.code !== code) {
      setCode(saved.code);
      setNotes(saved.notes ?? '');
      // Don't toast on first mount — too startling. The badge in the
      // templates modal is the visual cue.
    } else if (saved?.notes) {
      setNotes(saved.notes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save edits — debounced 800ms. Skips when no template is selected
  // (e.g., a fresh blank scratchpad) and when showing a solution (the user
  // explicitly opted into the canonical answer; saving that as their
  // "progress" would feel deceptive).
  useEffect(() => {
    if (!selectedName) return;
    if (showingSolution) return;
    const handle = window.setTimeout(() => {
      saveEntry(selectedName, { code, notes });
    }, 800);
    return () => window.clearTimeout(handle);
  }, [code, notes, selectedName, showingSolution, saveEntry]);

  // Persist split percentage on change.
  useEffect(() => {
    localStorage.setItem('playground-split-pct', String(editorPct));
  }, [editorPct]);

  // Persist wrap preference.
  useEffect(() => {
    localStorage.setItem('playground-wrap', wrapOn ? '1' : '0');
  }, [wrapOn]);

  // Drag handler for the editor↔output splitter. Wires window-level mouse
  // listeners (so the drag keeps working even when the cursor leaves the bar).
  // Touch is supported via the same handler — `clientX` is read from both.
  const handleSplitterDown = useCallback((e: React.MouseEvent | React.TouchEvent): void => {
    e.preventDefault();
    const container = splitContainerRef.current;
    if (!container) return;
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMove = (clientX: number): void => {
      const rect = container.getBoundingClientRect();
      const pct = ((clientX - rect.left) / rect.width) * 100;
      setEditorPct(Math.max(20, Math.min(80, pct)));
    };
    const onMouseMove = (ev: MouseEvent): void => onMove(ev.clientX);
    const onTouchMove = (ev: TouchEvent): void => {
      if (ev.touches.length) onMove(ev.touches[0].clientX);
    };
    const cleanup = (): void => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', cleanup);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', cleanup);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      setIsResizing(false);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', cleanup);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', cleanup);
  }, []);

  // Track caret position in the editor textarea so we can highlight the
  // matching bracket on the cursor. We listen to `selectionchange` globally
  // (the only event that fires for caret moves without a value change) and
  // sync state only while our textarea is focused.
  useEffect(() => {
    const handler = () => {
      const ta = document.getElementById('playground-editor') as HTMLTextAreaElement | null;
      if (!ta) return;
      if (document.activeElement === ta) {
        setCaretPos(ta.selectionStart ?? -1);
      } else {
        setCaretPos(-1);
      }
    };
    document.addEventListener('selectionchange', handler);
    return () => document.removeEventListener('selectionchange', handler);
  }, []);

  // Patch console once on mount; restore on unmount. Logs are captured into a
  // ref so async output (from setInterval, effects, etc.) keeps flowing after
  // the initial run finishes. A flush interval reconciles the ref into state
  // while the React preview is mounted.
  useEffect(() => {
    const origLog = console.log;
    const origWarn = console.warn;
    const origError = console.error;

    const push = (entry: OutputEntry) => {
      logsRef.current = [...logsRef.current, entry];
    };
    console.log = (...args: any[]) => { push({ type: 'log', text: args.map(formatValue).join(' ') }); };
    console.warn = (...args: any[]) => { push({ type: 'warn', text: args.map(formatValue).join(' ') }); };
    console.error = (...args: any[]) => { push({ type: 'error', text: args.map(formatValue).join(' ') }); };

    return () => {
      console.log = origLog;
      console.warn = origWarn;
      console.error = origError;
      if (flushTimerRef.current !== null) {
        window.clearInterval(flushTimerRef.current);
        flushTimerRef.current = null;
      }
      if (reactRootRef.current) {
        try { reactRootRef.current.unmount(); } catch { /* ignore */ }
        reactRootRef.current = null;
      }
    };
  }, []);

  const runCode = useCallback(async () => {
    setIsRunning(true);
    logsRef.current = [];
    setOutput([]);

    // Unmount previous React render
    if (reactRootRef.current) {
      try { reactRootRef.current.unmount(); } catch { /* ignore */ }
      reactRootRef.current = null;
    }
    setHasPreview(false);

    // Stop any prior flush interval
    if (flushTimerRef.current !== null) {
      window.clearInterval(flushTimerRef.current);
      flushTimerRef.current = null;
    }

    let previewMounted = false;

    try {
      let execCode: string = code;
      const needsJSX: boolean = detectJSX(code) || currentLang === 'jsx' || currentLang === 'tsx';
      const needsTS: boolean = currentLang === 'ts' || currentLang === 'tsx' || detectTS(code);

      // Auto-append a top-level render(<Component />) when JSX is detected
      // but the user hasn't explicitly called render. Class components are
      // the common case: `class X extends React.Component { render() { ... } }`
      // where the inner `render()` is a method, NOT a call to the runner's
      // render function. Use a stricter pattern to avoid that false match:
      // we want `render(<...` (call with JSX argument) at the start of a
      // line / after a semicolon, not a method declaration `render() {`.
      let sourceToTranspile = code;
      if (needsJSX) {
        const hasRenderCall =
          /(?:^|\n|;)\s*render\s*\(\s*</.test(sourceToTranspile) ||
          /ReactDOM\.(render|createRoot)/.test(sourceToTranspile);
        if (!hasRenderCall) {
          // Find a likely component to render: class > function > const
          const match =
            sourceToTranspile.match(/class\s+([A-Z][A-Za-z0-9_]*)\s+extends/) ||
            sourceToTranspile.match(/function\s+([A-Z][A-Za-z0-9_]*)\s*\(/) ||
            sourceToTranspile.match(/(?:const|let|var)\s+([A-Z][A-Za-z0-9_]*)\s*=/);
          if (match) {
            sourceToTranspile = `${sourceToTranspile.replace(/\s+$/, '')}\n\nrender(<${match[1]} />);`;
          }
        }
      }

      if (needsJSX || needsTS) {
        execCode = await transpileSource(sourceToTranspile, { jsx: needsJSX, ts: needsTS });
      } else {
        execCode = sourceToTranspile;
      }

      if (needsJSX) {
        // Inject React scope and render function
        const renderFn = (element: React.ReactElement) => {
          if (previewRef.current) {
            if (reactRootRef.current) {
              try { reactRootRef.current.unmount(); } catch { /* ignore */ }
            }
            reactRootRef.current = ReactDOM.createRoot(previewRef.current);
            reactRootRef.current.render(element);
            setHasPreview(true);
            previewMounted = true;
          }
        };

        const scope: Record<string, any> = {
          React,
          useState: React.useState,
          useEffect: React.useEffect,
          useRef: React.useRef,
          useMemo: React.useMemo,
          useCallback: React.useCallback,
          useReducer: React.useReducer,
          useContext: React.useContext,
          createContext: React.createContext,
          memo: React.memo,
          Fragment: React.Fragment,
          render: renderFn,
        };

        const scopeKeys: string[] = Object.keys(scope);
        const scopeValues: any[] = Object.values(scope);
        const fn = new Function(...scopeKeys, execCode);
        fn(...scopeValues);

        if (!previewMounted) {
          logsRef.current = [...logsRef.current, {
            type: 'error',
            text: 'No render() call detected. For React components, end your code with: render(<YourComponent />);',
          }];
        }
      } else {
        // Plain JS execution
        const result = new Function(execCode)();
        if (result !== undefined) {
          logsRef.current = [...logsRef.current, { type: 'result', text: `\u2192 ${formatValue(result)}` }];
        }
      }
    } catch (err: any) {
      logsRef.current = [...logsRef.current, { type: 'error', text: `${err.name}: ${err.message}` }];
    } finally {
      setIsRunning(false);
    }

    setOutput([...logsRef.current]);

    // Tally test pass/fail markers emitted by the test() helpers in the
    // challenge templates. We scan the just-captured logs for ✅ and ❌ so we
    // can show a summary pill and auto-flip status to 'solved' when all pass.
    const passCount = logsRef.current.filter(e => e.text.includes('✅')).length;
    const failCount = logsRef.current.filter(e => e.text.includes('❌')).length;
    if (passCount + failCount > 0) {
      setRunSummary({ pass: passCount, fail: failCount });
      // Auto-solve only on JS Coding Challenges — React Machine Coding has
      // no test() helper output to interpret as pass/fail.
      if (failCount === 0 && selectedName && currentTemplate?.kind === 'challenge' && currentTemplate?.tag === 'JS') {
        markSolved(selectedName);
      }
    } else {
      setRunSummary(null);
    }

    // Keep flushing while a React preview is live (captures async logs from
    // intervals, effects, event handlers). Short one-shot flush for plain JS
    // to catch promise resolutions.
    if (previewMounted) {
      flushTimerRef.current = window.setInterval(() => {
        setOutput((prev) => (prev.length !== logsRef.current.length ? [...logsRef.current] : prev));
      }, 250);
    } else {
      window.setTimeout(() => setOutput([...logsRef.current]), 600);
    }
  }, [code, currentLang, selectedName, markSolved]);

  // Cmd+Enter to run, Escape to close drawer
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        runCode();
      }
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [runCode, isDrawerOpen]);

  const stopFlush = useCallback((): void => {
    if (flushTimerRef.current !== null) {
      window.clearInterval(flushTimerRef.current);
      flushTimerRef.current = null;
    }
  }, []);

  const handleTemplate = useCallback((template: Template): void => {
    stopFlush();
    if (reactRootRef.current) {
      try { reactRootRef.current.unmount(); } catch { /* ignore */ }
      reactRootRef.current = null;
    }
    logsRef.current = [];
    // Restore saved progress when present and different from the stub.
    const saved = getEntry(template.name);
    const restored = saved && saved.code && saved.code !== template.code;
    setCode(restored ? saved.code : template.code);
    setNotes(saved?.notes ?? '');
    if (restored) setToastMsg(`Resumed your saved work in "${template.name}"`);
    // Decide language: explicit lang wins; legacy jsx flag → 'jsx'; else 'js'.
    setCurrentLang(template.lang ?? (template.jsx ? 'jsx' : 'js'));
    setOutput([]);
    setHasPreview(false);
    setSelectedName(template.name);
    setShowingSolution(false);
    setIsDrawerOpen(false);
    setDrawerSearch('');
    setRunSummary(null);
    setLastSession(template.name);
  }, [stopFlush, getEntry, setLastSession]);

  // Load a Blank starter (JS / TS / React) — named so the toolbar reflects it
  const handleBlankStarter = useCallback((starter: { name: string; lang: TemplateLang; code: string }): void => {
    handleTemplate({ name: `Blank ${starter.name}`, code: starter.code, lang: starter.lang });
  }, [handleTemplate]);

  // Look up the original challenge code by template name
  const currentTemplate = useMemo(
    () => selectedName ? allTemplates.find(t => t.name === selectedName) ?? null : null,
    [selectedName],
  );
  // Synchronous check via the keys manifest (~1 KB) — avoids loading the
  // ~50 KB solutions chunk just to decide whether to render the button.
  const hasSolution: boolean = !!(selectedName && playgroundSolutionKeys.has(selectedName));
  const hasExplanation: boolean = !!(selectedName && playgroundExplanationKeys.has(selectedName));

  const [isLoadingSolution, setIsLoadingSolution] = useState<boolean>(false);
  const [isLoadingExplain, setIsLoadingExplain] = useState<boolean>(false);
  const [explainOpen, setExplainOpen] = useState<boolean>(false);
  const [explanationData, setExplanationData] = useState<Explanation | null>(null);
  const [isFormatting, setIsFormatting] = useState<boolean>(false);
  // Bracket auto-close (typing '(' inserts '()' with caret in middle).
  // Persisted across sessions so the user's preference sticks.
  const [bracketAutoClose, setBracketAutoClose] = useState<boolean>(() =>
    (typeof window !== 'undefined' && localStorage.getItem('playground-bracket-autoclose')) !== '0'
  );

  const toggleSolution = useCallback(async (): Promise<void> => {
    if (!currentTemplate || !hasSolution) return;
    if (showingSolution) {
      // Switch back: prefer the user's auto-saved draft over the bare stub
      // so we never silently throw away their work.
      const saved = getEntry(currentTemplate.name);
      setCode(saved?.code ?? currentTemplate.code);
      setShowingSolution(false);
      return;
    }
    // No confirm needed — auto-save preserves the draft. The auto-save
    // effect skips writes while showingSolution=true, so the solution body
    // we load below never overwrites the saved draft.
    setIsLoadingSolution(true);
    try {
      const solutions = await loadSolutions();
      const body = solutions[selectedName!];
      if (body) {
        setCode(body);
        setShowingSolution(true);
      }
    } finally {
      setIsLoadingSolution(false);
    }
  }, [currentTemplate, hasSolution, showingSolution, selectedName, getEntry]);

  const openExplain = useCallback(async (): Promise<void> => {
    if (!hasExplanation || !selectedName) return;
    setIsLoadingExplain(true);
    try {
      const all = await loadExplanations();
      const data = all[selectedName] || null;
      setExplanationData(data);
      if (data) setExplainOpen(true);
    } finally {
      setIsLoadingExplain(false);
    }
  }, [hasExplanation, selectedName]);

  // Format the editor's code via Prettier (lazy-loaded). On parse error,
  // surface the message in the console area but DON'T overwrite the code.
  const handleFormat = useCallback(async (): Promise<void> => {
    if (isFormatting) return;
    setIsFormatting(true);
    try {
      const formatted = await formatCode(code, currentLang);
      // Prettier appends a trailing newline; trim it to keep diffs minimal
      // when comparing with the original code.
      const trimmed = formatted.replace(/\n$/, '');
      if (trimmed !== code) {
        setCode(trimmed);
        logsRef.current = [...logsRef.current, { type: 'log', text: 'Formatted with Prettier.' }];
        setOutput([...logsRef.current]);
      }
    } catch (err: any) {
      logsRef.current = [
        ...logsRef.current,
        { type: 'error', text: `Couldn't format: ${err?.message ?? String(err)}` },
      ];
      setOutput([...logsRef.current]);
    } finally {
      setIsFormatting(false);
    }
  }, [code, currentLang, isFormatting]);

  // Toggle bracket auto-close + persist
  const toggleBracketAutoClose = useCallback((): void => {
    setBracketAutoClose((v) => {
      const next = !v;
      try { localStorage.setItem('playground-bracket-autoclose', next ? '1' : '0'); } catch { /* ignore */ }
      return next;
    });
  }, []);

  // Editor keydown — auto-indent on Enter + bracket auto-close.
  // We mutate the textarea's value via setCode + restore caret with
  // requestAnimationFrame so React commits before we set selection.
  const handleEditorKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    // Cmd/Ctrl+Shift+F → format
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'f' || e.key === 'F')) {
      e.preventDefault();
      handleFormat();
      return;
    }

    const ta = e.currentTarget;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = code.substring(0, start);
    const after = code.substring(end);
    const selected = code.substring(start, end);

    // ----- Auto-indent on Enter -----
    if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
      const lineStart = before.lastIndexOf('\n') + 1;
      const currentLine = before.substring(lineStart);
      const indent = currentLine.match(/^[ \t]*/)?.[0] ?? '';
      const trimmed = currentLine.trimEnd();
      const opensBlock =
        trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(') || trimmed.endsWith('=>');
      const extra = opensBlock ? '  ' : '';

      // Special case: brace straddle ({|}) — produce 3 lines with caret in the middle
      const braceStraddle = trimmed.endsWith('{') && after.startsWith('}');
      const bracketStraddle = trimmed.endsWith('[') && after.startsWith(']');
      const parenStraddle = trimmed.endsWith('(') && after.startsWith(')');
      const straddle = braceStraddle || bracketStraddle || parenStraddle;

      e.preventDefault();
      if (straddle) {
        const insertion = `\n${indent}  \n${indent}`;
        setCode(before + insertion + after);
        const caret = start + 1 + indent.length + 2;
        requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = caret; });
      } else {
        const insertion = `\n${indent}${extra}`;
        setCode(before + insertion + after);
        const caret = start + insertion.length;
        requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = caret; });
      }
      return;
    }

    if (!bracketAutoClose) return;

    // ----- Smart skip: typing the same closer that's already there -----
    if (CLOSERS.has(e.key) && code[start] === e.key && start === end) {
      e.preventDefault();
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 1; });
      return;
    }

    // ----- Bracket / quote auto-close -----
    if (BRACKET_PAIRS[e.key]) {
      const close = BRACKET_PAIRS[e.key];
      // For quotes, don't auto-close if the cursor is right next to a word
      // character — that's almost always a contraction or an apostrophe.
      if ((e.key === "'" || e.key === '"' || e.key === '`') && /\w/.test(code[start - 1] || '')) return;

      e.preventDefault();
      const newCode = before + e.key + selected + close + after;
      setCode(newCode);
      if (selected) {
        requestAnimationFrame(() => {
          ta.selectionStart = start + 1;
          ta.selectionEnd = end + 1;
        });
      } else {
        requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 1; });
      }
      return;
    }
  }, [code, bracketAutoClose, handleFormat]);

  const handleClear = useCallback((): void => {
    stopFlush();
    if (reactRootRef.current) {
      try { reactRootRef.current.unmount(); } catch { /* ignore */ }
      reactRootRef.current = null;
    }
    logsRef.current = [];
    setOutput([]);
    setHasPreview(false);
  }, [stopFlush]);

  const openDrawer = useCallback((): void => {
    setIsDrawerOpen(true);
    setDrawerSearch('');
    setDrawerFilter('all');
    setActiveCategory('all');
    setTimeout(() => drawerSearchRef.current?.focus(), 200);
  }, []);

  const closeDrawer = useCallback((): void => {
    setIsDrawerOpen(false);
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-screen relative">
      {/* Templates Modal -- 2-pane layout: categories on the left, snippets on the right */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
              onClick={closeDrawer}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="fixed inset-0 m-auto w-[min(960px,94vw)] h-[min(620px,88vh)] bg-white dark:bg-[#0f0f1a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-[90] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <BookOpen size={16} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base leading-tight">
                      {modalMode === 'templates' ? 'Templates' : modalMode === 'challenges' ? 'Coding Challenges' : 'Blank Starters'}
                    </h2>
                    <span className="text-[11px] text-slate-400">
                      {modalMode === 'blank'
                        ? 'Start fresh in JS, TS, or React'
                        : modalMode === 'challenges'
                          ? `${allTemplates.filter(t => t.kind === 'challenge').length} challenges to solve`
                          : `${allTemplates.filter(t => t.kind === 'template').length} reference snippets`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 w-[260px]">
                    <Search size={13} className="text-slate-400 shrink-0" />
                    <input
                      ref={drawerSearchRef}
                      value={drawerSearch}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDrawerSearch(e.target.value)}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Escape' && closeDrawer()}
                      placeholder="Search templates..."
                      className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400"
                    />
                    {drawerSearch && (
                      <button onClick={() => { setDrawerSearch(''); drawerSearchRef.current?.focus(); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        <X size={13} />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={closeDrawer}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Mode toggle: Templates / Challenges / Blank */}
              <div className="flex items-center gap-1 px-5 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/20">
                {([
                  { id: 'templates' as const,  label: 'Templates',   count: allTemplates.filter(t => t.kind === 'template').length },
                  { id: 'challenges' as const, label: 'Challenges',  count: allTemplates.filter(t => t.kind === 'challenge').length },
                  { id: 'blank' as const,      label: 'Blank',       count: blankStarters.length },
                ]).map(({ id, label, count }) => (
                  <button
                    key={id}
                    onClick={() => setModalMode(id)}
                    className={
                      'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ' +
                      (modalMode === id
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/60 dark:text-slate-400')
                    }
                  >
                    {label}
                    <span className={
                      'text-[10px] px-1.5 py-0.5 rounded-md ' +
                      (modalMode === id
                        ? 'bg-indigo-100 dark:bg-indigo-900/60'
                        : 'bg-slate-100 dark:bg-slate-800')
                    }>
                      {count}
                    </span>
                  </button>
                ))}
                {modalMode === 'challenges' && (
                  <button
                    onClick={() => {
                      const candidates = allTemplates.filter(t =>
                        t.kind === 'challenge' && t.tag === 'JS' && getEntry(t.name)?.status !== 'solved'
                      );
                      if (candidates.length === 0) {
                        setToastMsg('All challenges solved 🎉');
                        return;
                      }
                      const pick = candidates[Math.floor(Math.random() * candidates.length)];
                      handleTemplate(pick);
                    }}
                    className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                    title="Open a random unsolved challenge"
                  >
                    <Shuffle size={12} />
                    Random
                  </button>
                )}
              </div>


              {/* Body — Blank mode shows starter cards; otherwise the 2-pane layout */}
              {modalMode === 'blank' ? (
                <div className="flex-1 overflow-auto p-8 bg-slate-50/40 dark:bg-slate-900/20">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xl">
                    Pick a language and start with a tiny scaffold — no template content. Run, edit, experiment.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {blankStarters.map((starter) => {
                      const isReact = starter.lang === 'jsx' || starter.lang === 'tsx';
                      return (
                        <button
                          key={starter.name}
                          onClick={() => handleBlankStarter(starter)}
                          className="group text-left p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className={
                              'text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ' +
                              (isReact
                                ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                                : starter.lang === 'ts'
                                  ? 'bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300'
                                  : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300')
                            }>
                              {starter.lang.toUpperCase()}
                            </span>
                            <span className="font-semibold text-base">{starter.name}</span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{starter.description}</p>
                          <div className="mt-3 inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Start <ChevronRight size={11} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
              <div className="flex-1 flex min-h-0">
                {/* Category Nav */}
                <div className="w-[220px] shrink-0 border-r border-slate-100 dark:border-slate-800 py-3 overflow-y-auto sidebar-scroll bg-slate-50/60 dark:bg-slate-900/40">
                  {/* Tag pills at top of category list — counts respect the
                      current modal mode (templates vs challenges) so they
                      reflect what the user is actually browsing. */}
                  <div className="px-3 pb-3 flex gap-1.5 flex-wrap">
                    {tagOptions.map((tag: string) => {
                      const wantedKind = modalMode === 'challenges' ? 'challenge' : 'template';
                      const inMode = allTemplates.filter(t => (t.kind ?? 'template') === wantedKind);
                      const count: number = tag === 'all' ? inMode.length : inMode.filter(t => t.tag.toLowerCase() === tag).length;
                      return (
                        <button
                          key={tag}
                          onClick={() => setDrawerFilter(tag)}
                          className={[
                            "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all capitalize flex items-center gap-1",
                            drawerFilter === tag
                              ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
                              : "bg-white dark:bg-slate-800/70 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                          ].join(' ')}
                        >
                          {tag === 'all' ? 'All' : tag}
                          <span className="text-[9px] opacity-60">{count}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="px-2">
                    {/* In challenges mode, the sidebar lists PATTERNS grouped
                        by super-category. In templates/blank mode, it lists
                        CATEGORIES (the original behavior). */}
                    {modalMode === 'challenges' ? (
                      <>
                        <button
                          onClick={() => setPatternFilter('all')}
                          className={[
                            "w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors flex items-center justify-between",
                            patternFilter === 'all'
                              ? "bg-indigo-100/70 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium"
                              : "text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/60"
                          ].join(' ')}
                        >
                          <span className="flex items-center gap-2">
                            {patternFilter === 'all' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                            <span>All patterns</span>
                          </span>
                          <span className="text-[10px] text-slate-400">{
                            // Total challenges in the current view (after drawerFilter+search)
                            // ignoring patternFilter — the count when "All" is selected.
                            allTemplates.filter(t => {
                              if (t.kind !== 'challenge') return false;
                              if (drawerFilter !== 'all' && t.tag.toLowerCase() !== drawerFilter) return false;
                              if (drawerSearch && !t.name.toLowerCase().includes(drawerSearch.toLowerCase())) return false;
                              return true;
                            }).length
                          }</span>
                        </button>
                        {PATTERN_GROUPS.map(group => {
                          const visible = group.patterns.filter(p => patternCounts[p] > 0);
                          if (visible.length === 0) return null;
                          return (
                            <div key={group.label} className="mt-3">
                              <div className="px-3 mb-1 text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
                                {group.label}
                              </div>
                              {visible.map(p => {
                                const isActive = patternFilter === p;
                                return (
                                  <button
                                    key={p}
                                    onClick={() => setPatternFilter(isActive ? 'all' : p)}
                                    className={[
                                      "w-full text-left px-3 py-1.5 mt-0.5 rounded-lg text-[12.5px] transition-colors flex items-center justify-between gap-2",
                                      isActive
                                        ? "bg-indigo-100/70 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/60"
                                    ].join(' ')}
                                    title={`${patternCounts[p]} challenge${patternCounts[p] === 1 ? '' : 's'} use this pattern`}
                                  >
                                    <span className="truncate flex items-center gap-2">
                                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />}
                                      {p}
                                    </span>
                                    <span className="text-[10px] text-slate-400 shrink-0">{patternCounts[p]}</span>
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setActiveCategory('all')}
                          className={[
                            "w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors flex items-center justify-between",
                            activeCategory === 'all'
                              ? "bg-indigo-100/70 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium"
                              : "text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/60"
                          ].join(' ')}
                        >
                          <span>All categories</span>
                          <span className="text-[10px] text-slate-400">{filteredCategories.reduce((n, c) => n + c.templates.length, 0)}</span>
                        </button>
                        {filteredCategories.map((cat: TemplateCategory) => {
                          const isActive = activeCategory === cat.label;
                          return (
                            <button
                              key={cat.label}
                              onClick={() => setActiveCategory(cat.label)}
                              className={[
                                "w-full text-left px-3 py-2 mt-0.5 rounded-lg text-[13px] transition-colors flex items-center justify-between gap-2",
                                isActive
                                  ? "bg-indigo-100/70 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium"
                                  : "text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/60"
                              ].join(' ')}
                            >
                              <span className="flex items-center gap-2 min-w-0">
                                <span className={[
                                  "text-[9px] px-1.5 py-0.5 rounded-full font-semibold shrink-0",
                                  cat.tag === 'React' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                                    cat.tag === 'Polyfills' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                                      'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                ].join(' ')}>
                                  {cat.tag}
                                </span>
                                <span className="truncate">{cat.label}</span>
                              </span>
                              <span className="text-[10px] text-slate-400 shrink-0">{cat.templates.length}</span>
                            </button>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>

                {/* Templates Grid */}
                <div className="flex-1 overflow-y-auto sidebar-scroll p-4">
                  {/* Mobile-only search */}
                  <div className="sm:hidden mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <Search size={13} className="text-slate-400 shrink-0" />
                    <input
                      value={drawerSearch}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDrawerSearch(e.target.value)}
                      placeholder="Search templates..."
                      className="flex-1 bg-transparent outline-none text-sm"
                    />
                  </div>

                  {/* Difficulty filter chips — only in challenges mode. */}
                  {modalMode === 'challenges' && (
                    <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Difficulty:</span>
                      {(['all', 'Easy', 'Medium', 'Hard'] as const).map(d => {
                        const isActive = difficultyFilter === d;
                        const count = d === 'all'
                          ? difficultyCounts.Easy + difficultyCounts.Medium + difficultyCounts.Hard
                          : difficultyCounts[d];
                        const tone = d === 'Easy'
                          ? (isActive ? 'bg-emerald-600 text-white' : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40')
                          : d === 'Medium'
                          ? (isActive ? 'bg-amber-600 text-white' : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40')
                          : d === 'Hard'
                          ? (isActive ? 'bg-red-600 text-white' : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40')
                          : (isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700');
                        return (
                          <button
                            key={d}
                            onClick={() => setDifficultyFilter(isActive && d !== 'all' ? 'all' : d)}
                            className={
                              'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ' + tone
                            }
                          >
                            {d === 'all' ? 'All' : d}
                            <span className={'text-[9px] px-1 rounded ' + (isActive ? 'bg-white/20' : 'bg-white/40 dark:bg-slate-900/40')}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {filteredCategories.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-12 text-slate-400">
                      <Search size={32} className="mb-3 opacity-40" />
                      <p className="text-sm font-medium">No templates found</p>
                      <p className="text-xs mt-1">Try a different search or filter</p>
                    </div>
                  ) : (
                    (activeCategory === 'all' ? filteredCategories : filteredCategories.filter(c => c.label === activeCategory)).map((cat: TemplateCategory) => (
                      <div key={cat.label} className="mb-5 last:mb-0">
                        <div className="flex items-center gap-2 mb-2.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            {cat.label}
                          </span>
                          <span className={[
                            "text-[9px] px-1.5 py-0.5 rounded-full font-semibold",
                            cat.tag === 'React' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                              cat.tag === 'Polyfills' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                                'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                          ].join(' ')}>
                            {cat.tag}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {cat.templates.map((t: Template) => {
                            const isActive: boolean = selectedName === t.name;
                            const entry = getEntry(t.name);
                            const dotCls = entry?.status === 'solved'
                              ? 'bg-emerald-500'
                              : entry
                              ? 'bg-amber-400'
                              : '';
                            return (
                              <button
                                key={t.name}
                                onClick={() => handleTemplate(t)}
                                className={[
                                  "text-left px-3 py-2.5 rounded-xl text-[13px] transition-all flex items-center gap-2 group border",
                                  isActive
                                    ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-medium shadow-sm"
                                    : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-slate-700 dark:text-slate-300"
                                ].join(' ')}
                                title={
                                  entry?.status === 'solved' ? 'Solved'
                                  : entry ? 'In progress'
                                  : undefined
                                }
                              >
                                {dotCls && <span className={`w-2 h-2 rounded-full shrink-0 ${dotCls}`} aria-hidden />}
                                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                  <span className="truncate">{t.name}</span>
                                  {(t.patterns?.length || t.difficulty) && (
                                    <div className="flex flex-wrap gap-0.5 items-center">
                                      {t.difficulty && (
                                        <span
                                          className={
                                            'text-[9px] px-1 py-0 rounded font-semibold leading-tight ' +
                                            (t.difficulty === 'Easy'
                                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                              : t.difficulty === 'Medium'
                                              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400')
                                          }
                                          title={`Difficulty: ${t.difficulty}`}
                                        >
                                          {t.difficulty}
                                        </span>
                                      )}
                                      {t.patterns?.map(p => (
                                        <span
                                          key={p}
                                          className="text-[9px] px-1 py-0 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 leading-tight"
                                          title={`Pattern: ${p}`}
                                        >
                                          {p}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                {t.jsx && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 shrink-0">
                                    JSX
                                  </span>
                                )}
                                <ChevronRight size={12} className="text-slate-300 dark:text-slate-700 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors shrink-0" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              )}

              {/* Modal Footer */}
              <div className="px-5 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                <p className="text-[11px] text-slate-400">
                  {modalMode === 'blank'
                    ? `${blankStarters.length} starters`
                    : `${filteredCategories.reduce((n, c) => n + c.templates.length, 0)} matching`}
                </p>
                <p className="text-[11px] text-slate-400">
                  Press <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono mx-0.5">Esc</kbd> to close
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header -- always dark like an IDE */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d333b] bg-[#1c2028] shrink-0 text-slate-200">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => window.dispatchEvent(new Event('prephub:show-sidebar'))}
            className="text-slate-400 hover:text-white transition-colors shrink-0 hidden md:flex p-1.5 rounded-lg hover:bg-[#2d333b]"
            title="Show sidebar"
          >
            <PanelLeftOpen size={16} />
          </button>
          <Link to="/" className="text-slate-400 hover:text-white transition-colors shrink-0" title="Back to home">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-lg font-bold shrink-0 text-white">Playground</h1>
          {selectedName && (
            <span className="text-sm text-slate-500 font-normal truncate hidden sm:inline">
              — {selectedName}
            </span>
          )}
          {isJSX && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-400 font-semibold shrink-0">
              React
            </span>
          )}
          <span
            className="ml-auto md:ml-3 text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/30 text-emerald-400 font-medium shrink-0 hidden sm:inline"
            title="JS coding challenges where every test (✅) passed. React Machine Coding has no test runner, so it's not counted here."
          >
            {solvedCount} / {totalJsChallenges} JS solved
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={openDrawer}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm border border-[#3d444d] text-slate-300 hover:bg-[#2d333b] hover:text-white transition-colors"
          >
            <BookOpen size={14} /> Templates
          </button>

          {hasExplanation && (
            <button
              onClick={openExplain}
              disabled={isLoadingExplain}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm border border-indigo-500/50 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200 transition-colors disabled:opacity-60"
              title="Step-by-step explanation with visual walkthrough"
            >
              {isLoadingExplain
                ? <Loader2 size={14} className="animate-spin" />
                : <Sparkles size={14} />}
              Explain
            </button>
          )}

          {hasSolution && (
            <button
              onClick={toggleSolution}
              disabled={isLoadingSolution}
              className={
                'flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-colors disabled:opacity-60 ' +
                (showingSolution
                  ? 'border-amber-500 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                  : 'border-[#3d444d] text-slate-300 hover:bg-[#2d333b] hover:text-white')
              }
              title={showingSolution ? 'Switch back to the challenge' : 'Reveal the solution'}
            >
              {isLoadingSolution
                ? <Loader2 size={14} className="animate-spin" />
                : <Lightbulb size={14} />}
              {isLoadingSolution
                ? 'Loading…'
                : showingSolution ? 'Hide Solution' : 'Show Solution'}
            </button>
          )}

          {/* Reset Code — visible only when saved progress exists for this template */}
          {selectedName && currentTemplate && getEntry(selectedName) && (
            <button
              onClick={() => {
                if (window.confirm('Reset to the original challenge stub? Your saved code for this challenge will be lost.')) {
                  setCode(currentTemplate.code);
                  setNotes('');
                  clearEntry(selectedName);
                  setRunSummary(null);
                  setToastMsg(`Reset "${selectedName}" to the original challenge stub`);
                }
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm border border-[#3d444d] text-slate-400 hover:text-white hover:bg-[#2d333b] transition-colors"
              title="Reset code to the original challenge stub"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          )}

          {/* Test pass/fail summary — derived from the last run's ✅/❌ markers */}
          {runSummary && (runSummary.pass + runSummary.fail) > 0 && (
            <div
              className={
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium ' +
                (runSummary.fail === 0
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40'
                  : 'bg-red-500/15 text-red-300 border border-red-500/40')
              }
              title="Tests detected from console ✅/❌ markers"
            >
              {runSummary.fail === 0 ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
              {runSummary.fail === 0
                ? `${runSummary.pass}/${runSummary.pass} passed`
                : `${runSummary.pass}/${runSummary.pass + runSummary.fail} — ${runSummary.fail} failed`}
            </div>
          )}

          <button
            onClick={handleClear}
            className="p-2 rounded-xl border border-[#3d444d] text-slate-400 hover:text-white hover:bg-[#2d333b] transition-colors"
            title="Clear output"
          >
            <Trash2 size={16} />
          </button>

          <button
            onClick={runCode}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium transition-colors shadow-sm"
          >
            {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            {isRunning ? 'Running...' : 'Run'}
          </button>
        </div>
      </div>

      {/* Continue last session pill — shown only when there's an in-progress
          session that the user hasn't yet loaded this page-view. */}
      {!resumeDismissed && lastSessionName && lastSessionName !== selectedName && (() => {
        const entry = getEntry(lastSessionName);
        if (!entry || entry.status !== 'in-progress') return null;
        const tpl = allTemplates.find(t => t.name === lastSessionName);
        if (!tpl) return null;
        const ago = (() => {
          const ms = Date.now() - new Date(entry.updatedAt).getTime();
          const min = Math.round(ms / 60000);
          if (min < 1) return 'just now';
          if (min < 60) return `${min} min ago`;
          const hr = Math.round(min / 60);
          if (hr < 24) return `${hr} hr ago`;
          return `${Math.round(hr / 24)} d ago`;
        })();
        return (
          <div className="px-4 py-2 bg-indigo-950/40 border-b border-indigo-900/40 text-xs flex items-center gap-2 shrink-0">
            <span className="text-indigo-300/80">▶</span>
            <button
              onClick={() => handleTemplate(tpl)}
              className="text-indigo-300 hover:text-indigo-200 hover:underline font-medium"
            >
              Resume "{lastSessionName}"
            </button>
            <span className="text-slate-500">— last edited {ago}</span>
            <button
              onClick={() => setResumeDismissed(true)}
              className="ml-auto text-slate-500 hover:text-slate-300"
              aria-label="Dismiss"
              title="Dismiss for this session"
            >
              <X size={12} />
            </button>
          </div>
        );
      })()}

      {/* Editor + Output -- always dark */}
      <div ref={splitContainerRef} className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Editor Panel — width controlled by --editor-pct on md+, full width on mobile */}
        <div
          style={{ ['--editor-pct' as string]: `${editorPct}%` }}
          className="flex flex-col min-h-0 border-b md:border-b-0 border-[#2d333b] w-full md:w-[var(--editor-pct)] flex-1 md:flex-none"
        >
          <div className="px-4 py-2 h-10 text-xs font-medium text-slate-500 border-b border-[#2d333b] bg-[#22272e] shrink-0 flex items-center justify-between gap-2">
            <span>{langLabel}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleBracketAutoClose}
                className={
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ' +
                  (bracketAutoClose
                    ? 'border-emerald-700/50 bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/30'
                    : 'border-[#3d444d] text-slate-500 hover:bg-[#2d333b] hover:text-slate-300')
                }
                title={bracketAutoClose ? 'Bracket auto-close: ON (click to disable)' : 'Bracket auto-close: OFF (click to enable)'}
              >
                <Braces size={11} />
                {bracketAutoClose ? 'Auto-close on' : 'Auto-close off'}
              </button>
              <button
                onClick={() => setWrapOn(w => !w)}
                className={
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ' +
                  (wrapOn
                    ? 'border-indigo-700/50 bg-indigo-900/20 text-indigo-300 hover:bg-indigo-900/30'
                    : 'border-[#3d444d] text-slate-500 hover:bg-[#2d333b] hover:text-slate-300')
                }
                title={wrapOn ? 'Word wrap: ON (long lines break visually)' : 'Word wrap: OFF (long lines scroll horizontally)'}
              >
                <WrapText size={11} />
                {wrapOn ? 'Wrap on' : 'Wrap off'}
              </button>
              <button
                onClick={handleFormat}
                disabled={isFormatting}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border border-[#3d444d] text-slate-300 hover:bg-[#2d333b] hover:text-white transition-colors disabled:opacity-60"
                title="Format with Prettier (⌘⇧F)"
              >
                {isFormatting
                  ? <Loader2 size={11} className="animate-spin" />
                  : <Wand2 size={11} />}
                Format
              </button>
              <span className="text-slate-600">
                {code.split('\n').length} lines
              </span>
            </div>
          </div>
          <div className={`flex-1 overflow-auto bg-[#1e1e2e] min-h-[200px] playground-editor-wrap${wrapOn ? ' wrap-on' : ''}`}>
            <Editor
              value={code}
              onValueChange={setCode}
              onKeyDown={handleEditorKeyDown}
              highlight={(c) => decorateBrackets(highlightCode(c, hljsLang), c, caretPos)}
              padding={16}
              tabSize={2}
              insertSpaces={true}
              textareaId="playground-editor"
              textareaClassName="playground-editor-textarea"
              preClassName="playground-editor-pre"
              style={{
                fontFamily: '"Fira Code", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize: 14,
                lineHeight: 1.6,
                color: '#cdd6f4',
                caretColor: '#fff',
                minHeight: '100%',
              }}
            />
          </div>

          {/* Notes scratchpad — collapsible, per-challenge, auto-saved alongside code */}
          {selectedName && (
            <div className="border-t border-[#2d333b] bg-[#1a1c25] shrink-0">
              <button
                onClick={() => setNotesOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-[#22272e] transition-colors"
                title={notesOpen ? 'Collapse notes' : 'Expand notes'}
              >
                <span className="inline-flex items-center gap-2">
                  <StickyNote size={12} />
                  Notes
                  {notes.length > 0 && (
                    <span className="text-[10px] text-amber-400/80">· {notes.length} chars</span>
                  )}
                </span>
                <ChevronRight size={12} className={notesOpen ? 'rotate-90 transition-transform' : 'transition-transform'} />
              </button>
              {notesOpen && (
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Scratchpad for thoughts on this challenge — approach, gotchas, time complexity ideas. Saved with your code."
                  className="w-full h-32 px-4 py-2 bg-[#1e1e2e] text-slate-200 text-sm font-mono resize-none outline-none border-t border-[#2d333b]"
                  spellCheck={false}
                />
              )}
            </div>
          )}
        </div>

        {/* Draggable splitter — md+ only. Drag to resize editor vs output. */}
        <div
          onMouseDown={handleSplitterDown}
          onTouchStart={handleSplitterDown}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize editor and output panels"
          className={
            'hidden md:flex items-center justify-center shrink-0 w-1.5 cursor-col-resize transition-colors group ' +
            (isResizing ? 'bg-indigo-500' : 'bg-[#2d333b] hover:bg-indigo-500/70')
          }
        >
          <div className="w-0.5 h-8 rounded-full bg-slate-600 group-hover:bg-white transition-colors" />
        </div>

        {/* Output Panel — extracted + memoized so editor keystrokes don't re-render it */}
        <OutputPanel output={output} hasPreview={hasPreview} previewRef={previewRef} />

      </div>

      {/* Step-by-step explanation modal — opens on Explain button click */}
      <ExplanationModal
        open={explainOpen}
        explanation={explanationData}
        onClose={() => setExplainOpen(false)}
        onLoadTemplate={(name) => {
          const t = allTemplates.find(t => t.name === name);
          if (t) handleTemplate(t);
        }}
      />

      <Toast message={toastMsg} onClose={() => setToastMsg(null)} />
    </div>
  );
}
