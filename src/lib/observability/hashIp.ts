/**
 * hashIp — one-way hash of a client IP for the request log.
 *
 * The bare IP is PII; we never want it in our observability ring or
 * anywhere it might be exported. This helper HMAC-SHA256s the IP with
 * a server-side salt so the same client maps to a stable opaque
 * identifier across requests (useful for grouping abuse) but the
 * pre-image is not recoverable.
 *
 * Salt resolution order: INTERNAL_API_SECRET → AUTH_SECRET → a
 * compile-time constant. The constant is intentionally weak — the
 * Railway-deployed env vars are the only ones expected to be set in
 * production, and we'd rather degrade to a stable-but-not-secret hash
 * than crash the request path if both are missing.
 *
 * @file src/lib/observability/hashIp.ts
 */

import { createHmac } from "node:crypto";

const FALLBACK_SALT = "alchm:observability:fallback-salt";

function getSalt(): string {
  return (
    process.env.INTERNAL_API_SECRET ||
    process.env.AUTH_SECRET ||
    FALLBACK_SALT
  );
}

/**
 * Hash an IP address (v4 or v6) to a short opaque identifier.
 * Returns the first 16 hex chars of HMAC-SHA256(salt, ip) — enough
 * entropy to discriminate IPs in our ring buffer, short enough to
 * read in admin tables.
 */
export function hashIp(ip: string): string {
  const trimmed = ip.trim();
  if (!trimmed) return "";
  return createHmac("sha256", getSalt()).update(trimmed).digest("hex").slice(0, 16);
}

/**
 * Extract the client IP from a Next.js request, preferring the
 * left-most entry in X-Forwarded-For (the original client) over
 * the connecting proxy address.
 */
export function extractClientIp(headers: Headers): string | null {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  return null;
}
