import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import * as ReactDOM from 'react-dom/client';
import { Link } from 'react-router-dom';
import { Play, Trash2, ArrowLeft, Loader2, X, Search, BookOpen, PanelLeftOpen, ChevronRight, Lightbulb, Wand2, Braces, Sparkles, RotateCcw, WrapText, Shuffle, StickyNote, CheckCircle2, XCircle } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import Editor from 'react-simple-code-editor';
import { highlightCode, decorateBrackets } from '../../lib/editorHighlight';
import { formatCode } from '../../lib/playgroundFormat';
import {
  formatValue, detectJSX, stripModuleSyntax, transpileSource, runInWorker,
} from '../../lib/playgroundRunner';
import {
  closingTagFor, shouldClosePair, shouldCloseAngle, BRACKET_PAIRS, CLOSERS,
} from './playgroundAutoClose';
import type {
  TemplateLang, Pattern, Difficulty,
} from '../../data/playground/playgroundTemplates';
import {
  PATTERN_GROUPS,
  allTemplates,
  getTemplateCode,
  peekTemplateCode,
  prefetchTemplateCode,
  type FlatTemplateMeta,
  type TemplateMeta,
  type CategoryMeta,
} from '../../data/playground/templateIndex';
import { OutputPanel, type OutputEntry } from './OutputPanel';
import { playgroundSolutionKeys } from '../../data/playground/playgroundSolutionKeys';
import { usePlaygroundProgress } from '../../hooks/usePlaygroundProgress';
import { useTemplateFilters } from '../../hooks/useTemplateFilters';
import { useTemplateCatalog } from '../../hooks/useTemplateCatalog';
import { useEditorPrefs } from '../../hooks/useEditorPrefs';
import ExplanationModal from './ExplanationModal';
import TemplateModal from './TemplateModal';
import PreviewErrorBoundary from './PreviewErrorBoundary';
import Toast from '../../components/Toast';
import type { Explanation } from '../../data/playground/playgroundExplanations';
import { playgroundExplanationKeys } from '../../data/playground/playgroundExplanationKeys';
import { getJSON, safeGet, safeRemove } from '../../lib/storage';

// Explanation module shares the same lazy-cache pattern as solutions —
// the data itself is small now but will grow as more challenges get
// step-by-step explanations.
let explanationsCache: Record<string, Explanation> | null = null;
async function loadExplanations(): Promise<Record<string, Explanation>> {
  if (explanationsCache) return explanationsCache;
  const mod = await import('../../data/playground/playgroundExplanations');
  explanationsCache = mod.playgroundExplanations;
  return explanationsCache;
}

// Solutions module is dynamically imported on first "Show Solution" click —
// keeps ~50 KB of solution-body strings out of the playground's initial chunk.
// Cached after first load so subsequent toggles are instant.
let solutionsCache: Record<string, string> | null = null;
async function loadSolutions(): Promise<Record<string, string>> {
  if (solutionsCache) return solutionsCache;
  const mod = await import('../../data/playground/playgroundSolutions');
  solutionsCache = mod.playgroundSolutions;
  return solutionsCache;
}


// ==================== Component ====================

