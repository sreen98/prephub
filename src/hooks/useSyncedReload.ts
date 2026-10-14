import { useEffect } from 'react';
import { onSyncedWrite } from '../lib/storage';
import type { SyncedKey } from '../lib/syncKeys';

/**
 * Re-read a hook's state when its key changes because of ANOTHER device
 * (the sync layer wrote it). The hook's own saves don't trigger it: they
 * already set state themselves.
 */
export function useSyncedReload(key: SyncedKey, reload: () => void): void {
  useEffect(() => onSyncedWrite((changed, fromSync) => {
    if (fromSync && changed === key) reload();
  }), [key, reload]);
}
