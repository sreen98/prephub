import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { stripModuleSyntax } from '../lib/playgroundRunner';

/**
 * The TypeScript guide's claims are CLAIMS ABOUT THE COMPILER, so check them
 * with the compiler. Both `NoInfer` examples shipped without the
 * `extends string` constraint, which meant `T` widened to `string`, nothing
 * was narrower than anything else, and **neither example produced the error
 * it claimed** — `NoInfer` looked like a no-op. No existing gate could see it:
 * the blocks parse, and they are prose rather than playground templates.
 */
const GUIDE = 'src/content/javascript-and-typescript/typescript-guide.md';

/** Type-check a snippet in memory and return its diagnostic messages. */
function diagnose(source: string): string[] {
  const fileName = 'snippet.ts';
  const options: ts.CompilerOptions = {
    strict: true,
    target: ts.ScriptTarget.ES2022,
    noEmit: true,
    skipLibCheck: true,
    lib: ['lib.es2023.d.ts'],
  };
  const sourceFile = ts.createSourceFile(fileName, source, ts.ScriptTarget.ES2022, true);
  const host = ts.createCompilerHost(options, true);
  const originalGet = host.getSourceFile.bind(host);
  host.getSourceFile = (name, ...rest) =>
    name === fileName ? sourceFile : originalGet(name, ...rest);
  const program = ts.createProgram([fileName], options, host);
  return ts
    .getPreEmitDiagnostics(program)
    .filter(d => d.file?.fileName === fileName)
    .map(d => ts.flattenDiagnosticMessageText(d.messageText, ' '));
}

