import React from 'react';
import { createPortal, flushSync } from 'react-dom';

/**
 * The names a playground snippet can use without importing anything.
 *
 * The playground executes user code through `new Function(...names, src)`, so
 * anything a guide snippet references must be handed in here — a bare
 * `<Activity>` or `useEffectEvent` is a `ReferenceError` otherwise, and the
 * "Try it" button on that guide block is then guaranteed to fail.
 *
 * **This is derived from React's own exports, not hand-listed.** The hand-written
 * version held eleven names and shipped for months while the guide taught
 * `<Activity>`, `useEffectEvent`, `use`, `useOptimistic` and `useActionState` —
 * every one of those examples was unrunnable, and each was found one reader
 * report at a time. Deriving the list means a React upgrade adds its new APIs
 * here automatically, so the whole defect class is closed rather than patched.
 *
 * Internals (`__`-prefixed) and `version` are excluded: they are not things a
 * snippet should reference, and `version` would shadow a plausible user variable.
 */
const EXCLUDED = new Set(['version']);

export function buildReactScope(renderFn: (el: React.ReactElement) => void): Record<string, unknown> {
  const scope: Record<string, unknown> = { React };

  for (const [name, value] of Object.entries(React)) {
    if (name.startsWith('__') || EXCLUDED.has(name)) continue;
    scope[name] = value;
  }

  // The two react-dom APIs that appear in guide snippets. The rest of react-dom
  // is either server-only or an escape hatch no example uses.
  scope.createPortal = createPortal;
  scope.flushSync = flushSync;

  scope.render = renderFn;
  return scope;
}

/**
 * Summary of the injected names for the stripped-import warning. Derived from
 * the same map, so it cannot drift — it used to be a second hand-written list
 * and the two had already fallen out of step.
 */
export function scopeNames(): string {
  const scope = buildReactScope(() => {});
  const names = Object.keys(scope);
  const hookCount = names.filter((n) => n.startsWith('use')).length;
  // Examples only — the contract is the derived map above. Each is filtered
  // against the real scope so a React removal cannot leave a stale name here.
  const featured = [
    'useState', 'useEffect', 'useEffectEvent', 'Fragment', 'Suspense',
    'Activity', 'memo', 'lazy', 'createPortal',
  ].filter((n) => n in scope);
  return `React and all ${names.length - 1} of its exports (${hookCount} hooks — `
    + `${featured.join(', ')} and the rest), plus render, are already in scope.`;
}
