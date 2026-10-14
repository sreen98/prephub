/**
 * Which localStorage keys follow a signed-in user to other devices.
 *
 * Every pinned key (storageKeys.test.ts) must appear in exactly one of these two
 * lists, so adding a key forces a decision about syncing it. A key is synced when
 * it is progress the reader would miss on another device; it is device-only when
 * it describes this screen or this session (theme, layout, a running timer).
 */
export const SYNCED_KEYS = [
  'bookmarks',
  'checkpoints',
  'guide-progress',
  'playground-interview-history',
  'playground-progress',
  'sr-schedule',
  'study-stats',
] as const;

export type SyncedKey = (typeof SYNCED_KEYS)[number];

export const DEVICE_KEYS = [
  // "This device was signed in last time" (lib/account.ts): per device by definition.
  'account-hint',
  'last-minute-mode',
  'lastSeenChangelog',
  'playground-bracket-autoclose',
  'playground-header-hidden',
  // A live countdown belongs to the device it started on.
  'playground-interview-active',
  'playground-last-session',
  'playground-last-session-react',
  'playground-output-hidden',
  'playground-split-pct',
  'playground-wrap',
  'readingFontSize',
  // The last value each synced key agreed on with the account (lib/syncEngine.ts).
  'sync-base',
  'theme',
] as const;

const SYNCED: ReadonlySet<string> = new Set(SYNCED_KEYS);

export function isSyncedKey(key: string): key is SyncedKey {
  return SYNCED.has(key);
}
