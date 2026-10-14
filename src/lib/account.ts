import type { User } from 'firebase/auth';
import { FIREBASE_CONFIG } from './firebaseConfig';
import { safeGet, safeRemove, safeSet } from './storage';

/**
 * Optional Google sign-in (docs/accounts-and-sync-plan.md, phase 2).
 *
 * The Firebase SDK is reached ONLY through `import()` here, so it never enters
 * the app or vendor chunks and costs nothing on first paint (rule 9c). It loads
 * when someone clicks Sign in, or at start-up when `account-hint` says this
 * device was signed in last time; the hint exists so a guest never downloads
 * the SDK just to learn they are not signed in. `account.test.ts` fails on any
 * static import of `firebase/*` in src/.
 *
 * Until sync ships (phase 3) the feature is visible in development only, or in
 * a build made with VITE_ACCOUNTS=on.
 */
export const ACCOUNTS_ENABLED = import.meta.env.DEV || import.meta.env.VITE_ACCOUNTS === 'on';

const HINT_KEY = 'account-hint';

export function hasAccountHint(): boolean {
  return safeGet(HINT_KEY) === '1';
}

export interface AccountUser {
  uid: string;
  name: string;
  email: string;
  photoURL: string | null;
}

function toAccountUser(u: User): AccountUser {
  const email = u.email ?? '';
  return { uid: u.uid, name: u.displayName || email || 'Signed in', email, photoURL: u.photoURL };
}

async function loadSdk() {
  const [appSdk, authSdk] = await Promise.all([import('firebase/app'), import('firebase/auth')]);
  const app = appSdk.getApps()[0] ?? appSdk.initializeApp(FIREBASE_CONFIG);
  return { auth: authSdk.getAuth(app), authSdk };
}

let sdk: ReturnType<typeof loadSdk> | null = null;

/** Memoised, but a failed download (offline) is forgotten so the next click retries. */
function auth(): ReturnType<typeof loadSdk> {
  sdk ??= loadSdk().catch((err: unknown) => {
    sdk = null;
    throw err;
  });
  return sdk;
}

export async function signInWithGoogle(): Promise<AccountUser> {
  const { auth: a, authSdk } = await auth();
  const provider = new authSdk.GoogleAuthProvider();
  // Always show the account chooser, so a shared computer never signs in as the last person silently.
  provider.setCustomParameters({ prompt: 'select_account' });
  const { user } = await authSdk.signInWithPopup(a, provider);
  safeSet(HINT_KEY, '1');
  return toAccountUser(user);
}

export async function signOutOfAccount(): Promise<void> {
  const { auth: a, authSdk } = await auth();
  await authSdk.signOut(a);
  safeRemove(HINT_KEY);
}

/** Subscribe to sign-in state. Resolves to the unsubscribe function once the SDK has loaded. */
export async function watchAccount(onChange: (user: AccountUser | null) => void): Promise<() => void> {
  const { auth: a, authSdk } = await auth();
  return authSdk.onAuthStateChanged(a, (u) => {
    if (u) safeSet(HINT_KEY, '1');
    else safeRemove(HINT_KEY);
    onChange(u ? toAccountUser(u) : null);
  });
}

function errorCode(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'code' in err && typeof err.code === 'string') return err.code;
  return '';
}

/**
 * What to tell the reader when sign-in fails, or null when there is nothing to
 * say (they closed the Google window themselves).
 */
export function describeSignInError(err: unknown): string | null {
  switch (errorCode(err)) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
    case 'auth/user-cancelled':
      return null;
    case 'auth/popup-blocked':
      return 'Your browser blocked the Google sign-in window. Allow pop-ups for this site and try again.';
    case 'auth/network-request-failed':
      return "Couldn't reach Google. Check your connection and try again.";
    case 'auth/unauthorized-domain':
      return "Sign-in isn't enabled on this address.";
    case '':
      // No Firebase code: most often the SDK chunk itself failed to download.
      return "Sign-in couldn't load. Check your connection and try again.";
    default:
      return 'Sign-in failed. Please try again.';
  }
}
