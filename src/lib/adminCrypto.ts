/**
 * Passphrase encryption for the admin document (see AdminPage.tsx).
 *
 * This is a static site, so everything it ships is public: a passcode checked
 * in the browser hides nothing. The admin document is therefore published only
 * as AES-GCM ciphertext, with the key derived from a passphrase by PBKDF2. The
 * plain document stays in the gitignored `private/` folder, and the passphrase
 * is never stored anywhere in the repo or the build.
 *
 * `scripts/encrypt-admin-prep.js` writes the same format with Node's WebCrypto.
 * `adminCrypto.test.ts` pins that the two agree.
 */

export interface EncryptedDoc {
  v: 1;
  iterations: number;
  salt: string; // base64
  iv: string;   // base64
  data: string; // base64 ciphertext with the GCM tag appended
}

/** OWASP's 2023 recommendation for PBKDF2-HMAC-SHA256. */
export const PBKDF2_ITERATIONS = 600_000;

export function isEncryptedDoc(value: unknown): value is EncryptedDoc {
  if (typeof value !== 'object' || value === null) return false;
  if (!('v' in value && 'iterations' in value && 'salt' in value && 'iv' in value && 'data' in value)) return false;
  return value.v === 1
    && typeof value.iterations === 'number' && value.iterations > 0
    && typeof value.salt === 'string'
    && typeof value.iv === 'string'
    && typeof value.data === 'string';
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(text: string): Uint8Array<ArrayBuffer> {
  const binary = atob(text);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveKey(passphrase: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptText(plaintext: string, passphrase: string, iterations = PBKDF2_ITERATIONS): Promise<EncryptedDoc> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt, iterations);
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plaintext));
  return { v: 1, iterations, salt: toBase64(salt), iv: toBase64(iv), data: toBase64(new Uint8Array(data)) };
}

/**
 * Returns the plain text, or `null` when the passphrase is wrong. AES-GCM
 * authenticates the ciphertext, so a wrong key (or a tampered file) fails to
 * decrypt rather than producing garbage.
 */
export async function decryptText(doc: EncryptedDoc, passphrase: string): Promise<string | null> {
  const key = await deriveKey(passphrase, fromBase64(doc.salt), doc.iterations);
  try {
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(doc.iv) }, key, fromBase64(doc.data));
    return new TextDecoder().decode(plain);
  } catch {
    return null;
  }
}
