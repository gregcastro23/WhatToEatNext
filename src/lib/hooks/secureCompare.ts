/**
 * Constant-time comparison for shared secrets and signatures.
 *
 * `a !== b` on a secret returns as soon as the first byte differs, so response
 * time leaks how much of a guess was right. `timingSafeEqual` does not, but it
 * throws on unequal lengths — and an early length check leaks the length. Both
 * sides are therefore hashed to a fixed 32 bytes first: the comparison takes
 * the same time whatever was sent, and a wrong-length guess is just wrong.
 *
 * @file src/lib/hooks/secureCompare.ts
 */

import { createHash, timingSafeEqual } from "node:crypto";

function digest(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

/**
 * True only when a secret is configured, a value was received, and they match.
 * An unset or empty expected secret never matches anything (fail closed).
 */
export function safeEqual(received: string | null | undefined, expected: string | null | undefined): boolean {
  if (!expected || received === null || received === undefined) return false;
  return timingSafeEqual(digest(received), digest(expected));
}

/** `Authorization: Bearer <secret>` check, constant-time. */
export function bearerMatches(authorization: string | null | undefined, secret: string | null | undefined): boolean {
  if (!secret) return false;
  return safeEqual(authorization, `Bearer ${secret}`);
}
