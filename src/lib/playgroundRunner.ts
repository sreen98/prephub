// Running user code: the Web Worker sandbox, Babel transpilation, and the
// source-sniffing helpers that decide which pipeline a snippet needs.
//
// Extracted from CodePlayground.tsx. `stripModuleSyntax` and `detectJSX`/
// `detectTS` are pure and have real edge cases (dynamic import(), `import`
// inside a comment or string), which is why they now have tests.

// ==================== Helpers ====================

/**
 * Join console arguments the way a real console does, applying printf-style
 * format specifiers when the first argument carries them.
 *
 * WHY: React logs warnings and component stacks with format strings — e.g.
 * `console.error('The above error occurred in the %s component:', name)`.
 * Naively mapping every argument through `formatValue` and joining leaves the
 * specifiers in place, so the panel showed bare `%o` and `%s` lines next to a
 * real error, which reads like the playground itself is broken.
 *
 * Handles %s %d %i %f %o %O %c and %%. `%c` (CSS styling) consumes its argument
 * and renders nothing, which is what a console does in a plain-text context.
 */
export function formatConsoleArgs(args: unknown[]): string {
  const first = args[0];
  if (typeof first !== 'string' || !/%[sdifoOc%]/.test(first)) {
    return args.map(formatValue).join(' ');
  }
  let next = 1;
  const head = first.replace(/%([sdifoOc%])/g, (match, spec: string) => {
    if (spec === '%') return '%';
    if (spec === 'c') { next++; return ''; }          // style arg, no output
    if (next >= args.length) return match;            // no argument left: leave as-is
    const value = args[next++];
    if (spec === 'd' || spec === 'i') return String(Math.trunc(Number(value)));
    if (spec === 'f') return String(Number(value));
    if (spec === 's') return typeof value === 'string' ? value : formatValue(value);
    return formatValue(value);                        // o, O
  });
  return [head, ...args.slice(next).map(formatValue)].join(' ');
}

export function formatValue(val: unknown): string {
  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (typeof val === 'string') return val;
  if (typeof val === 'function') return `[Function: ${val.name || 'anonymous'}]`;
  if (val instanceof Error) return `${val.name}: ${val.message}`;
  try {
    return JSON.stringify(val, null, 2);
  } catch {
    // Circular structure, BigInt, or a throwing toJSON. Describe it rather
    // than calling String() on it, which would print "[object Object]".
    return Object.prototype.toString.call(val);
  }
}

