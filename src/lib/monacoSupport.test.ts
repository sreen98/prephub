import { describe, it, expect, afterEach, vi } from 'vitest';
import { canUseMonaco, MONACO_MEDIA_QUERY } from './monacoSupport';

describe('canUseMonaco', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('is false without matchMedia (jsdom, old browsers), so tests keep the textarea editor', () => {
    vi.stubGlobal('Worker', class {});
    vi.stubGlobal('matchMedia', undefined);
    expect(canUseMonaco()).toBe(false);
  });

  it('is true only when the fine-pointer, tablet-wide query matches and Workers exist', () => {
    const queries: string[] = [];
    vi.stubGlobal('Worker', class {});
    vi.stubGlobal('matchMedia', (q: string) => { queries.push(q); return { matches: true }; });
    expect(canUseMonaco()).toBe(true);
    expect(queries).toEqual([MONACO_MEDIA_QUERY]);

    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    expect(canUseMonaco()).toBe(false);

    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    vi.stubGlobal('Worker', undefined);
    expect(canUseMonaco()).toBe(false);
  });

  it('is false when matchMedia throws', () => {
    vi.stubGlobal('Worker', class {});
    vi.stubGlobal('matchMedia', () => { throw new Error('blocked'); });
    expect(canUseMonaco()).toBe(false);
  });
});
