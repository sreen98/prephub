import { describe, it, expect, vi, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LAST_MINUTE_CARDS, LAST_MINUTE_DECKS } from './lastMinuteCards';
import { cardsFor, readingMinutes } from '../lib/cardSet';
import { parseInline, type InlineToken } from '../lib/inlineMarkup';

/**
 * Every output written in a card's code comment is executed here (or, for
 * TypeScript, type-checked by the compiler). The cards are read minutes before
 * an interview: a wrong "// 1 6 4 5 2 3" there is worse than no card at all.
 */

const source = (id: string) => {
  const card = LAST_MINUTE_CARDS.find(c => c.id === id);
  if (!card?.code) throw new Error(`no code on card ${id}`);
  return card.code.source;
};

/** Every snippet is compiled here, once: executing the card's own code is the point. */
function compile(...paramsAndBody: string[]): (...args: unknown[]) => unknown {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval -- executing the card's own snippet is the point
  return new Function(...paramsAndBody) as (...args: unknown[]) => unknown;
}

/** Statement-level keywords: lines starting with these are run as-is, never captured. */
const DECLARATION = /^\s*(const|let|var|function|class|for|if|\/\/)\b/;

/**
 * Runs a snippet as a sloppy script and returns the value of every line that
 * ends in `expr;  // comment`, in order. That is exactly what the card claims.
 */
function lineValues(code: string, { strict = false } = {}): unknown[] {
  const body = code.split('\n').map(line => {
    if (DECLARATION.test(line)) return line;
    const m = /^(.*;\s*)?([^;]+);\s*\/\/.*$/.exec(line);
    return m ? `${m[1] ?? ''}__out.push(${m[2]});` : line;
  }).join('\n');
  const out: unknown[] = [];
  compile('__out', `${strict ? "'use strict';\n" : ''}${body}`)(out);
  return out;
}

/** Runs a snippet with a captured console and returns what it printed. */
function captureLogs(code: string): { logs: unknown[]; error?: unknown } {
  const logs: unknown[] = [];
  const console = { log: (...args: unknown[]) => logs.push(...args) };
  try {
    compile('console', code)(console);
    return { logs };
  } catch (error) {
    return { logs, error };
  }
}

afterEach(() => { vi.useRealTimers(); });

