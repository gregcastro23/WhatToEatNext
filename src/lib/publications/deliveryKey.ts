/**
 * Delivery key extraction and validation for agent publication routes.
 *
 * Explicitly resolves header-only, body-only, or matching delivery keys.
 * Enforces bounded limits (1..255 characters) without silent truncation.
 *
 * @file src/lib/publications/deliveryKey.ts
 */

const MAX_DELIVERY_KEY_LENGTH = 255;

export interface DeliveryKeyResolution {
  deliveryKey: string | null;
  error?: string;
  statusCode?: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function resolvePublicationDeliveryKey(
  headers: Headers | { get(name: string): string | null },
  rawBody?: unknown,
): DeliveryKeyResolution {
  const headerKey = (
    headers.get("Idempotency-Key") ??
    headers.get("idempotency-key") ??
    headers.get("delivery-key")
  )?.trim();

  let bodyKey: string | undefined;
  if (isRecord(rawBody)) {
    const candidate = rawBody.idempotencyKey ?? rawBody.deliveryId ?? rawBody.deliveryKey;
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      bodyKey = candidate.trim();
    }
  }

  if (headerKey && bodyKey && headerKey !== bodyKey) {
    return {
      deliveryKey: null,
      error: "Delivery key mismatch: header Idempotency-Key does not match body idempotencyKey",
      statusCode: 400,
    };
  }

  const effectiveKey = headerKey ?? bodyKey ?? null;
  if (!effectiveKey) {
    return { deliveryKey: null };
  }

  if (effectiveKey.length > MAX_DELIVERY_KEY_LENGTH) {
    return {
      deliveryKey: null,
      error: `Delivery key exceeds maximum length of ${MAX_DELIVERY_KEY_LENGTH} characters`,
      statusCode: 400,
    };
  }

  return { deliveryKey: effectiveKey };
}
