import type { TypeDiagnostic } from './typeCheck';

// The main-thread side of typeCheck.worker.ts: one worker, created on first
// use and kept for the session, so only the first check pays the start-up.
let worker: Worker | null = null;
let nextId = 0;
const pending = new Map<number, { resolve: (d: TypeDiagnostic[]) => void; reject: (e: Error) => void }>();

function getWorker(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL('./typeCheck.worker.ts', import.meta.url), { type: 'module' });
  worker.onmessage = (e: MessageEvent<{ id: number; diagnostics?: TypeDiagnostic[]; error?: string }>) => {
    const job = pending.get(e.data.id);
    if (!job) return;
    pending.delete(e.data.id);
    if (e.data.error !== undefined) job.reject(new Error(e.data.error));
    else job.resolve(e.data.diagnostics ?? []);
  };
  worker.onerror = (e) => {
    for (const job of pending.values()) job.reject(new Error(e.message || 'Type checker failed to load'));
    pending.clear();
    worker = null;
  };
  return worker;
}

/** Type-check a snippet with the real TypeScript compiler, off the main thread. */
export function checkTypes(source: string): Promise<TypeDiagnostic[]> {
  return new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    getWorker().postMessage({ id, source });
  });
}
