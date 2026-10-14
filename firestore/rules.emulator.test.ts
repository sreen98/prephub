/**
 * Firestore security rules, run against the local emulator:
 *   npm run test:rules
 * (firebase emulators:exec starts the emulator, runs this file, and stops it.
 * Needs the Firebase CLI and Java 11+, so it is not part of `npm run verify`.)
 */
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-prephub-rules',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
  });
});

afterAll(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
});

const valid = () => ({ value: JSON.stringify({ '/react': { status: 'completed' } }), updatedAt: serverTimestamp() });

describe('users/{uid}/data/{key}', () => {
  it('the owner can write, read and delete their own progress', async () => {
    const db = env.authenticatedContext('alice').firestore();
    const ref = doc(db, 'users/alice/data/guide-progress');
    await assertSucceeds(setDoc(ref, valid()));
    await assertSucceeds(getDoc(ref));
    await assertSucceeds(deleteDoc(ref));
  });

  it('another signed-in user can neither read nor write it', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'users/alice/data/bookmarks'), { value: '[]', updatedAt: new Date() });
    });
    const bob = env.authenticatedContext('bob').firestore();
    await assertFails(getDoc(doc(bob, 'users/alice/data/bookmarks')));
    await assertFails(setDoc(doc(bob, 'users/alice/data/bookmarks'), valid()));
    await assertFails(deleteDoc(doc(bob, 'users/alice/data/bookmarks')));
  });

  it('a signed-out visitor can do nothing', async () => {
    const anon = env.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(anon, 'users/alice/data/bookmarks')));
    await assertFails(setDoc(doc(anon, 'users/alice/data/bookmarks'), valid()));
  });

  it('only the synced keys can be written', async () => {
    const db = env.authenticatedContext('alice').firestore();
    await assertFails(setDoc(doc(db, 'users/alice/data/theme'), valid()));
  });

  it('a document must be exactly { value: string, updatedAt: server time }', async () => {
    const db = env.authenticatedContext('alice').firestore();
    const ref = doc(db, 'users/alice/data/bookmarks');
    await assertFails(setDoc(ref, { value: [], updatedAt: serverTimestamp() }));
    await assertFails(setDoc(ref, { value: '[]', updatedAt: new Date(2000, 0, 1) }));
    await assertFails(setDoc(ref, { value: '[]', updatedAt: serverTimestamp(), admin: true }));
    await assertFails(setDoc(ref, { value: 'x'.repeat(900_001), updatedAt: serverTimestamp() }));
  });

  it('nothing outside users/{uid}/data is readable or writable', async () => {
    const db = env.authenticatedContext('alice').firestore();
    await assertFails(getDoc(doc(db, 'users/alice')));
    await assertFails(setDoc(doc(db, 'stats/global'), { n: 1 }));
  });
});
