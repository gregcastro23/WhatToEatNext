/**
 * Deterministic semantic payload fingerprinting for publication idempotency.
 *
 * Excludes transient transport headers, signatures, and ephemeral request wrappers.
 * Serializes sorted keys deterministically before hashing with SHA-256.
 *
 * @file src/lib/publications/semanticFingerprint.ts
 */

import { createHash } from "node:crypto";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function canonicalize(value: unknown): unknown {
  if (value === null || value === undefined) {
    return null;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    return value.map((item) => canonicalize(item));
  }
  if (isRecord(value)) {
    const sortedKeys = Object.keys(value).sort();
    const result: Record<string, unknown> = {};
    for (const key of sortedKeys) {
      // Exclude transport/transient fields
      if (
        key === "idempotencyKey" ||
        key === "deliveryId" ||
        key === "signature" ||
        key === "headers" ||
        key === "timestamp" ||
        key === "requestId"
      ) {
        continue;
      }
      const val = value[key];
      if (val !== undefined) {
        result[key] = canonicalize(val);
      }
    }
    return result;
  }
  return value;
}

export function computeSemanticFingerprint(payload: unknown): string {
  const canonical = canonicalize(payload);
  const json = JSON.stringify(canonical);
  return createHash("sha256").update(json, "utf8").digest("hex");
}

export const calculateSemanticFingerprint = computeSemanticFingerprint;