describe('card set', () => {
  it('has 53 cards with unique ids, every deck used, decks contiguous and in order', () => {
    expect(LAST_MINUTE_CARDS).toHaveLength(53);
    expect(new Set(LAST_MINUTE_CARDS.map(c => c.id)).size).toBe(LAST_MINUTE_CARDS.length);
    // The deck tabs jump to the first card of each deck, so a deck must not be split.
    const order = LAST_MINUTE_CARDS.map(c => c.deck).filter((d, i, all) => d !== all[i - 1]);
    expect(order).toEqual(LAST_MINUTE_DECKS.map(d => d.id));
  });

  it('the core pass is 31 cards, about 10 minutes; all is about 18', () => {
    expect(cardsFor(LAST_MINUTE_CARDS, 'core')).toHaveLength(31);
    expect(readingMinutes(31)).toBe(10);
    expect(readingMinutes(LAST_MINUTE_CARDS.length)).toBe(18);
  });

  it('every text field uses only closed `code` and **bold** markup', () => {
    const plain = (tokens: InlineToken[]): string[] => tokens.flatMap(t =>
      t.kind === 'text' ? [t.value] : t.kind === 'bold' ? plain(t.children) : []);
    for (const c of LAST_MINUTE_CARDS) {
      const texts = [c.question, c.answer, c.watch, c.say, ...(c.points ?? []),
        ...(c.table ? [...c.table.head, ...c.table.rows.flat()] : [])];
      for (const text of texts.filter((t): t is string => t !== undefined)) {
        for (const leftover of plain(parseInline(text))) {
          expect(leftover, `${c.id}: unclosed markup in "${text}"`).not.toMatch(/`|\*\*/);
        }
      }
    }
  });

  it('every table has a first-column header and rows as wide as the header', () => {
    for (const c of LAST_MINUTE_CARDS.filter(card => card.table)) {
      expect(c.table?.head[0], c.id).toBeTruthy();
      for (const row of c.table?.rows ?? []) expect(row, c.id).toHaveLength(c.table?.head.length ?? 0);
    }
  });

  it('every js, jsx and ts sample parses', () => {
    for (const c of LAST_MINUTE_CARDS) {
      if (!c.code || c.code.lang === 'text' || c.code.lang === 'html' || c.code.lang === 'css') continue;
      const { diagnostics = [] } = ts.transpileModule(c.code.source, {
        fileName: 'card.tsx',
        reportDiagnostics: true,
        compilerOptions: { jsx: ts.JsxEmit.Preserve, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      });
      expect(diagnostics.map(d => ts.flattenDiagnosticMessageText(d.messageText, ' ')), c.id).toEqual([]);
    }
  });
});

describe('JavaScript cards: every output comment, executed', () => {
  it('closures: the counter, and var vs let in a loop', async () => {
    const code = source('closures');
    const { logs } = captureLogs(code);
    await new Promise(r => setTimeout(r, 20));   // drain the six timers
    expect(logs).toEqual([3, 3, 3, 0, 1, 2]);
    expect(lineValues(code.split('\n').slice(0, 3).join('\n'))).toEqual([2]);
  });

  it('debounce runs once, with the last arguments, after the calls stop', () => {
    vi.useFakeTimers();
    const debounce = compile(`${source('debounce')}; return debounce;`)() as
      (fn: (...a: unknown[]) => void, ms: number) => (...a: unknown[]) => void;
    const spy = vi.fn();
    const d = debounce(spy, 100);
    d(1); vi.advanceTimersByTime(50); d(2); vi.advanceTimersByTime(99);
    expect(spy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(spy.mock.calls).toEqual([[2]]);
  });

  it('throttle runs on the leading edge, at most once per window', () => {
    vi.useFakeTimers();
    const throttle = compile(`${source('debounce')}; return throttle;`)() as
      (fn: (...a: unknown[]) => void, ms: number) => (...a: unknown[]) => void;
    const spy = vi.fn();
    const t = throttle(spy, 100);
    t('a'); vi.advanceTimersByTime(50); t('b'); vi.advanceTimersByTime(70); t('c');
    expect(spy.mock.calls).toEqual([['a'], ['c']]);
  });

  it('timers: 10 * 1000 fires at 10000 ms; the interval ticks at 2, 4 and 6 s, then stops', () => {
    vi.useFakeTimers();
    const { logs } = captureLogs(source('timers'));
    vi.advanceTimersByTime(9999);
    expect(logs).toEqual(['tick', 'tick', 'tick']);
    vi.advanceTimersByTime(1);
    expect(logs).toEqual(['tick', 'tick', 'tick', 'done']);
    vi.advanceTimersByTime(60_000);
    expect(logs).toHaveLength(4);   // cleared at 7 s, so no fourth tick
  });

  it('timers: a delay above 2147483647 ms overflows and fires almost at once', () => {
    expect(LAST_MINUTE_CARDS.find(c => c.id === 'timers')?.watch).toContain('2147483647');
    const code = 'const t0 = Date.now(); setTimeout(() => console.log(Date.now() - t0 < 1000), 2147483648);';
    const run = spawnSync(process.execPath, ['-e', code], { encoding: 'utf8', timeout: 10_000 });
    expect(run.stdout.trim()).toBe('true');
    expect(run.stderr).toContain('TimeoutOverflowWarning');
  });

  it('event loop: Node prints 1 6 4 5, then the timer and the immediate', () => {
    const code = source('event-loop');
    expect(code).toContain('// 1 6 4 5 2 3');
    // A real Node process running the snippet as CommonJS, as the card says.
    const run = spawnSync(process.execPath, ['--input-type=commonjs', '-e', code], { encoding: 'utf8' });
    expect(run.status, run.stderr).toBe(0);
    const printed = run.stdout.trim().split(/\r?\n/);
    expect(printed.slice(0, 4)).toEqual(['1', '6', '4', '5']);
    expect([...printed.slice(4)].sort()).toEqual(['2', '3']);   // these two may swap at top level
  });

  it('this: lost on a bare call (TypeError in strict mode), restored by call', () => {
    const code = source('this');
    expect(lineValues(code)).toEqual(['A', undefined, 'A']);
    expect(() => lineValues(code, { strict: true })).toThrow(TypeError);
  });

  it('call, apply and bind', () => {
    expect(lineValues(source('call-apply-bind'))).toEqual(['Hi, Ana!', 'Hi, Ana!', 'Hi, Ana?']);
  });

  it('hoisting: var reads undefined, let throws in the TDZ', () => {
    const { logs, error } = captureLogs(source('hoisting-tdz'));
    expect(logs).toEqual([undefined]);
    expect(error).toBeInstanceOf(ReferenceError);
    expect(String(error)).toContain("Cannot access 'b' before initialization");
  });

  it('promises: sequential awaits take two delays, Promise.all takes one', async () => {
    vi.useFakeTimers();
    const [, sequential, parallel] = source('promises').split('\n');
    const AsyncFunction = (async () => {}).constructor as new (...args: string[]) => (...a: unknown[]) => Promise<void>;
    const delay = () => new Promise(r => setTimeout(() => r(1), 1000));
    const settled = (line: string) => {
      const state = { done: false };
      void new AsyncFunction('getA', 'getB', line)(delay, delay).then(() => { state.done = true; });
      return state;
    };
    const seq = settled(sequential);
    const par = settled(parallel);
    await vi.advanceTimersByTimeAsync(1000);
    expect([seq.done, par.done]).toEqual([false, true]);
    await vi.advanceTimersByTimeAsync(1000);
    expect(seq.done).toBe(true);
  });

  it('prototypes', () => {
    expect(lineValues(source('prototypes'))).toEqual([true, false, 'woof']);
  });

  it('shallow vs deep copy', () => {
    expect(lineValues(source('shallow-deep-copy'))).toEqual([2, 2]);
  });
});

/** Type-checks a snippet in memory and returns its diagnostic codes. */
function diagnose(src: string): number[] {
  const fileName = 'card.ts';
  const options: ts.CompilerOptions = {
    strict: true, target: ts.ScriptTarget.ES2022, noEmit: true, skipLibCheck: true, lib: ['lib.es2023.d.ts'],
  };
  const sourceFile = ts.createSourceFile(fileName, src, ts.ScriptTarget.ES2022, true);
  const host = ts.createCompilerHost(options, true);
  const originalGet = host.getSourceFile.bind(host);
  host.getSourceFile = (name, ...rest) => (name === fileName ? sourceFile : originalGet(name, ...rest));
  return ts.getPreEmitDiagnostics(ts.createProgram([fileName], options, host))
    .filter(d => d.file?.fileName === fileName)
    .map(d => d.code);
}

describe('TypeScript cards: every ✗ and ✅, checked by the compiler', () => {
  it.each([
    ['type-vs-interface', []],
    ['any-unknown-never', []],
    ['generics', [2345]],
    ['utility-types', []],
    ['discriminated-unions', []],
    ['as-const-satisfies', []],
    ['structural-typing', [2353]],
  ])('%s produces exactly the errors it marks', (id, codes) => {
    const src = source(id);
    expect(diagnose(src)).toEqual(codes);
    for (const code of codes) expect(src).toContain(`✗ TS${code}`);
    // A ✗ on a commented-out line is a claim about that line once uncommented (tested below).
    const live = src.split('\n').filter(line => !line.trim().startsWith('//')).join('\n');
    expect((live.match(/✗/g) ?? []).length).toBe(codes.length);
  });

  it('unknown: using it before narrowing is TS18046', () => {
    const src = source('any-unknown-never').replace('// x.toUpperCase();', 'x.toUpperCase();  //');
    expect(source('any-unknown-never')).toContain('TS18046');
    expect(diagnose(src)).toEqual([18046]);
  });

  it('exhaustive switch: a new kind fails at the never assignment', () => {
    const src = source('discriminated-unions').replace("| { kind: 'square'; s: number }", "| { kind: 'square'; s: number } | { kind: 'tri'; b: number }");
    expect(diagnose(src)).toEqual([2322]);
  });

  it('as const: Role is exactly the two literals', () => {
    expect(diagnose(`${source('as-const-satisfies')}\nconst ok: Role = 'admin';\nconst bad: Role = 'guest';`)).toEqual([2322]);
  });
});

describe('Rapid fire and React-in-TypeScript claims', () => {
  it('currying: add(2)(3) is 5', () => {
    const points = LAST_MINUTE_CARDS.find(c => c.id === 'rapid-js')?.points ?? [];
    expect(points.some(p => p.includes('`const add = a => b => a + b;`') && p.includes('`add(2)(3)` is `5`'))).toBe(true);
    expect(compile('const add = a => b => a + b; return add(2)(3);')()).toBe(5);
  });

  /** Type-checks a .tsx snippet against the real React types. */
  function diagnoseTsx(src: string): number[] {
    const fileName = 'card.tsx';
    const options: ts.CompilerOptions = {
      strict: true, noEmit: true, skipLibCheck: true,
      target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler, jsx: ts.JsxEmit.ReactJSX,
      lib: ['lib.es2023.d.ts', 'lib.dom.d.ts'], types: [],
    };
    const sourceFile = ts.createSourceFile(fileName, src, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TSX);
    const host = ts.createCompilerHost(options, true);
    const originalGet = host.getSourceFile.bind(host);
    host.getSourceFile = (name, ...rest) => (name === fileName ? sourceFile : originalGet(name, ...rest));
    return ts.getPreEmitDiagnostics(ts.createProgram([fileName], options, host))
      .filter(d => d.file?.fileName === fileName)
      .map(d => d.code);
  }

  it('typing React: only the marked line fails, with TS2322', () => {
    const src = source('rapid-ts-react');
    expect(diagnoseTsx(src)).toEqual([2322]);
    expect(src).toContain('✗ TS2322');
    expect(diagnoseTsx(src.replace('variant="danger"', 'variant="ghost"'))).toEqual([]);   // a control
  });
});

describe('XSS card: what React escapes and what it blocks, rendered', () => {
  // Compile the card's JSX lines to createElement calls and capture each one.
  const { outputText } = ts.transpileModule(source('xss-csrf'), {
    compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2022 },
  });
  const attack = '<img src=x onerror=alert(1)>';
  const render = (userUrl: string) => {
    const elements = compile('React', 'comment', 'userUrl', '__out', outputText.split('\n').map(line => {
      const m = /^(React\.createElement\(.*\));\s*\/\/.*$/.exec(line);
      return m ? `__out.push(${m[1]});` : line;
    }).join('\n'));
    const out: Parameters<typeof renderToStaticMarkup>[0][] = [];
    elements({ createElement }, attack, userUrl, out);
    return out.map(el => renderToStaticMarkup(el));
  };

  it('{comment} is escaped, dangerouslySetInnerHTML is not', () => {
    const [text, raw] = render('https://example.com');
    expect(text).toBe('<p>&lt;img src=x onerror=alert(1)&gt;</p>');
    expect(raw).toBe(`<div>${attack}</div>`);
  });

  it('React blocks a javascript: href but passes an https: one through', () => {
    const [, , blocked] = render('javascript:alert(1)');
    expect(blocked).toContain('React has blocked a javascript: URL');
    expect(blocked).not.toContain('alert(1)');
    expect(render('https://example.com')[2]).toBe('<a href="https://example.com">profile</a>');
  });
});