describe('TypeScript guide — type-level claims, checked by the compiler', () => {
  const md = readFileSync(GUIDE, 'utf8');
  /** The fenced `ts` block containing `marker`. */
  const block = (marker: string) => {
    const at = md.indexOf(marker);
    expect(at, `marker not found: ${marker}`).toBeGreaterThan(-1);
    const start = md.lastIndexOf('```ts\n', at) + 6;
    return md.slice(start, md.indexOf('```', start));
  };

  it('the compiler agrees with itself — a control', () => {
    expect(diagnose('const n: number = "x";')).toEqual([
      `Type 'string' is not assignable to type 'number'.`,
    ]);
    expect(diagnose('const n: number = 1;')).toEqual([]);
  });

  it.each([
    ['§10.7', 'function createState2<T extends string>(initial: T, options: NoInfer<T>[])'],
    ['tricky Q18', 'function createState2<T extends string>(initial: T, allowed: NoInfer<T>[])'],
  ])('%s: NoInfer rejects the value that is not the inferred literal', (_label, marker) => {
    const src = block(marker).replace(/\{ \/\* … \*\/ \}/g, '{}');
    expect(diagnose(src)).toEqual([
      `Type '"light"' is not assignable to type '"dark"'.`,
    ]);
  });

  it('§3.3: an interface can extend a type alias, and a type can intersect an interface', () => {
    expect(diagnose(block('interface Dog extends Animal { breed: string }'))).toEqual([]);
  });

  it('§3.3: extends REJECTS an incompatible override; & silently yields never', () => {
    const src = block('interface IAdmin extends IUser { id: string }')
      // The block's comments spell out the expected diagnostics; assert them.
      + '\ndeclare const a: TAdmin;\nconst probe: never = a.id;\nvoid probe;\n';
    const diags = diagnose(src);
    // Exactly one error: the interface override. The `&` version is accepted,
    // and `TAdmin['id']` being assignable to `never` proves it collapsed.
    expect(diags).toHaveLength(1);
    expect(diags[0]).toContain(`Interface 'IAdmin' incorrectly extends interface 'IUser'.`);
    expect(diags[0]).toContain(`Type 'string' is not assignable to type 'number'.`);
  });

  it('§8.2: Pick cannot select union members, Exclude cannot drop properties', () => {
    const src = block("type Kept = Extract<Letters, 'a' | 'c'>;");
    // Everything uncommented must compile; the two failures are shown commented out.
    expect(diagnose(src)).toEqual([]);
    // The commented-out Pick really does fail, for the documented reason.
    const failing = diagnose("type Letters = 'a' | 'b' | 'c';\ntype Nope = Pick<Letters, 'a'>;");
    expect(failing).toHaveLength(1);
    expect(failing[0]).toContain(`Type '"a"' does not satisfy the constraint`);
    // Exclude on an object type filters by assignability, so the guide's own
    // example must collapse to never — asserted against the block, not a copy.
    const objBlock = block('type Oops = Exclude<User, { id: number }>;');
    expect(diagnose(objBlock + '\nconst probe: never = 0 as unknown as Oops;\nvoid probe;\n')).toEqual([]);
  });

  it('§8.2: Omit is literally Pick + Exclude, and does not validate its keys', () => {
    expect(diagnose(`
      type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
      type Expect<T extends true> = T;
      type User = { id: number; name: string; email: string };
      type MyOmit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
      type _Same = Expect<Equal<MyOmit<User, 'email'>, Omit<User, 'email'>>>;
      type _Unchecked = Expect<Equal<Omit<User, 'nope'>, User>>;
    `)).toEqual([]);
    // ...while Pick DOES validate them.
    const p = diagnose(`
      type User = { id: number; name: string };
      type A = Pick<User, 'nope'>;
    `);
    expect(p).toHaveLength(1);
    expect(p[0]).toContain(`does not satisfy the constraint 'keyof User'`);
  });

  it('Q10: `as const` makes assignment a COMPILE error, and emits nothing', () => {
    // The guide's block claims TS2540 on the assignment.
    const diags = diagnose(block("cfg.port = 4000;"));
    expect(diags).toHaveLength(1);
    expect(diags[0]).toBe(`Cannot assign to 'port' because it is a read-only property.`);

    // ...and that the emitted JavaScript keeps neither the assertion nor a guard,
    // which is why running it mutates happily. Transpile-only, no type check.
    const js = ts.transpileModule(`const cfg = { port: 3000 } as const;\ncfg.port = 4000;`, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    }).outputText;
    expect(js).toContain('const cfg = { port: 3000 };');
    expect(js).not.toContain('as const');
    expect(js).not.toContain('freeze');
  });

  it('Q10: `as const` is deep, `Readonly<T>` is shallow', () => {
    expect(diagnose(`
      const nested = { db: { port: 5432 } } as const;
      nested.db.port = 1;
    `)).toEqual([`Cannot assign to 'port' because it is a read-only property.`]);
    expect(diagnose(`
      declare const sh: Readonly<{ db: { port: number } }>;
      sh.db.port = 1;
    `)).toEqual([]);
  });

  it('Q16: the typed emitter enforces every arity and payload claim', () => {
    const emitter = block('class TypedEmitter<Events extends Record<string, unknown>>');
    // The block itself must be clean...
    expect(diagnose(emitter)).toEqual([]);
    // ...and each rejection the answer promises must actually happen.
    const cases: [string, string | null][] = [
      ["emitter.emit('click');", 'Expected 2 arguments, but got 1.'],
      ["emitter.emit('load', { x: 1 });", 'Expected 1 arguments, but got 2.'],
      ["emitter.on('click', (p) => { p.z; });", `Property 'z' does not exist`],
      ["emitter.on('nope', () => {});", `Argument of type '"nope"' is not assignable`],
      // Guards `K extends keyof Events` on emit. A bare `emit('nope')` does NOT
      // discriminate — it fails on arity either way — so pass the payload.
      ["emitter.emit('nope', { x: 1 });", `Argument of type '"nope"' is not assignable`],
    ];
    for (const [line, expected] of cases) {
      const diags = diagnose(`${emitter}
${line}`);
      expect(diags, line).toHaveLength(1);
      if (expected) expect(diags[0], line).toContain(expected);
    }
    // Guards the CONDITIONAL handler type: 'load' carries no payload, so a
    // handler that declares a parameter must be rejected. Without the
    // conditional the type is `(payload: undefined) => void`, which happily
    // accepts both arities and the claim becomes unobservable.
    const loadWithParam = diagnose(`${emitter}
emitter.on('load', (p: number) => { void p; });`);
    expect(loadWithParam).toHaveLength(1);
    expect(loadWithParam[0]).toContain('Target signature provides too few arguments');

    // And a correctly-shaped handler is accepted.
    expect(diagnose(`${emitter}
emitter.on('click', (p) => { void p.x; void p.y; });`)).toEqual([]);
  });

  it('without the constraint there is no error at all — the bug being guarded', () => {
    expect(diagnose(`
      function createState2<T>(initial: T, options: NoInfer<T>[]) { void initial; void options; }
      createState2('dark', ['light', 'dark']);
    `)).toEqual([]);
  });

  it('the constraint is what preserves the literal type', () => {
    // Unconstrained: T widens to string, so any string is accepted.
    expect(diagnose(`
      function f<T>(initial: T, options: T[]): T { void options; return initial; }
      const r = f('dark', ['light', 'dark']);
      const probe: typeof r = 'anything at all';
      void probe;
    `)).toEqual([]);
    // Constrained: T is the union of the literal candidates.
    expect(diagnose(`
      function f<T extends string>(initial: T, options: T[]): T { void options; return initial; }
      const r = f('dark', ['light', 'dark']);
      const probe: typeof r = 'anything at all';
      void probe;
    `)).toEqual([
      `Type '"anything at all"' is not assignable to type '"dark" | "light"'.`,
    ]);
  });
});

