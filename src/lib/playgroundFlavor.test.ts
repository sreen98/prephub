import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { safeSet, setJSON } from './storage';
import { allTemplates } from '../data/playground/templateIndex';
import { FLAVORS, flavorForCode, lastSessionFor, resolveInitialPlaygroundState } from './playgroundFlavor';

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() { return map.size; },
    clear: () => map.clear(),
    getItem: (k: string) => map.get(k) ?? null,
    key: (i: number) => [...map.keys()][i] ?? null,
    removeItem: (k: string) => { map.delete(k); },
    setItem: (k: string, v: string) => { map.set(k, v); },
  };
}

const firstJs = allTemplates.find((t) => t.tag === 'JS')!;
const firstReact = allTemplates.find((t) => t.tag === 'React')!;
const aReactChallenge = allTemplates.find((t) => t.tag === 'React' && t.kind === 'challenge')!;
const aJsChallenge = allTemplates.find((t) => t.tag === 'JS' && t.kind === 'challenge')!;

describe('JavaScript and React playgrounds', () => {
  beforeEach(() => {
    const local = memoryStorage(), session = memoryStorage();
    vi.stubGlobal('window', { localStorage: local, sessionStorage: session });
  });
  afterEach(() => { vi.unstubAllGlobals(); });

  it('each playground offers only its own blank starters', () => {
    expect(FLAVORS.js.starters.map((s) => s.lang)).toEqual(['js', 'ts']);
    expect(FLAVORS.react.starters.map((s) => s.lang)).toEqual(['jsx']);
  });

  it('a first visit opens the flavor\'s own first template', () => {
    expect(resolveInitialPlaygroundState('js').selectedName).toBe(firstJs.name);
    expect(resolveInitialPlaygroundState('react').selectedName).toBe(firstReact.name);
  });

  it('each playground resumes its own last session, with the saved draft', () => {
    safeSet(FLAVORS.js.lastSessionKey, aJsChallenge.name);
    safeSet(FLAVORS.react.lastSessionKey, aReactChallenge.name);
    setJSON('playground-progress', { [aReactChallenge.name]: { code: 'my react draft' } });
    expect(resolveInitialPlaygroundState('js')).toMatchObject({ selectedName: aJsChallenge.name, needsCode: aJsChallenge.name });
    expect(resolveInitialPlaygroundState('react')).toMatchObject({ selectedName: aReactChallenge.name, code: 'my react draft', needsCode: null });
  });

  // Before the split there was one key. A React template in it must not open in
  // the JavaScript playground, and must still be the React user's resume point.
  it('the pre-split key is inherited by the React playground and ignored by the JS one', () => {
    safeSet('playground-last-session', aReactChallenge.name);
    expect(lastSessionFor('react')).toBe(aReactChallenge.name);
    expect(resolveInitialPlaygroundState('react').selectedName).toBe(aReactChallenge.name);
    expect(resolveInitialPlaygroundState('js').selectedName).toBe(firstJs.name);
  });

  it('a draft saved with the old problem header opens without it', () => {
    safeSet(FLAVORS.js.lastSessionKey, aJsChallenge.name);
    setJSON('playground-progress', { [aJsChallenge.name]: { code: '// ===== CHALLENGE: X =====\n// old statement\n\nfunction mine() {}' } });
    expect(resolveInitialPlaygroundState('js').code).toBe('function mine() {}');
  });

  it('a Try it handoff wins over the last session', () => {
    safeSet('playground-code', 'console.log(1)', 'session');
    expect(resolveInitialPlaygroundState('js')).toMatchObject({ code: 'console.log(1)', selectedName: null });
  });

  it('routes a snippet by whether it is React', () => {
    expect(flavorForCode('const x = [1, 2].map((n) => n * 2);')).toBe('js');
    expect(flavorForCode('function App() { return <div>Hi</div>; }\nrender(<App />);')).toBe('react');
  });
});
