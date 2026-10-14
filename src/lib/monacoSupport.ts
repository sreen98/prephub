/**
 * Whether this device gets Monaco (the VS Code editor) in the playground.
 *
 * Monaco is built for a mouse and a hardware keyboard: on phones its hidden
 * textarea fights the on-screen keyboard and selection handles. So it is used
 * only with a fine pointer on a screen at least tablet-wide, where Web Workers
 * exist (its language services run in them). Everything else, including jsdom
 * in the tests, keeps the lightweight textarea editor. Kept separate from
 * monacoSetup.ts so asking the question never loads Monaco.
 */
export const MONACO_MEDIA_QUERY = '(pointer: fine) and (min-width: 768px)';

export function canUseMonaco(): boolean {
  try {
    return typeof Worker !== 'undefined'
      && typeof globalThis.matchMedia === 'function'
      && globalThis.matchMedia(MONACO_MEDIA_QUERY).matches;
  } catch {
    return false;
  }
}