/**
 * Tricky Q20–Q31 follow one convention: every compile error is a commented line
 * ending in `// ✗ TSnnnn: …`, so the block RUNS in the playground (which strips
 * types without checking them) and shows its real output, while the comment
 * shows what `tsc` says. Three claims per block, all checked mechanically:
 *   1. as written, it type-checks with no errors;
 *   2. uncommenting each ✗ line produces exactly that TS error code;
 *   3. compiled and run, it prints exactly the Output block that follows it.
 */
describe('TypeScript guide tricky Q20–Q31 — errors and outputs, checked', () => {
  const md = readFileSync(GUIDE, 'utf8');
  const DOM_LIB = ['lib.es2023.d.ts', 'lib.dom.d.ts'];

  function codes(source: string): number[] {
    const fileName = 'snippet.ts';
    const options: ts.CompilerOptions = { strict: true, target: ts.ScriptTarget.ES2022, noEmit: true, skipLibCheck: true, lib: DOM_LIB };
    const sourceFile = ts.createSourceFile(fileName, source, ts.ScriptTarget.ES2022, true);
    const host = ts.createCompilerHost(options, true);
    const originalGet = host.getSourceFile.bind(host);
    host.getSourceFile = (name, ...rest) => (name === fileName ? sourceFile : originalGet(name, ...rest));
    const program = ts.createProgram([fileName], options, host);
    return ts.getPreEmitDiagnostics(program).filter((d) => d.file?.fileName === fileName).map((d) => d.code);
  }

  /** The ts block containing `marker`, and the text block that follows it. */
  function blockAndOutput(marker: string): { code: string; output: string[] } {
    const at = md.indexOf(marker);
    if (at < 0) throw new Error('marker not found: ' + marker);
    if (md.indexOf(marker, at + 1) >= 0) throw new Error('marker is not unique: ' + marker);
    const start = md.lastIndexOf('```ts\n', at) + 6;
    const end = md.indexOf('\n```', at);
    const outStart = md.indexOf('```text\n', end) + 8;
    const output = md.slice(outStart, md.indexOf('\n```', outStart)).split('\n');
    return { code: md.slice(start, end), output };
  }

  function run(code: string): string[] {
    const js = ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
    const logs: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-implied-eval -- running the guide's own snippet is the point
    new Function('console', js)({ log: (...a: unknown[]) => { logs.push(a.map(String).join(' ')); } });
    return logs;
  }

  it.each([
    ['Q20', 'const n = input as number;'],
    ['Q21', "  #secret = 'hidden';"],
    ['Q22', 'const pet: Cat = new Robot();'],
    ['Q23', 'function sum(p: Point) {'],
    ['Q24', 'const third = names[2];'],
    ['Q25', 'const cb: Callback = () => 42;'],
    ['Q26', 'function size(value: string[] | null) {'],
    ['Q27', 'type KeysOfEither = keyof (Book | Product);'],
    ['Q28', "JSON.parse('{bad json');"],
    ['Q29', 'function parse(input: string): number;'],
    ['Q30', 'type WithOptional = { nickname?: string };'],
    ['Q31', 'function laterReassigned(input: string | undefined) {'],
  ])('%s', (_label, marker) => {
    const { code, output } = blockAndOutput(marker);

    expect(codes(code), 'the block as written must type-check').toEqual([]);

    const lines = code.split('\n');
    lines.forEach((line, i) => {
      const m = /^(\s*)\/\/ (.*?)\s+\/\/ ✗ TS(\d+):/.exec(line);
      if (!m) return;
      const probe = [...lines];
      probe[i] = m[1] + m[2];
      expect(codes(probe.join('\n')), `uncommenting line ${i + 1} must give TS${m[3]}`).toContain(Number(m[3]));
    });

    expect(run(code)).toEqual(output);
  });
});

