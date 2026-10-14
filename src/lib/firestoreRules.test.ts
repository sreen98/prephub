import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { SYNCED_KEYS } from './syncKeys';

// The security rules repeat the synced-key list (rules cannot import code). If the
// two drift, a newly synced key is silently rejected by the server.
describe('firestore.rules', () => {
  it('allows exactly the keys in SYNCED_KEYS', () => {
    const rules = readFileSync('firestore.rules', 'utf8').replace(/\r\n/g, '\n');
    const list = /key in \[([^\]]*)\]/.exec(rules)?.[1];
    expect(list, 'the key list in firestore.rules').toBeDefined();
    const keys = [...(list ?? '').matchAll(/'([^']+)'/g)].map((m) => m[1]).sort();
    expect(keys).toEqual([...SYNCED_KEYS].sort());
  });
});
