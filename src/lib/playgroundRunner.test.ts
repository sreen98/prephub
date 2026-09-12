import { describe, it, expect } from 'vitest';
import { stripModuleSyntax, detectJSX, detectTS, formatValue, transpileSource, formatConsoleArgs } from './playgroundRunner';

/**
 * `stripModuleSyntax` exists because the playground executes code with
 * `new Function`, which is a *script* — an `import` statement there is a hard
 * SyntaxError. So pasting real-world React code (`import React from 'react'`)
 * used to fail outright. The regexes must be line-anchored: dynamic `import()`
 * and the word "import" inside a comment or string have to survive.
 */
describe('stripModuleSyntax — removes module syntax', () => {
  it.each([
    ["import React from 'react';\nconst a = 1;", 'default import'],
    ["import { useState } from 'react';\nconst a = 1;", 'named import'],
    ["import * as R from 'react';\nconst a = 1;", 'namespace import'],
    ["import './styles.css';\nconst a = 1;", 'side-effect import'],
    ["export const a = 1;", 'export const'],
    ["export default function App() {}", 'export default function'],
    ["export { a, b };\nconst a = 1;", 'export list'],
  ])('strips %j (%s)', (code) => {
    const { code: out, stripped } = stripModuleSyntax(code);
    expect(stripped).toBe(true);
    expect(out).not.toMatch(/^\s*import\s+[\w{*]/m);
    expect(out).not.toMatch(/^\s*export\s+(?:const|\{|\*)/m);
  });

  it('keeps the declaration when removing `export default`', () => {
    const { code } = stripModuleSyntax('export default function App() { return 1; }');
    expect(code).toContain('function App()');
  });
});

describe('stripModuleSyntax — leaves these alone', () => {
  it('preserves a dynamic import()', () => {
    const src = "const m = await import('./x.js');";
    const { code, stripped } = stripModuleSyntax(src);
    expect(code).toBe(src);
    expect(stripped).toBe(false);
  });

  it('preserves the word import inside a string', () => {
    const src = `const msg = "import React from 'react'";`;
    expect(stripModuleSyntax(src).code).toBe(src);
  });

  it('preserves an import mentioned in a comment', () => {
    const src = "// import React from 'react'\nconst a = 1;";
    expect(stripModuleSyntax(src).code).toBe(src);
  });

  it('reports stripped=false for code with no module syntax', () => {
    expect(stripModuleSyntax('const a = 1;').stripped).toBe(false);
  });
});

describe('detectJSX', () => {
  it.each([
    ['const a = <div>hi</div>;', true],
    ['render(<App />);', true],
    ['function C() { return <p>x</p>; }', true],
    ['const a = 1 < 2;', false],
    ['const a = "hello";', false],
  ])('%j → %s', (code, want) => expect(detectJSX(code)).toBe(want));
});

describe('detectTS', () => {
  it.each([
    ['interface Props { a: string }', true],
    ['type X = { a: number };', true],
    ['const a: string = "x";', true],
    ['const a = 1;', false],
  ])('%j → %s', (code, want) => expect(detectTS(code)).toBe(want));

  /**
   * The reported bug: a parameter annotated with a custom or namespaced type.
   * The old implementation matched only a fixed list of builtin type names
   * after a colon, so this compiled as plain JSX and died with
   * `Unexpected token, expected ","` — on a pattern that appears in nearly
   * every real React component.
   */
  it.each([
    ['(e: React.FormEvent) => {}', 'namespaced parameter type'],
    ['function f(props: Props) {}', 'custom parameter type'],
    ['const g = (user: User) => user.name;', 'custom type in an arrow'],
    ['function f(a?: Config) {}', 'optional parameter'],
    ['function f(): Promise<void> {}', 'return annotation'],
    ['const x = y as Widget;', 'assertion to a custom type'],
    ['const cfg = {} satisfies Config;', 'satisfies'],
    ['class A { private x = 1; }', 'member modifier'],
    ['function identity<T>(v: T) { return v; }', 'generic function'],
  ])('detects %j (%s)', (code) => expect(detectTS(code)).toBe(true));

  it.each([
    ['const o = { a: 1, color: "red" };', 'object literal'],
    ['const x = cond ? 1 : 2;', 'ternary'],
    ['outer: for (;;) break outer;', 'label'],
    ['console.log(/a:b/.test("a:b"));', 'regex containing a colon'],
  ])('does not misfire on %j (%s)', (code) => expect(detectTS(code)).toBe(false));
});

describe('formatValue — what the playground console prints', () => {
  it('names null and undefined explicitly', () => {
    expect(formatValue(null)).toBe('null');
    expect(formatValue(undefined)).toBe('undefined');
  });

  it('prints a string as-is, without quotes', () => {
    expect(formatValue('hi')).toBe('hi');
  });

  it('describes a function by name', () => {
    expect(formatValue(function foo() {})).toBe('[Function: foo]');
  });

  it('renders an Error as name: message', () => {
    expect(formatValue(new TypeError('bad'))).toBe('TypeError: bad');
  });

  it('pretty-prints objects', () => {
    expect(formatValue({ a: 1 })).toBe('{\n  "a": 1\n}');
  });

  it('survives a circular structure instead of throwing', () => {
    const c: Record<string, unknown> = {};
    c.self = c;
    expect(() => formatValue(c)).not.toThrow();
    expect(formatValue(c)).toContain('object');
  });
});


describe('transpileSource — TypeScript is always handled', () => {
  /**
   * The exact snippet from the bug report. It failed with
   * `SyntaxError: /playground.jsx: Unexpected token, expected "," (5:25)`
   * because `(e: React.FormEvent)` was not recognised as TypeScript, so the
   * file was compiled as plain JSX. The TypeScript preset is now applied
   * unconditionally — TS is a superset of JS, so there is nothing to detect.
   */
  const REPORTED = `function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}

render(<LoginForm />);`;

  it('compiles a component with a namespaced parameter type', async () => {
    const out = await transpileSource(REPORTED, { jsx: detectJSX(REPORTED) });
    expect(out).toBeTruthy();
    expect(out).not.toContain('React.FormEvent');      // the annotation was stripped
    expect(out).toContain('LoginForm');
  });

  it.each([
    ['custom parameter type', 'function f(p: Props) { return p; }'],
    ['optional parameter', 'function f(a?: Config) { return a; }'],
    ['return annotation', 'function f(): number { return 1; }'],
    ['generic function', 'function id<T>(v: T) { return v; }'],
    ['satisfies', 'const c = { a: 1 } satisfies Record<string, number>;'],
  ])('compiles %s', async (_label, code) => {
    await expect(transpileSource(code, { jsx: false })).resolves.toBeTruthy();
  });

  it.each([
    ['object literal', 'const o = { a: 1, color: "red" };'],
    ['ternary', 'const x = true ? 1 : 2;'],
    ['class fields', 'class A { x = 1; static s = 2; }'],
    ['generator', 'function* g() { yield 1; }'],
    ['optional chaining', 'const v = ({}).a?.b ?? 0;'],
  ])('leaves plain JS working: %s', async (_label, code) => {
    await expect(transpileSource(code, { jsx: false })).resolves.toBeTruthy();
  });

  it('still compiles JSX without any TypeScript in it', async () => {
    const out = await transpileSource('const a = <p>hi</p>;', { jsx: true });
    expect(out).toContain('createElement');
  });
});

describe('formatConsoleArgs — console format specifiers', () => {
  it('substitutes %s, which is how React logs component stacks', () => {
    // The exact shape that produced a bare "%s" line in the panel.
    expect(formatConsoleArgs(['The above error occurred in the %s component:', 'Child']))
      .toBe('The above error occurred in the Child component:');
  });

  it('substitutes %o / %O with the formatted value', () => {
    expect(formatConsoleArgs(['got %o', { a: 1 }])).toContain('a');
    expect(formatConsoleArgs(['got %o', { a: 1 }])).not.toContain('%o');
  });

  it('%d and %i truncate, %f does not', () => {
    expect(formatConsoleArgs(['%d %i %f', 3.7, 3.7, 3.7])).toBe('3 3 3.7');
  });

  it('%c consumes its style argument and prints nothing for it', () => {
    expect(formatConsoleArgs(['%cstyled', 'color: red'])).toBe('styled');
  });

  it('%% is a literal percent', () => {
    expect(formatConsoleArgs(['100%% done'])).toBe('100% done');
  });

  it('extra arguments are appended, as a real console does', () => {
    expect(formatConsoleArgs(['%s and', 'a', 'b'])).toBe('a and b');
  });

  it('a specifier with no argument left is preserved verbatim', () => {
    expect(formatConsoleArgs(['%s %s', 'only-one'])).toBe('only-one %s');
  });

  it('leaves ordinary multi-argument logs alone', () => {
    expect(formatConsoleArgs(['count', 1, true])).toBe('count 1 true');
  });

  it('a bare percent that is not a specifier is untouched', () => {
    expect(formatConsoleArgs(['50% of 3 items'])).toBe('50% of 3 items');
  });
});