export function detectJSX(code: string): boolean {
  // Explicit render call or capitalized component tag.
  if (/render\s*\(/.test(code)) return true;
  if (/<[A-Z][A-Za-z0-9]*/.test(code)) return true;
  // Function returning a JSX tag (lowercase HTML or uppercase component).
  if (/return\s*\(?\s*<[a-zA-Z]/.test(code)) return true;
  // A complete lowercase HTML tag anywhere — catches an expression like
  // `const a = <div>hi</div>` that is neither returned nor rendered. The tag
  // name must follow `<` immediately and the tag must close, so a comparison
  // (`a < b`, `i<n`) cannot match.
  if (/<[a-z][a-z0-9]*(?:\s[^<>]*)?\/?>/.test(code)) return true;
  // React hook usage strongly implies a React component.
  if (/\b(useState|useEffect|useRef|useMemo|useCallback|useReducer|useContext|useLayoutEffect)\s*\(/.test(code)) return true;
  return false;
}

// ============================================================
// Worker-based runner for plain JS — sandboxes user code on a
// separate thread so infinite loops can be force-killed without
// hanging the tab.
// ============================================================

// Inline worker source. Keep it self-contained (no main-thread imports).
// Patches console.log/warn/error to forward to the main thread, runs the
// user code via `new Function`, and posts a `sync-done` signal when the
// synchronous portion finishes.
const WORKER_SOURCE = `
function formatVal(v) {
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  if (typeof v === 'string') return v;
  if (typeof v === 'function') return '[Function: ' + (v.name || 'anonymous') + ']';
  if (v instanceof Error) return v.name + ': ' + v.message;
  try { return JSON.stringify(v, null, 2); } catch { return String(v); }
}
const post = (type, text) => self.postMessage({ kind: 'log', type, text });
const origConsole = self.console;
self.console = {
  ...origConsole,
  log:   (...a) => post('log',   a.map(formatVal).join(' ')),
  warn:  (...a) => post('warn',  a.map(formatVal).join(' ')),
  error: (...a) => post('error', a.map(formatVal).join(' ')),
};
self.onmessage = (e) => {
  try {
    const result = new Function(e.data)();
    if (result !== undefined) post('result', '→ ' + formatVal(result));
  } catch (err) {
    post('error', (err && err.name ? err.name : 'Error') + ': ' + (err && err.message ? err.message : String(err)));
  }
  self.postMessage({ kind: 'sync-done' });
};
`;

export interface WorkerLog { type: 'log' | 'warn' | 'error' | 'result'; text: string; }
export interface WorkerRunResult { logs: WorkerLog[]; timedOut: boolean; }

// Execute `code` in a fresh Web Worker. Hard-kills the worker after
// `syncTimeoutMs` if the synchronous portion doesn't finish (catches
// infinite loops). After sync completes, gives a short grace window for
// trailing setTimeout/Promise callbacks before tearing the worker down.
export function runInWorker(code: string, syncTimeoutMs: number = 3000): Promise<WorkerRunResult> {
  return new Promise((resolve) => {
    const blob = new Blob([WORKER_SOURCE], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    const logs: WorkerLog[] = [];
    let resolved = false;
    let syncDone = false;
    let asyncDrainTimer: number | null = null;

    const cleanup = () => {
      try { worker.terminate(); } catch { /* ignore */ }
      try { URL.revokeObjectURL(url); } catch { /* ignore */ }
    };

    const finalize = (timedOut: boolean) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(hardTimer);
      if (asyncDrainTimer !== null) clearTimeout(asyncDrainTimer);
      cleanup();
      resolve({ logs, timedOut });
    };

    // Hard kill if the synchronous portion doesn't finish — this catches
    // infinite loops like `while (true) {}`.
    const hardTimer = window.setTimeout(() => {
      if (!syncDone) {
        logs.push({
          type: 'error',
          text: `⏱️ Execution timed out after ${syncTimeoutMs / 1000}s — your code is likely stuck in an infinite loop. The worker was force-stopped.`,
        });
        finalize(true);
      }
    }, syncTimeoutMs);

    worker.onmessage = (e: MessageEvent) => {
      const msg = e.data;
      if (msg.kind === 'log') {
        logs.push({ type: msg.type, text: msg.text });
      } else if (msg.kind === 'sync-done') {
        syncDone = true;
        // Brief async drain window for trailing setTimeout/Promise callbacks
        // (debounce demos etc.) before we close the worker.
        asyncDrainTimer = window.setTimeout(() => finalize(false), 400);
      }
    };

    worker.onerror = (e: ErrorEvent) => {
      logs.push({ type: 'error', text: e.message || 'Worker error' });
      finalize(false);
    };

    worker.postMessage(code);
  });
}

let babelModule: typeof import('@babel/standalone') | null = null;
/**
 * Transpiles a snippet for `new Function`.
 *
 * The TypeScript preset is applied **unconditionally**, and that is deliberate:
 * TypeScript is a superset of JavaScript, so there is nothing to detect and
 * nothing to lose. Detecting it was a real bug — the old `detectTS` matched
 * only a fixed list of builtin type names after a colon, so a parameter
 * annotated with a custom or namespaced type
 *
 *     const handleSubmit = (e: React.FormEvent) => { … }
 *
 * was not recognised as TypeScript, compiled as plain JSX, and died with
 * `Unexpected token, expected ","`. That pattern is in almost every real React
 * component, so the failure was common and the message gave no clue why.
 *
 * Verified: all 180 templates and every plain-JS construct (object literals,
 * ternaries, labels, class fields, generators, optional chaining) compile
 * identically with the preset always on.
 *
 * `isTSX` still has to track JSX, because in a non-TSX TypeScript file
 * `<div>x</div>` parses as a type assertion rather than an element.
 */
export async function transpileSource(code: string, opts: { jsx: boolean }): Promise<string> {
  if (!babelModule) {
    babelModule = await import('@babel/standalone');
  }
  const presets: (string | [string, Record<string, unknown>])[] = [
    ['typescript', { isTSX: opts.jsx, allExtensions: true }],
  ];
  if (opts.jsx) presets.push('react');
  const result = babelModule.transform(code, {
    presets,
    // Decorators are ordinary TypeScript — Angular, NestJS and TypeORM examples
    // are full of them — but Babel needs the plugin switched on explicitly, and
    // without it a perfectly valid snippet dies with "Support for the
    // experimental syntax 'decorators' isn't currently enabled". `legacy` is the
    // form `experimentalDecorators: true` compiles, which is what those
    // frameworks require and therefore what the guides show.
    plugins: [['proposal-decorators', { version: 'legacy' }]],
    filename: opts.jsx ? 'playground.tsx' : 'playground.ts',
  });
  return result.code;
}

// TS-syntax detection — used when the loaded template has no explicit lang
// (e.g., user pasted TS code into a JS-marked template).
export function detectTS(code: string): boolean {
  return (
    // Declarations that exist only in TypeScript
    /\b(interface|enum|namespace|declare)\s+[A-Za-z_$]/.test(code)
    || /\btype\s+[A-Za-z_$][\w$]*\s*(<[^>]*>)?\s*=/.test(code)
    // `const x: Type`, `let x: Type` — any type, not a fixed list
    || /\b(const|let|var)\s+[A-Za-z_$][\w$]*\s*:\s*[A-Za-z_${[(]/.test(code)
    // Annotated parameters: `(e: React.FormEvent)`, `(props: Props)`, `x?: T`
    // This is the case the old fixed-name list missed.
    || /[(,]\s*[A-Za-z_$][\w$]*\s*\??\s*:\s*[A-Za-z_${[(]/.test(code)
    // Return annotations: `): Type {` / `): Type =>`
    || /\)\s*:\s*[A-Za-z_${[(][^=;{]*\s*(=>|\{)/.test(code)
    // Assertions and modifiers
    || /\bas\s+(const\b|[A-Z][\w$]*)/.test(code)
    || /\bsatisfies\s+[A-Za-z_${]/.test(code)
    || /\b(readonly|implements|public|private|protected)\s+[A-Za-z_$]/.test(code)
    // Generic parameters on a function or class declaration
    || /\b(function|class)\s+[A-Za-z_$][\w$]*\s*</.test(code)
  );
}

// The playground executes code with `new Function`, which is a *script*, not a
// module — so an `import` statement is a hard SyntaxError ("Cannot use import
// statement outside a module"). Babel's typescript/react presets strip types
// and compile JSX but leave module syntax alone, so we remove it ourselves.
//
// This is safe here because everything a snippet would realistically import
// (React, the hooks, render) is already injected into scope. Anything else
// becomes a clear "x is not defined" instead of a confusing syntax error.
export function stripModuleSyntax(code: string): { code: string; stripped: boolean } {
  const original = code;

  let out = code
    // import X, { y } from 'mod';  /  import * as X from 'mod';  /  import 'mod';
    .replace(/^[ \t]*import\s+[\s\S]*?\s+from\s*['"][^'"]+['"]\s*;?[ \t]*$/gm, '')
    .replace(/^[ \t]*import\s*['"][^'"]+['"]\s*;?[ \t]*$/gm, '')
    // export { a, b };  /  export * from 'mod';
    .replace(/^[ \t]*export\s*\{[^}]*\}\s*(?:from\s*['"][^'"]+['"])?\s*;?[ \t]*$/gm, '')
    .replace(/^[ \t]*export\s+\*\s+from\s*['"][^'"]+['"]\s*;?[ \t]*$/gm, '')
    // keep the declaration, drop the modifier: `export default function X` -> `function X`
    .replace(/^([ \t]*)export\s+default\s+/gm, '$1')
    .replace(/^([ \t]*)export\s+(?=(?:async\s+)?(?:function|class|const|let|var)\b)/gm, '$1');

  // Collapse the blank lines the removals leave behind, so line numbers in the
  // editor stay roughly aligned with what ran.
  out = out.replace(/\n{3,}/g, '\n\n');
  return { code: out, stripped: out !== original };
}