export default function CodePlayground() {
  // Compute the initial state from three sources, in priority order:
  //   1. sessionStorage "playground-code" — one-shot handoff from "Try it" links in study guides.
  //   2. localStorage "playground-last-session" — auto-resume the last template the user
  //      was working on, including their saved progress draft (if any).
  //   3. Fall back to the first template ("Hello World").
  //
  // Code bodies are no longer bundled with the metadata (see templateIndex),
  // so `code` may be empty on the first render and arrive a moment later. A
  // saved draft is still resolved synchronously, because that lives in
  // localStorage — so a returning user sees their own work immediately with no
  // fetch at all. `needsCode` is the name whose body still has to be fetched.
  const initialState: {
    code: string; selectedName: string | null; lang: TemplateLang; needsCode: string | null;
  } = (() => {
    const handoff = safeGet('playground-code', 'session');
    if (handoff) {
      // Try-it bootstrap. Selected template is unknown — leave it null so the
      // user can pick one (or just edit the handed-off code freely).
      return { code: handoff, selectedName: null, lang: 'js', needsCode: null };
    }
    const lastName = safeGet('playground-last-session');
    const tpl = lastName ? allTemplates.find(t => t.name === lastName) : undefined;
    const target = tpl ?? allTemplates[0];
    const lang = target.lang ?? (target.jsx ? 'jsx' : 'js');

    if (tpl) {
      const map = getJSON<Record<string, { code?: string } | undefined>>('playground-progress', {});
      const saved = map[tpl.name]?.code;
      if (typeof saved === 'string' && saved) {
        return { code: saved, selectedName: tpl.name, lang, needsCode: null };
      }
    }
    return { code: '', selectedName: target.name, lang, needsCode: target.name };
  })();

  const initialNeedsCode = initialState.needsCode;
  const [code, setCode] = useState<string>(initialState.code);
  const [output, setOutput] = useState<OutputEntry[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [hasPreview, setHasPreview] = useState<boolean>(false);
  const [selectedName, setSelectedName] = useState<string | null>(initialState.selectedName);
  const [showingSolution, setShowingSolution] = useState<boolean>(false);
  // All six template-modal filters live in one reducer (useTemplateFilters).
  // Changing the tag or the mode clears `pattern`/`difficulty` as part of the
  // same transition, which is what makes the "No templates found" bug — a
  // stale JS-only pattern surviving a switch to React — inexpressible.
  // Held as one object so it can be handed to TemplateModal intact — see the
  // note in that file on why the reducer must not be split into twelve props.
  // The aliases below are for this component's own derived memos.
  const filters = useTemplateFilters();
  const {
    search: drawerSearch, tag: drawerFilter,
    mode: modalMode, pattern: patternFilter, difficulty: difficultyFilter,
    setSearch: setDrawerSearch, resetFilters,
  } = filters;
  // Current source language — drives transpiler preset selection.
  // Defaults to 'js'; loading a JSX template flips to 'jsx', etc.
  const [currentLang, setCurrentLang] = useState<TemplateLang>(initialState.lang);
  const previewRef = useRef<HTMLDivElement>(null);
  const reactRootRef = useRef<{ render: (n: React.ReactNode) => void; unmount: () => void } | null>(null);
  const drawerSearchRef = useRef<HTMLInputElement>(null);
  const logsRef = useRef<OutputEntry[]>([]);
  const flushTimerRef = useRef<number | null>(null);
  const splitContainerRef = useRef<HTMLDivElement>(null);
  // Persisted editor preferences (split width, wrap, bracket auto-close).
  const { editorPct, setEditorPct, wrapOn, toggleWrap,
          bracketAutoClose, toggleBracketAutoClose } = useEditorPrefs();
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

  // Everything the picker displays — see hooks/useTemplateCatalog for why the
  // counts are scoped to the active tag rather than the whole catalogue.
  const {
    categories: filteredCategories, tagOptions, totalJsChallenges,
    difficultyCounts, patternCounts, scopeHasPatterns, scopeHasDifficulty,
  } = useTemplateCatalog({
    search: drawerSearch, tag: drawerFilter, mode: modalMode,
    pattern: patternFilter, difficulty: difficultyFilter,
  });

  // Fetch the initially-selected template's body, then warm the rest on idle.
  // `needsCode` is null when the first render already had something to show —
  // a "Try it" handoff or the user's own saved draft — so the common returning
  // -visitor path costs no fetch at all.
  useEffect(() => {
    let cancelled = false;
    if (initialNeedsCode) {
      setIsLoadingTemplate(true);
      void getTemplateCode(initialNeedsCode).then((body) => {
        if (cancelled) return;
        setCode(body ?? '');
        setIsLoadingTemplate(false);
      });
    }
    prefetchTemplateCode();
    return () => { cancelled = true; };
    // initialNeedsCode is captured once from the first render, by design.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear sessionStorage code after loading. This is the "Try it" handoff
  // bootstrap from study guides — single-shot, then cleared so a refresh
  // does not re-seed it.
  useEffect(() => {
    safeRemove('playground-code', 'session');
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
      setEditorPct(pct);   // hook clamps to 20–80
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
  }, [setEditorPct]);

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
    /* eslint-disable no-console -- patching the console is how the playground
     captures user output; restored on unmount. */
  const origLog = console.log;
    const origWarn = console.warn;
    const origError = console.error;

    const push = (entry: OutputEntry) => {
      logsRef.current = [...logsRef.current, entry];
    };
    console.log = (...args: unknown[]) => { push({ type: 'log', text: args.map(formatValue).join(' ') }); };
    console.warn = (...args: unknown[]) => { push({ type: 'warn', text: args.map(formatValue).join(' ') }); };
    console.error = (...args: unknown[]) => { push({ type: 'error', text: args.map(formatValue).join(' ') }); };

    return () => {
      console.log = origLog;
      console.warn = origWarn;
      console.error = origError;
      /* eslint-enable no-console */
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

  // Declared above runCode deliberately: runCode depends on it, and a `const`
  // used before its declaration is a temporal-dead-zone ReferenceError at
  // runtime that tsc reports only once something actually references it.
  const currentTemplate = useMemo(
    () => selectedName ? allTemplates.find(t => t.name === selectedName) ?? null : null,
    [selectedName],
  );

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

      // Auto-append a top-level render(<Component />) when JSX is detected
      // but the user hasn't explicitly called render. Class components are
      // the common case: `class X extends React.Component { render() { ... } }`
      // where the inner `render()` is a method, NOT a call to the runner's
      // render function. Use a stricter pattern to avoid that false match:
      // we want `render(<...` (call with JSX argument) at the start of a
      // line / after a semicolon, not a method declaration `render() {`.
      // Remove ESM syntax first — `new Function` cannot accept it, and the
      // render-append heuristic below should see the same source we execute.
      const { code: moduleFree, stripped: hadModuleSyntax } = stripModuleSyntax(code);
      if (hadModuleSyntax) {
        logsRef.current = [...logsRef.current, {
          type: 'warn',
          text: 'import/export statements were ignored — the playground runs a script, not a module. React, useState, useEffect, useRef, useMemo, useCallback, useReducer, useContext, createContext, memo, Fragment and render are already in scope.',
        }];
      }
      let sourceToTranspile = moduleFree;
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

      // Always transpile: the TypeScript preset is a no-op on plain JS, and
      // trying to detect TS was the bug that made `(e: React.FormEvent)` fail.
      execCode = await transpileSource(sourceToTranspile, { jsx: needsJSX });

      if (needsJSX) {
        // Inject React scope and render function
        // Any failure in the previewed component is reported into the console
        // panel. Without this a throw just unmounts the tree and the pane goes
        // white with no explanation anywhere.
        const reportPreviewError = (message: string) => {
          logsRef.current = [...logsRef.current, { type: 'error', text: message }];
          setOutput([...logsRef.current]);
        };

        const renderFn = (element: React.ReactElement) => {
          if (previewRef.current) {
            if (reactRootRef.current) {
              try { reactRootRef.current.unmount(); } catch { /* ignore */ }
            }
            reactRootRef.current = ReactDOM.createRoot(previewRef.current, {
              // React 19 routes errors it recovered from, and ones nothing
              // caught, through these — including errors an error boundary
              // already handled, which is how we log *and* show a fallback.
              onUncaughtError: (err: unknown) => {
                reportPreviewError(
                  err instanceof Error ? `${err.name}: ${err.message}` : String(err),
                );
              },
            });
            reactRootRef.current.render(
              <PreviewErrorBoundary onError={reportPreviewError}>
                {element}
              </PreviewErrorBoundary>,
            );
            setHasPreview(true);
            previewMounted = true;
          }
        };

        const scope: Record<string, unknown> = {
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
        const scopeValues: unknown[] = Object.values(scope);
        // Running user-authored code is the entire purpose of this component.
        // The plain-JS path is sandboxed in a Web Worker with a timeout (see
        // runInWorker); this main-thread path is the React branch, which needs
        // DOM access for the live preview.
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        const fn = new Function(...scopeKeys, execCode) as (...args: unknown[]) => void;
        fn(...scopeValues);

        if (!previewMounted) {
          logsRef.current = [...logsRef.current, {
            type: 'error',
            text: 'No render() call detected. For React components, end your code with: render(<YourComponent />);',
          }];
        }
      } else {
        // Plain JS execution \u2014 run in a Web Worker with a 3-second
        // synchronous timeout so infinite loops can't hang the tab.
        const { logs, timedOut } = await runInWorker(execCode, 3000);
        // Worker logs replace the main-thread console capture for this run
        // (the main-thread console patches won't fire \u2014 code is in the worker).
        logsRef.current = [...logsRef.current, ...logs];
        if (timedOut) {
          setToastMsg('Execution timed out \u2014 infinite loop killed');
        }
      }
    } catch (err: unknown) {
      const e = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
      logsRef.current = [...logsRef.current, { type: 'error', text: e }];
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
  }, [code, currentLang, selectedName, markSolved, currentTemplate?.kind, currentTemplate?.tag]);

  // Async throws escape both error boundaries and onUncaughtError: a callback
  // passed to setTimeout/setInterval, or a rejected promise with no .catch,
  // unwinds to the window rather than through React. Those are exactly the
  // failures a debounce or fetch demo produces, so without this the preview
  // looks fine and the error is invisible.
  useEffect(() => {
    if (!hasPreview) return;

    const onError = (e: ErrorEvent) => {
      const msg = e.error instanceof Error ? `${e.error.name}: ${e.error.message}` : e.message;
      logsRef.current = [...logsRef.current, { type: 'error', text: `Uncaught ${msg}` }];
      setOutput([...logsRef.current]);
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      const r: unknown = e.reason;
      const msg = r instanceof Error ? `${r.name}: ${r.message}` : String(r);
      logsRef.current = [...logsRef.current, { type: 'error', text: `Unhandled rejection: ${msg}` }];
      setOutput([...logsRef.current]);
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, [hasPreview]);

  // Cmd+Enter to run, Escape to close drawer
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        void runCode();
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

  const handleTemplate = useCallback((template: TemplateMeta): void => {
    stopFlush();
    if (reactRootRef.current) {
      try { reactRootRef.current.unmount(); } catch { /* ignore */ }
      reactRootRef.current = null;
    }
    logsRef.current = [];
    // The stub body is fetched on demand (see templateIndex) — but a saved
    // draft comes from localStorage, so a returning user's own work appears
    // with no fetch at all. Only the pristine stub needs the download.
    const saved = getEntry(template.name);
    const stub = peekTemplateCode(template.name);
    const restored = Boolean(saved?.code) && saved?.code !== stub;
    if (restored && saved?.code) {
      setCode(saved.code);
      setToastMsg(`Resumed your saved work in "${template.name}"`);
    } else if (stub !== undefined) {
      setCode(stub);
    } else {
      setIsLoadingTemplate(true);
      void getTemplateCode(template.name).then((body) => {
        setCode(body ?? '');
        setIsLoadingTemplate(false);
      });
    }
    setNotes(saved?.notes ?? '');
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
  }, [stopFlush, getEntry, setLastSession, setDrawerSearch]);

  // Load a Blank starter (JS / TS / React) — named so the toolbar reflects it
  // Blank starters ship eagerly with the index (three tiny snippets), so their
  // code is already in hand — no fetch, no loading state.
  const handleBlankStarter = useCallback((starter: { name: string; lang: TemplateLang; code: string }): void => {
    stopFlush();
    setCode(starter.code);
    setCurrentLang(starter.lang);
    setSelectedName(null);
    setNotes('');
    setShowingSolution(false);
    setOutput([]);
    setHasPreview(false);
    setIsDrawerOpen(false);
    setRunSummary(null);
  }, [stopFlush]);

  // Look up the original challenge code by template name
  // Synchronous check via the keys manifest (~1 KB) — avoids loading the
  // ~50 KB solutions chunk just to decide whether to render the button.
  const hasSolution: boolean = !!(selectedName && playgroundSolutionKeys.has(selectedName));
  const hasExplanation: boolean = !!(selectedName && playgroundExplanationKeys.has(selectedName));

  // True while a template's code body is downloading. The metadata ships with
  // the route; the 360 KB of bodies does not (see templateIndex).
  const [isLoadingTemplate, setIsLoadingTemplate] = useState<boolean>(false);
  const [isLoadingSolution, setIsLoadingSolution] = useState<boolean>(false);
  const [isLoadingExplain, setIsLoadingExplain] = useState<boolean>(false);
  const [explainOpen, setExplainOpen] = useState<boolean>(false);
  const [explanationData, setExplanationData] = useState<Explanation | null>(null);
  const [isFormatting, setIsFormatting] = useState<boolean>(false);
  const toggleSolution = useCallback(async (): Promise<void> => {
    if (!currentTemplate || !hasSolution) return;
    if (showingSolution) {
      // Switch back: prefer the user's auto-saved draft over the bare stub
      // so we never silently throw away their work.
      const saved = getEntry(currentTemplate.name);
      const stub = peekTemplateCode(currentTemplate.name) ?? await getTemplateCode(currentTemplate.name);
      setCode(saved?.code ?? stub ?? '');
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logsRef.current = [
        ...logsRef.current,
        { type: 'error', text: `Couldn't format: ${msg}` },
      ];
      setOutput([...logsRef.current]);
    } finally {
      setIsFormatting(false);
    }
  }, [code, currentLang, isFormatting]);

  // Editor keydown — auto-indent on Enter + bracket auto-close.
  // We mutate the textarea's value via setCode + restore caret with
  // requestAnimationFrame so React commits before we set selection.
  // react-simple-code-editor types `onKeyDown` as the intersection of the div
  // and textarea handlers, so this parameter has to accept both or it isn't
  // assignable. At runtime the event always originates from the textarea the
  // editor renders, which is why narrowing to it below is safe.
  const handleEditorKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement | HTMLDivElement>): void => {
    const e = event as React.KeyboardEvent<HTMLTextAreaElement>;
    // Cmd/Ctrl+Shift+F → format
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'f' || e.key === 'F')) {
      e.preventDefault();
      void handleFormat();
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

    // ----- `<` pairs with `>` in JSX -----
    // Only in tag position: see shouldCloseAngle for why `count < max` and
    // `useState<Props>` must be left alone.
    if (e.key === '<' && shouldCloseAngle(before, isJSX) && shouldClosePair(code, start, end, '<')) {
      e.preventDefault();
      setCode(before + '<' + selected + '>' + after);
      if (selected) {
        requestAnimationFrame(() => { ta.selectionStart = start + 1; ta.selectionEnd = end + 1; });
      } else {
        requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 1; });
      }
      return;
    }

    // ----- JSX/HTML tag auto-close: typing `>` closes the tag you just opened -----
    // This is what "Auto-close" implies but previously didn't do — only brackets
    // and quotes were handled, so `<div>` never produced `</div>`.
    if (e.key === '>' && start === end) {
      const closeTag = closingTagFor(before, isJSX);
      // A `>` already sitting at the caret is the one we inserted when `<` was
      // typed. Consume it rather than adding a second one, so `<div|>` + `>`
      // gives `<div></div>` and not `<div>></div>`.
      const pending = code[start] === '>';
      if (closeTag || pending) {
        e.preventDefault();
        const rest = pending ? after.substring(1) : after;
        setCode(before + '>' + (closeTag ?? '') + rest);
        const caret = start + 1;                      // between > and </tag>
        requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = caret; });
        return;
      }
    }

    // ----- Smart skip: typing the same closer that's already there -----
    if (CLOSERS.has(e.key) && code[start] === e.key && start === end) {
      e.preventDefault();
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + 1; });
      return;
    }

    // ----- Bracket / quote auto-close -----
    if (BRACKET_PAIRS[e.key]) {
      const close = BRACKET_PAIRS[e.key];
      if (!shouldClosePair(code, start, end, e.key)) return;

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
  }, [code, bracketAutoClose, handleFormat, isJSX]);

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
    resetFilters();          // the reducer clears every filter dimension
    setTimeout(() => drawerSearchRef.current?.focus(), 200);
  }, [resetFilters]);

  // Restore a template's pristine code. Hoisted out of the Reset button's JSX,
  // where it was a 20-line async IIFE — which also meant the whole header
  // needed a dozen setters in scope and could not be extracted.
  const handleReset = useCallback(async (): Promise<void> => {
    if (!currentTemplate) return;
    // The pristine body may not be downloaded yet, so fetch it before
    // comparing — otherwise `dirty` always reads true and the confirm fires
    // even on untouched code.
    const original = peekTemplateCode(currentTemplate.name)
      ?? await getTemplateCode(currentTemplate.name) ?? '';
    const dirty = code !== original;
    if (dirty && !window.confirm(
      `Reset "${currentTemplate.name}" to its original code? Your current edits and saved draft for it will be lost.`
    )) return;

    setCode(original);
    setCurrentLang(currentTemplate.lang ?? (currentTemplate.jsx ? 'jsx' : 'js'));
    setNotes('');
    setShowingSolution(false);
    if (selectedName) clearEntry(selectedName);
    setRunSummary(null);
    setOutput([]);
    setHasPreview(false);
    setToastMsg(`Reset "${currentTemplate.name}" to its original code`);
  }, [currentTemplate, code, selectedName, clearEntry]);

  const closeDrawer = useCallback((): void => {
    setIsDrawerOpen(false);
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-screen relative">
      {/* Template picker — see features/playground/TemplateModal. */}
      <TemplateModal
        open={isDrawerOpen}
        onClose={closeDrawer}
        filters={filters}
        searchRef={drawerSearchRef}
        categories={filteredCategories}
        tagOptions={tagOptions}
        difficultyCounts={difficultyCounts}
        patternCounts={patternCounts}
        scopeHasPatterns={scopeHasPatterns}
        scopeHasDifficulty={scopeHasDifficulty}
        selectedName={selectedName}
        getEntry={getEntry}
        onPickTemplate={handleTemplate}
        onPickBlank={handleBlankStarter}
        onToast={setToastMsg}
      />

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
          <h1 className="text-lg font-bold shrink-0 text-white">Code Playground</h1>
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

          {/* Reset Code — available whenever a template is loaded, not just when a
              saved draft exists. It used to be gated on getEntry(), so the button
              was missing exactly when someone had mangled the code but not yet
              triggered the debounced autosave. */}
          {currentTemplate && (
            <button
              onClick={() => void handleReset()}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm border border-[#3d444d] text-slate-400 hover:text-white hover:bg-[#2d333b] transition-colors"
              title="Discard edits and restore this template's original code"
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
            <span className="flex items-center gap-2">
              {langLabel}
              {isLoadingTemplate && (
                <span className="inline-flex items-center gap-1 text-slate-400">
                  <Loader2 size={11} className="animate-spin" />
                  loading template…
                </span>
              )}
            </span>
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
                onClick={toggleWrap}
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
