// Runs the TypeScript checker off the main thread. The compiler is ~9 MB of
// JavaScript and the first check takes a second or so; in a worker that costs
// the reader nothing but the wait. Loaded only when a TypeScript challenge runs.
import ts from 'typescript';
import { typeCheckSource } from './typeCheck';

// The ES2022 standard library, as text. Vite inlines each file; the glob is
// eager because the compiler host is synchronous.
const raw = import.meta.glob<string>('/node_modules/typescript/lib/lib.{es5,es20*,decorators*}.d.ts', {
  query: '?raw', import: 'default', eager: true,
});
const libs: Record<string, string> = {};
for (const [path, text] of Object.entries(raw)) libs[path.slice(path.lastIndexOf('/') + 1)] = text;

self.onmessage = (e: MessageEvent<{ id: number; source: string }>) => {
  const { id, source } = e.data;
  try {
    self.postMessage({ id, diagnostics: typeCheckSource(ts, source, libs) });
  } catch (err) {
    self.postMessage({ id, error: err instanceof Error ? err.message : String(err) });
  }
};