/**
 * Tricky Q1–Q19 predate the ✗ convention and used to leave error lines ACTIVE:
 * Q13's `a.foo.bar` / `b.foo.bar` threw a TypeError the moment a reader pressed
 * Try it (the playground strips types without checking them), and Q3's second
 * block called a `start()` that only existed in the block above. This pins the
 * converted state for every ts block in Q1–Q19:
 *   - it RUNS without throwing once types are stripped (what Try it does);
 *   - its compile errors are exactly the lines annotated `// ✗ TSnnnn`;
 *   - each COMMENTED ✗ line produces its code when uncommented.
 */
describe('TypeScript guide tricky Q1–Q19 — runnable, with every error annotated', () => {
  const md = readFileSync(GUIDE, 'utf8');
  const trickyStart = md.indexOf('## 16. Tricky Output Questions');
  const region = md.slice(trickyStart, md.indexOf('**Q20:', trickyStart));

  // Blocks whose diagnostics are artefacts of checking a snippet on its own, not
  // guide errors. Keyed "Q<n>#<block index within the question>".
  const HARNESS_ARTEFACTS: Record<string, string> = {
    'Q5#1': 'continues Q5 block 0: Shape is declared there',
    'Q8#1': 'deliberately re-declares the lib types Required and Readonly to show how they work',
    'Q13#1': 'continues Q13 block 0: b is declared there',
    'Q16#1': 'declares `type Event`, which only clashes with the DOM lib when checked as a global script',
    'Q18#0': 'the "?" lines are the question; the Output block gives the answer, pinned by the NoInfer test above',
  };

  function check(source: string): { line: number; code: number }[] {
    const fileName = 'snippet.ts';
    const options: ts.CompilerOptions = { strict: true, target: ts.ScriptTarget.ES2022, noEmit: true, skipLibCheck: true, lib: ['lib.es2023.d.ts', 'lib.dom.d.ts'] };
    const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.ES2022, true);
    const host = ts.createCompilerHost(options, true);
    const originalGet = host.getSourceFile.bind(host);
    host.getSourceFile = (name, ...rest) => (name === fileName ? sf : originalGet(name, ...rest));
    const program = ts.createProgram([fileName], options, host);
    return ts.getPreEmitDiagnostics(program)
      .filter((d) => d.file?.fileName === fileName && d.start !== undefined)
      .map((d) => ({ line: sf.getLineAndCharacterOfPosition(d.start!).line + 1, code: d.code }));
  }

  const blocks: { key: string; code: string }[] = [];
  const re = /\*\*Q(\d+):|```ts\n([\s\S]*?)```/g;
  let q = '', index = 0;
  for (let m = re.exec(region); m; m = re.exec(region)) {
    if (m[1]) { q = m[1]; index = 0; continue; }
    blocks.push({ key: `Q${q}#${index++}`, code: m[2] });
  }

  it('finds the blocks', () => {
    expect(blocks.length).toBeGreaterThan(30);
  });

  it.each(blocks.map((b) => [b.key, b.code] as const))('%s', (key, code) => {
    // 1. Try it: strip import/export the way the playground does, strip types, run. It must not throw.
    const js = ts.transpileModule(stripModuleSyntax(code).code, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
    // eslint-disable-next-line @typescript-eslint/no-implied-eval -- running the guide's own snippet is the point
    expect(() => new Function('console', js)({ log: () => {} }), `${key} must run once types are stripped`).not.toThrow();

    if (key in HARNESS_ARTEFACTS) return;

    // 2. Active ✗ annotations are exactly the compile errors.
    const lines = code.split('\n');
    const expected = lines
      .map((line, i) => ({ line: i + 1, m: /^\s*[^/\s].*\/\/ ✗ TS(\d+):/.exec(line) }))
      .filter((x) => x.m)
      .map((x) => ({ line: x.line, code: Number(x.m![1]) }));
    expect(check(code), `${key}: compile errors must match its active ✗ annotations`).toEqual(expected);

    // 3. Commented ✗ lines produce their code when uncommented.
    lines.forEach((line, i) => {
      const m = /^(\s*)\/\/ (.*?)\s+\/\/ ✗ TS(\d+):/.exec(line);
      if (!m) return;
      const probe = [...lines];
      probe[i] = m[1] + m[2];
      expect(check(probe.join('\n')).map((d) => d.code), `${key} line ${i + 1}`).toContain(Number(m[3]));
    });
  });
});
