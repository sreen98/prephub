/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

/**
 * Minimal surface for `@babel/standalone`, which ships no types. Only the two
 * things the playground actually calls are declared — a wider `any` here would
 * silently accept typos in the option bag, which is the whole reason the
 * playground once compiled JSX with the wrong preset.
 */
declare module '@babel/standalone' {
  export interface TransformOptions {
    presets?: (string | [string, Record<string, unknown>])[];
    plugins?: (string | [string, Record<string, unknown>])[];
    filename?: string;
    sourceType?: 'script' | 'module' | 'unambiguous';
    [option: string]: unknown;
  }
  export interface TransformResult {
    code: string;
  }
  export function transform(code: string, options: TransformOptions): TransformResult;
  const babel: { transform: typeof transform };
  export default babel;
}

interface Window {
  gtag: (...args: unknown[]) => void;
}
