import { useCallback, useEffect, useState } from 'react';
import {
  ACCOUNTS_ENABLED,
  describeSignInError,
  hasAccountHint,
  signInWithGoogle,
  signOutOfAccount,
  watchAccount,
  type AccountUser,
} from '../lib/account';

export type AccountState =
  | { status: 'signed-out' }
  /** Signed in last time on this device; the SDK is loading to confirm it. */
  | { status: 'checking' }
  | { status: 'signed-in'; user: AccountUser };

export interface UseAccountReturn {
  state: AccountState;
  /** A sign-in or sign-out is in flight. */
  busy: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  /** Resolves true when signed out. */
  signOut: () => Promise<boolean>;
}

export function useAccount(): UseAccountReturn {
  const [watching, setWatching] = useState(() => ACCOUNTS_ENABLED && hasAccountHint());
  const [state, setState] = useState<AccountState>(() => (watching ? { status: 'checking' } : { status: 'signed-out' }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only a device that was signed in loads the SDK on start-up; a guest never does.
  useEffect(() => {
    if (!watching) return;
    let stop: (() => void) | null = null;
    let cancelled = false;
    watchAccount((user) => setState(user ? { status: 'signed-in', user } : { status: 'signed-out' }))
      .then((unsubscribe) => {
        if (cancelled) unsubscribe();
        else stop = unsubscribe;
      })
      // Offline at start-up: show signed-out. The hint stays, so the next load checks again.
      .catch(() => setState({ status: 'signed-out' }));
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [watching]);

  const signIn = useCallback(async (): Promise<void> => {
    setBusy(true);
    setError(null);
    try {
      const user = await signInWithGoogle();
      setState({ status: 'signed-in', user });
      setWatching(true);
    } catch (err) {
      setError(describeSignInError(err));
    } finally {
      setBusy(false);
    }
  }, []);

  const signOut = useCallback(async (): Promise<boolean> => {
    setBusy(true);
    setError(null);
    try {
      await signOutOfAccount();
      setState({ status: 'signed-out' });
      return true;
    } catch {
      setError("Couldn't sign out. Check your connection and try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  return { state, busy, error, signIn, signOut };
}
