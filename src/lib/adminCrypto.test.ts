import { describe, it, expect } from 'vitest';
import { encryptText, decryptText, isEncryptedDoc, PBKDF2_ITERATIONS } from './adminCrypto';
import {
  encryptText as scriptEncrypt,
  PBKDF2_ITERATIONS as SCRIPT_ITERATIONS,
} from '../../scripts/encrypt-admin-prep.js';

// Real documents use 600,000 iterations; tests use few so they stay fast.
// The iteration count travels inside the file, so this exercises the same path.
const FAST = 1_000;
const TEXT = '# Admin prep\n\nQ: Why stream?\nA: The first words arrive in under a second. Ünïcødé ✓';

describe('admin document encryption', () => {
  it('round-trips with the right passphrase', async () => {
    const doc = await encryptText(TEXT, 'correct horse battery staple', FAST);
    expect(await decryptText(doc, 'correct horse battery staple')).toBe(TEXT);
  });

  it('returns null for a wrong passphrase instead of garbage', async () => {
    const doc = await encryptText(TEXT, 'correct horse battery staple', FAST);
    expect(await decryptText(doc, 'correct horse battery stapler')).toBeNull();
  });

  it('rejects a tampered file', async () => {
    const doc = await encryptText(TEXT, 'correct horse battery staple', FAST);
    const bytes = atob(doc.data);
    const flipped = String.fromCharCode(bytes.charCodeAt(0) ^ 1) + bytes.slice(1);
    expect(await decryptText({ ...doc, data: btoa(flipped) }, 'correct horse battery staple')).toBeNull();
  });

  it('never contains the plain text', async () => {
    const doc = await encryptText(TEXT, 'correct horse battery staple', FAST);
    expect(JSON.stringify(doc)).not.toContain('Why stream');
  });

  it('uses a fresh salt and IV every time', async () => {
    const a = await encryptText(TEXT, 'correct horse battery staple', FAST);
    const b = await encryptText(TEXT, 'correct horse battery staple', FAST);
    expect(a.salt).not.toBe(b.salt);
    expect(a.iv).not.toBe(b.iv);
  });

  it('decrypts what scripts/encrypt-admin-prep.js writes', async () => {
    const doc: unknown = await scriptEncrypt(TEXT, 'correct horse battery staple', FAST);
    expect(isEncryptedDoc(doc)).toBe(true);
    if (!isEncryptedDoc(doc)) return;
    expect(await decryptText(doc, 'correct horse battery staple')).toBe(TEXT);
  });

  it('script and browser agree on the default strength', () => {
    expect(SCRIPT_ITERATIONS).toBe(PBKDF2_ITERATIONS);
  });

  it('rejects files that are not in the encrypted format', () => {
    expect(isEncryptedDoc(null)).toBe(false);
    expect(isEncryptedDoc({ v: 1, iterations: 1, salt: 's', iv: 'i' })).toBe(false);
    expect(isEncryptedDoc({ v: 2, iterations: 1, salt: 's', iv: 'i', data: 'd' })).toBe(false);
    expect(isEncryptedDoc('# plain markdown')).toBe(false);
  });
});
