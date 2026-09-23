/**
 * Standard Webhooks (standardwebhooks.com) signature verification.
 *
 * Implements the Standard Webhooks v1 spec:
 * - Headers:
 *     webhook-id: unique event identifier
 *     webhook-timestamp: unix timestamp in seconds
 *     webhook-signature: space-delimited list of versioned signatures (e.g. "v1,<base64>")
 * - Secret: raw string or "whsec_<base64>"
 * - Signed content: `${msgId}.${timestamp}.${rawBody}`
 * - Signature: HMAC-SHA256 base64
 * - Drift tolerance: 5 minutes (300 seconds)
 *
 * Controlled via ASOL_WEBHOOK_SIGNATURES ("off" | "shadow" | "required").
 *
 * @file src/lib/hooks/standardWebhooks.ts
 */

import { createHmac } from "node:crypto";
import { safeEqual } from "@/lib/hooks/secureCompare";
import { _logger } from "@/lib/logger";

export const DEFAULT_TOLERANCE_SECONDS = 300; // 5 minutes

export type WebhookVerificationResult =
  | { valid: true; msgId: string; timestamp: number }
  | {
      valid: false;
      reason:
        | "missing_headers"
        | "invalid_timestamp"
        | "timestamp_drift"
        | "no_matching_signature"
        | "missing_secret";
      detail?: string;
    };

export type WebhookSignatureMode = "off" | "shadow" | "required";

export function getWebhookSignatureMode(): WebhookSignatureMode {
  const env = process.env.ASOL_WEBHOOK_SIGNATURES?.toLowerCase();
  if (env === "required") return "required";
  if (env === "shadow") return "shadow";
  return "off";
}

/**
 * Decode secret from base64 if prefixed with whsec_, or use raw UTF-8 bytes.
 */
export function parseWebhookSecret(secret: string): Buffer {
  if (secret.startsWith("whsec_")) {
    return Buffer.from(secret.slice(6), "base64");
  }
  return Buffer.from(secret, "utf-8");
}

function getHeader(
  headers: Headers | Record<string, string | null | undefined>,
  name: string,
): string | null {
  if (headers instanceof Headers) {
    return headers.get(name);
  }
  const lowerName = name.toLowerCase();
  for (const [key, val] of Object.entries(headers)) {
    if (key.toLowerCase() === lowerName && typeof val === "string") {
      return val;
    }
  }
  return null;
}

/**
 * Compute the expected v1 base64 HMAC signature for msgId, timestamp, and body.
 */
export function computeV1Signature(
  msgId: string,
  timestamp: number,
  rawBody: string,
  secret: Buffer,
): string {
  const content = `${msgId}.${timestamp}.${rawBody}`;
  return createHmac("sha256", secret).update(content).digest("base64");
}

/**
 * Verify inbound Standard Webhooks headers and body against secret.
 */
export function verifyStandardWebhook(params: {
  headers: Headers | Record<string, string | null | undefined>;
  rawBody: string;
  secret: string | null | undefined;
  nowSeconds?: number;
  toleranceSeconds?: number;
}): WebhookVerificationResult {
  const {
    headers,
    rawBody,
    secret,
    nowSeconds = Math.floor(Date.now() / 1000),
    toleranceSeconds = DEFAULT_TOLERANCE_SECONDS,
  } = params;

  if (!secret || secret.trim().length === 0) {
    return { valid: false, reason: "missing_secret" };
  }

  const msgId = getHeader(headers, "webhook-id");
  const timestampStr = getHeader(headers, "webhook-timestamp");
  const signatureHeader = getHeader(headers, "webhook-signature");

  if (!msgId || !timestampStr || !signatureHeader) {
    return {
      valid: false,
      reason: "missing_headers",
      detail: `msgId=${Boolean(msgId)}, timestamp=${Boolean(timestampStr)}, signature=${Boolean(signatureHeader)}`,
    };
  }

  const timestamp = parseInt(timestampStr, 10);
  if (Number.isNaN(timestamp) || timestamp <= 0) {
    return { valid: false, reason: "invalid_timestamp", detail: timestampStr };
  }

  // Check timestamp drift
  if (Math.abs(nowSeconds - timestamp) > toleranceSeconds) {
    return {
      valid: false,
      reason: "timestamp_drift",
      detail: `Drift ${Math.abs(nowSeconds - timestamp)}s exceeds tolerance ${toleranceSeconds}s`,
    };
  }

  const secretBuffer = parseWebhookSecret(secret);
  const expectedSig = computeV1Signature(msgId, timestamp, rawBody, secretBuffer);

  // Signatures header is space-delimited list of version,sig pairs (e.g. "v1,abc v1,def")
  const candidates = signatureHeader.trim().split(/\s+/);
  let matched = false;

  for (const candidate of candidates) {
    const commaIndex = candidate.indexOf(",");
    if (commaIndex === -1) continue;
    const version = candidate.slice(0, commaIndex);
    const sig = candidate.slice(commaIndex + 1);

    if (version === "v1" && safeEqual(sig, expectedSig)) {
      matched = true;
      break;
    }
  }

  if (!matched) {
    return { valid: false, reason: "no_matching_signature" };
  }

  return { valid: true, msgId, timestamp };
}

/**
 * Gate check for webhook signatures based on ASOL_WEBHOOK_SIGNATURES mode.
 */
export function evaluateSignatureGate(
  verification: WebhookVerificationResult,
  mode: WebhookSignatureMode = getWebhookSignatureMode(),
): { proceed: boolean; status?: number; error?: string } {
  if (mode === "off") {
    return { proceed: true };
  }

  if (mode === "shadow") {
    if (!verification.valid) {
      _logger.warn(
        `[standard-webhooks:shadow] Verification failed: ${verification.reason}`,
        verification.detail ?? "",
      );
    }
    return { proceed: true };
  }

  // mode === "required"
  if (!verification.valid) {
    return {
      proceed: false,
      status: 401,
      error: `Webhook signature verification failed: ${verification.reason}`,
    };
  }

  return { proceed: true };
}
