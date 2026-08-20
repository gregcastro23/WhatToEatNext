/**
 * Edge-safe admin allowlist.
 *
 * Kept in its own module (no NextAuth/DB imports) so it can be imported from
 * both server-only auth code and edge-runtime route validators without pulling
 * in Node-only dependencies.
 *
 * @file src/lib/auth/adminEmails.ts
 */

export const ADMIN_EMAILS: readonly string[] = [
  process.env.AUTH_ADMIN_EMAIL || "xalchm@gmail.com",
  "gregcastro23@gmail.com",
  "cookingwithcastrollc@gmail.com",
];

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((e) => e.trim().toLowerCase() === normalized);
}
