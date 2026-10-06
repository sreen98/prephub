/**
 * Encrypts the private admin document for publishing.
 *
 *   private/admin-prep.md  (plain text, gitignored, never committed)
 *     → public/admin-prep.enc.json  (AES-GCM ciphertext, safe to commit)
 *
 * The passphrase comes from the ADMIN_PASSPHRASE environment variable and is
 * never written anywhere. Re-run this after every edit to the document.
 *
 *   PowerShell:  $env:ADMIN_PASSPHRASE = '...'; npm run admin:encrypt
 *   bash:        ADMIN_PASSPHRASE='...' npm run admin:encrypt
 *
 * The format must match src/lib/adminCrypto.ts, which decrypts it in the
 * browser; src/lib/adminCrypto.test.ts pins that the two agree.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { webcrypto } from 'node:crypto';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(root, 'private/admin-prep.md');
const OUTPUT = join(root, 'public/admin-prep.enc.json');

export const PBKDF2_ITERATIONS = 600_000;
// The ciphertext is public, so it can be attacked offline at any speed: a
// short passphrase (like a 4-digit PIN) would fall in seconds.
export const MIN_PASSPHRASE_LENGTH = 12;

export async function encryptText(plaintext, passphrase, iterations = PBKDF2_ITERATIONS) {
  const { subtle } = webcrypto;
  const salt = webcrypto.getRandomValues(new Uint8Array(16));
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const base = await subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  const key = await subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt'],
  );
  const data = await subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plaintext));
  const b64 = (bytes) => Buffer.from(bytes).toString('base64');
  return { v: 1, iterations, salt: b64(salt), iv: b64(iv), data: b64(new Uint8Array(data)) };
}

async function main() {
  const passphrase = process.env.ADMIN_PASSPHRASE ?? '';
  if (passphrase.length < MIN_PASSPHRASE_LENGTH) {
    console.error(`Set ADMIN_PASSPHRASE to at least ${MIN_PASSPHRASE_LENGTH} characters (several random words work well).`);
    process.exit(1);
  }
  if (!existsSync(SOURCE)) {
    console.error(`Nothing to encrypt: ${SOURCE} does not exist.`);
    process.exit(1);
  }
  const doc = await encryptText(readFileSync(SOURCE, 'utf8'), passphrase);
  writeFileSync(OUTPUT, JSON.stringify(doc) + '\n');
  console.log(`Encrypted private/admin-prep.md → public/admin-prep.enc.json (${(Buffer.byteLength(doc.data) / 1024).toFixed(0)} KB)`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
