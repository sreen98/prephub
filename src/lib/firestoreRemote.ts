import type { DocumentSnapshot } from 'firebase/firestore';
import { FIREBASE_CONFIG } from './firebaseConfig';
import type { RemoteStore } from './syncEngine';

/**
 * The Firestore implementation of the sync engine's RemoteStore. Each synced
 * key is the document users/{uid}/data/{key} holding { value, updatedAt },
 * where `value` is the key's JSON as a string: Firestore maps reject some of
 * our keys and values (question ids are free text), and a string is stored as is.
 * The shape is enforced server-side by firestore.rules.
 *
 * Like lib/account.ts, the SDK is reached only through import().
 */
export async function createFirestoreRemote(uid: string): Promise<RemoteStore> {
  const [appSdk, fs] = await Promise.all([import('firebase/app'), import('firebase/firestore')]);
  const app = appSdk.getApps()[0] ?? appSdk.initializeApp(FIREBASE_CONFIG);
  const db = fs.getFirestore(app);
  const ref = (key: string) => fs.doc(db, 'users', uid, 'data', key);

  const parse = (snap: DocumentSnapshot): unknown => {
    const raw: unknown = snap.exists() ? snap.get('value') : undefined;
    if (typeof raw !== 'string') return undefined;
    try {
      return JSON.parse(raw);
    } catch {
      return undefined;
    }
  };

  return {
    subscribe(key, onValue, onError) {
      return fs.onSnapshot(ref(key), (snap) => onValue(parse(snap)), onError);
    },
    async update(key, compute) {
      await fs.runTransaction(db, async (tx) => {
        const next = compute(parse(await tx.get(ref(key))));
        if (next !== undefined) tx.set(ref(key), { value: JSON.stringify(next), updatedAt: fs.serverTimestamp() });
      });
    },
  };
}
