import { useEffect, useRef, useState } from 'react';
import { deleteSignedInUser } from '../lib/account';
import { deleteSyncedData } from '../lib/firestoreRemote';
import { forgetSyncBase } from '../lib/syncEngine';
import ModalShell from './ModalShell';

interface DeleteAccountDialogProps {
  uid: string;
  /** Stop syncing first: otherwise the engine sees the account copy vanish and uploads this device's again. */
  stopSync: () => void;
  onClose: () => void;
}

type Phase = 'confirm' | 'deleting' | 'done' | 'failed';

/**
 * "Delete my account": removes the synced data and the sign-in account, with
 * no support email needed. Progress on this device is kept; it is the reader's,
 * and they can export or clear it as before.
 */
export default function DeleteAccountDialog({ uid, stopSync, onClose }: DeleteAccountDialogProps) {
  const [phase, setPhase] = useState<Phase>('confirm');
  const cancelButton = useRef<HTMLButtonElement>(null);

  useEffect(() => { cancelButton.current?.focus(); }, []);

  const remove = async (): Promise<void> => {
    setPhase('deleting');
    try {
      stopSync();
      await deleteSyncedData(uid);
      forgetSyncBase();
      await deleteSignedInUser();
      setPhase('done');
    } catch {
      setPhase('failed');
    }
  };

  const busy = phase === 'deleting';
  return (
    <ModalShell titleId="delete-account-title" title="Delete your account" onClose={busy ? () => undefined : onClose}>
      {phase === 'done' ? (
        <p className="mt-2 text-sm" aria-live="polite">
          Your account and the progress stored in it are deleted. The progress on this device is still here.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-muted">
            This deletes the copy of your progress stored in your account, and your PrepHub sign-in. It can't be undone.
            Progress on this device stays; export it first if you want a file.
          </p>
          {phase === 'failed' && (
            <p role="alert" className="mt-3 text-xs text-red-700 dark:text-red-400">
              Deleting didn't finish. Check your connection and try again.
            </p>
          )}
        </>
      )}

      <div className="mt-5 flex justify-end gap-2">
        {phase === 'done' ? (
          <button type="button" onClick={onClose} className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-contrast hover:bg-accent-strong">
            Close
          </button>
        ) : (
          <>
            <button ref={cancelButton} type="button" onClick={onClose} disabled={busy} className="rounded-md px-3 py-1.5 text-sm text-muted hover:bg-ink/5 hover:text-ink disabled:opacity-50">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void remove()}
              disabled={busy}
              className="rounded-md bg-red-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-60"
            >
              {busy ? 'Deleting…' : 'Delete account'}
            </button>
          </>
        )}
      </div>
    </ModalShell>
  );
}
