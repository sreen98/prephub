import { describe, it, expect } from 'vitest';
import { buildReactScope, scopeNames } from './playgroundScope';

describe('playground React scope', () => {
  const scope = buildReactScope(() => {});

  it('injects every name a guide snippet may use unimported', () => {
    // Guide blocks run verbatim through `new Function(...names, src)`, so a name
    // missing here is a ReferenceError behind a "Try it" button. Every one of
    // these was reported by a reader hitting exactly that.
    for (const name of [
      'React', 'useState', 'useEffect', 'useRef', 'useMemo', 'useCallback',
      'useReducer', 'useContext', 'createContext', 'memo', 'Fragment',
      'Suspense', 'Activity', 'useEffectEvent', 'use', 'useOptimistic',
      'useActionState', 'useTransition', 'useDeferredValue', 'useId',
      'useSyncExternalStore', 'useLayoutEffect', 'useImperativeHandle',
      'lazy', 'forwardRef', 'startTransition', 'StrictMode', 'Profiler',
      'createPortal', 'flushSync', 'render',
    ]) {
      expect(scope, `${name} must be in playground scope`).toHaveProperty(name);
      expect(scope[name], `${name} must not be undefined`).toBeDefined();
    }
  });

  it('carries every public React export, so a React upgrade needs no edit here', () => {
    // The point of deriving rather than hand-listing: `Activity` and
    // `useEffectEvent` were missing for months because someone had to remember.
    const missing = Object.keys(React_exports()).filter(
      (n) => !n.startsWith('__') && n !== 'version' && !(n in scope),
    );
    expect(missing).toEqual([]);
  });

  it('excludes internals and `version`', () => {
    // `version` would shadow a plausible user variable; `__`-prefixed exports
    // are not things a snippet should reach for.
    expect(scope).not.toHaveProperty('version');
    expect(Object.keys(scope).filter((n) => n.startsWith('__'))).toEqual([]);
  });

  it('has no undefined entry', () => {
    for (const [name, value] of Object.entries(scope)) {
      expect(value, `${name} resolved to undefined`).toBeDefined();
    }
  });

  it('derives the stripped-import warning from the same list', () => {
    const message = scopeNames();
    expect(message).toContain('React');
    expect(message).toContain('useState');
    expect(message).toContain('createPortal');
    expect(message).toMatch(/are already in scope\.$/);
  });
});

// Imported indirectly so the assertion above compares against the real module.
function React_exports(): Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return { ...(require('react') as Record<string, unknown>) };
}
