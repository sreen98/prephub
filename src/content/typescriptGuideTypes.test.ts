import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

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
