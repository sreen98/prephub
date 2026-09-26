import type * as TS from 'typescript';

/**
 * Type-check a snippet in memory. The playground's normal path transpiles with
 * Babel, which STRIPS types without checking them, so a TypeScript challenge
 * whose whole point is a type ("make this reject a wrong key") could never fail
 * there. This runs the real TypeScript checker over the reader's code.
 *
 * Pure: the compiler and the lib .d.ts texts are passed in, so the same code
 * runs in the browser worker (typeCheck.worker.ts) and in plain Node tests.
 */
export interface TypeDiagnostic {
  line: number;
  column: number;
  code: number;
  message: string;
}

/**
 * The runtime globals a snippet may use. The standard ES libs have no
 * `console` or timers (those live in the DOM lib, which is huge and would also
 * let a snippet type-check against APIs the Worker does not have).
 */
export const PRELUDE = `
declare var console: { log(...data: any[]): void; info(...data: any[]): void; warn(...data: any[]): void; error(...data: any[]): void; table(...data: any[]): void };
declare function setTimeout(handler: (...args: any[]) => void, timeout?: number, ...args: any[]): number;
declare function clearTimeout(id: number | undefined): void;
declare function setInterval(handler: (...args: any[]) => void, timeout?: number, ...args: any[]): number;
declare function clearInterval(id: number | undefined): void;
declare function queueMicrotask(callback: () => void): void;
declare function structuredClone<T>(value: T): T;
`;

const FILE = 'challenge.ts';
const PRELUDE_FILE = 'prelude.d.ts';

export const COMPILER_OPTIONS: TS.CompilerOptions = {
  strict: true,
  noEmit: true,
  target: 9 /* ES2022 */,
  lib: ['lib.es2022.d.ts'],
  types: [],
  noUnusedLocals: false,
  exactOptionalPropertyTypes: false,
};

export function typeCheckSource(
  ts: typeof TS, source: string, libs: Record<string, string>,
): TypeDiagnostic[] {
  const files = new Map<string, string>([[FILE, source], [PRELUDE_FILE, PRELUDE], ...Object.entries(libs)]);
  const cache = new Map<string, TS.SourceFile>();
  const host: TS.CompilerHost = {
    getSourceFile: (name, version) => {
      const text = files.get(name.replace(/^\/+/, ''));
      if (text === undefined) return undefined;
      let sf = cache.get(name);
      if (!sf) { sf = ts.createSourceFile(name, text, version); cache.set(name, sf); }
      return sf;
    },
    getDefaultLibFileName: () => 'lib.es2022.d.ts',
    writeFile: () => {},
    getCurrentDirectory: () => '',
    getDirectories: () => [],
    fileExists: (name) => files.has(name.replace(/^\/+/, '')),
    readFile: (name) => files.get(name.replace(/^\/+/, '')),
    getCanonicalFileName: (name) => name,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n',
  };
  const program = ts.createProgram({ rootNames: [FILE, PRELUDE_FILE], options: COMPILER_OPTIONS, host });
  const sf = program.getSourceFile(FILE);
  const diags = [...program.getSyntacticDiagnostics(sf), ...program.getSemanticDiagnostics(sf)];
  return diags.map((d) => {
    const pos = d.file && d.start !== undefined ? d.file.getLineAndCharacterOfPosition(d.start) : { line: 0, character: 0 };
    return { line: pos.line + 1, column: pos.character + 1, code: d.code, message: ts.flattenDiagnosticMessageText(d.messageText, '\n') };
  });
}

/** Console lines for the output panel. ❌ per error so the run tally counts them. */
export function describeTypeDiagnostics(diags: TypeDiagnostic[]): string[] {
  if (diags.length === 0) return ['✅ Type check: no type errors'];
  return diags.map((d) => `❌ Type error TS${d.code} (line ${d.line}): ${d.message}`);
}
