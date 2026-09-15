import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * §8.7 makes precise claims about three production patterns — the back-off
 * series, that a pool keeps exactly N in flight, and that it preserves input
 * order. Claims like those are worth executing rather than asserting.
 */
const md = readFileSync('src/content/javascript-and-typescript/javascript-guide.md', 'utf8');
const block = (marker: string) => {
  const i = md.indexOf(marker);
  const start = md.lastIndexOf('```js\n', i) + 6;
  return md.slice(start, md.indexOf('```', start));
};

describe('§8.7 retry with back-off and jitter', () => {
  it('produces the 300 / 600 / 1200 series and rethrows the original error', async () => {
    vi.useFakeTimers();
    const delays: number[] = [];
    vi.spyOn(globalThis, 'setTimeout').mockImplementation(((cb: () => void, ms: number) => {
      delays.push(ms); cb(); return 0 as unknown as NodeJS.Timeout;
    }) as typeof setTimeout);

    // The block now defines isRetryable itself, so it runs standalone.
    const src = block('function isRetryable(err)');
    type Retry = (fn: () => Promise<unknown>) => Promise<unknown>;
    // eslint-disable-next-line @typescript-eslint/no-implied-eval -- executing the guide's own snippet is the point
    const make = new Function(`${src}; return { retry, isRetryable };`) as () => {
      retry: Retry; isRetryable: (e: unknown) => boolean };
    const { retry, isRetryable } = make();
    expect(isRetryable({ status: 503 }), '503 retryable').toBe(true);
    expect(isRetryable({ status: 404 }), '404 not retryable').toBe(false);
    expect(isRetryable({ status: 429 }), '429 retryable').toBe(true);
    expect(isRetryable({ name: 'AbortError' }), 'abort not retryable').toBe(false);

    const boom = Object.assign(new Error('upstream exploded'), { status: 503 });
    // Math.random pinned to 1 so jitter === delay and the series is visible.
    vi.spyOn(Math, 'random').mockReturnValue(1);
    await expect(retry(() => Promise.reject(boom))).rejects.toBe(boom);
    expect(delays).toEqual([300, 600, 1200]);            // base * factor ** attempt
    vi.restoreAllMocks();
    vi.useRealTimers();
  });
});

describe('§8.7 bounded concurrency pool', () => {
  it('keeps exactly `limit` in flight and preserves input order', async () => {
    const src = block('async function pool(items, limit, worker)');
    // eslint-disable-next-line @typescript-eslint/no-implied-eval -- executing the guide's own snippet is the point
    const make = new Function(`${src}; return pool;`) as () => (
      items: number[], limit: number, w: (n: number) => Promise<number>) => Promise<number[]>;
    const pool = make();

    let inFlight = 0, peak = 0;
    const worker = async (n: number) => {
      inFlight++; peak = Math.max(peak, inFlight);
      await new Promise(r => setTimeout(r, (10 - n) * 2));   // finish out of order
      inFlight--;
      return n * 10;
    };

    const items = [1, 2, 3, 4, 5, 6, 7, 8];
    const out = await pool(items, 3, worker);
    console.log('peak concurrency:', peak, '| output:', out.join(','));
    expect(peak).toBe(3);                                     // never more than the limit
    expect(out).toEqual([10, 20, 30, 40, 50, 60, 70, 80]);    // input order, not finish order
  }, 20000);
});

describe('§8.7 the chunking claim', () => {
  it('a pool beats fixed batches on uneven work', async () => {
    // The guide claims a batch runs at the speed of its slowest member while a
    // pool lets a free worker take the next item. Worth measuring, not asserting.
    const src = block('async function pool(items, limit, worker)');
    // eslint-disable-next-line @typescript-eslint/no-implied-eval -- executing the guide's own snippet is the point
    const make = new Function(`${src}; return pool;`) as () => (
      items: number[], limit: number, w: (n: number) => Promise<number>) => Promise<number[]>;
    const pool = make();

    // One slow item per group of three; the rest are fast.
    const durations = [60, 5, 5, 60, 5, 5, 60, 5, 5];
    const work = async (i: number) => {
      await new Promise(r => setTimeout(r, durations[i]));
      return i;
    };

    const t0 = Date.now();
    await pool(durations.map((_, i) => i), 3, work);
    const poolMs = Date.now() - t0;

    const t1 = Date.now();
    for (let i = 0; i < durations.length; i += 3) {
      await Promise.all([i, i + 1, i + 2].map(work));     // fixed batches
    }
    const batchMs = Date.now() - t1;

    console.log(`pool ${poolMs}ms vs batched ${batchMs}ms`);
    expect(poolMs).toBeLessThan(batchMs);
  }, 20000);
});

describe('§8.7 the AbortController explainer', () => {
  it('signal surface behaves as the guide describes', () => {
    const logs: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-implied-eval -- executing the guide's own snippet is the point
    const fn = new Function('console', block('const controller = new AbortController();')) as (c: unknown) => void;
    fn({ log: (...a: unknown[]) => logs.push(a.join(' ')) });
    expect(logs).toEqual([
      'false',
      'aborted because: user navigated away',
      'true',
    ]);   // and the second abort() emits nothing — idempotent
  });

  it('the guide\'s cancellable sleep rejects with the abort reason', async () => {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval -- executing the guide's own snippet is the point
    const make = new Function(`${block('function sleep(ms, { signal } = {})')}; return sleep;`) as () =>
      (ms: number, o?: { signal?: AbortSignal }) => Promise<void>;
    const sleep = make();

    const ac = new AbortController();
    const reason = new Error('cancelled mid-backoff');
    const pending = sleep(5000, { signal: ac.signal });
    ac.abort(reason);
    await expect(pending).rejects.toBe(reason);

    // And it refuses to start when the signal is already aborted.
    await expect(sleep(5000, { signal: ac.signal })).rejects.toBe(reason);
  });
});

describe('§8.7 the AbortController fetch example', () => {
  it('distinguishes TimeoutError from AbortError', async () => {
    // The guide's central claim here: AbortSignal.timeout does NOT produce an
    // AbortError, so code checking only for that treats a timeout as a failure.
    const slow = new Promise((_, reject) => {
      const signal = AbortSignal.timeout(10);
      // signal.reason is a DOMException: an Error at runtime, but typed loosely.
      signal.addEventListener('abort', () => reject(signal.reason as Error));
    });
    await expect(slow).rejects.toMatchObject({ name: 'TimeoutError' });

    const ac = new AbortController();
    const cancelled = new Promise((_, reject) => {
      ac.signal.addEventListener('abort', () => reject(ac.signal.reason as Error));
    });
    ac.abort();
    await expect(cancelled).rejects.toMatchObject({ name: 'AbortError' });
  });

  it("the guide's handler tells the two apart", () => {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval -- executing the guide's own snippet is the point
    const make = new Function(`${block('function handleBroken(err)')}; return handleFixed;`) as () =>
      (e: { name: string }) => unknown;
    const handleFixed = make();
    expect(handleFixed({ name: 'AbortError' })).toBeNull();
    expect(handleFixed({ name: 'TimeoutError' })).toEqual({ error: 'slow' });
    expect(() => handleFixed({ name: 'TypeError' })).toThrow();
  });
});
