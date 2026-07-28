/**
 * Client-side temporary password generator, used only for an admin-triggered
 * reset (the account's own creation flow always generates one server-side —
 * see `TemporaryPasswordGenerator` in education-core-service). Mirrors that
 * generator's alphabet (no ambiguous 0/O/1/l/I) and length, using the Web
 * Crypto API for secure randomness instead of `Math.random()`.
 */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$';
const LENGTH = 12;

export function generateTemporaryPassword(): string {
  const bytes = new Uint32Array(LENGTH);
  crypto.getRandomValues(bytes);
  let password = '';
  for (let i = 0; i < LENGTH; i++) {
    password += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return password;
}
