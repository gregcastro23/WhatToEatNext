/**
 * Wire parser for `GET`/`POST /api/economy/purchase` as `TokenGate` reads it.
 *
 * The route answers `{ success: true, hasAccess, item: { isOneTime }, … }` on
 * success and `{ success: false, message }` on every refusal. `TokenGate`
 * treats anything without `success === true` as "locked / purchase failed" and
 * never rejects a body, so this parser never throws on an object: each field
 * is kept only when it has the expected type, otherwise it is simply absent —
 * the same outcome the old unchecked cast produced for a missing field.
 *
 * @file src/components/economy/tokenGateParser.ts
 */

import { isJsonRecord } from "@/lib/api/json";

export interface TokenGateResponse {
  success?: boolean;
  hasAccess?: boolean;
  message?: string;
  item?: {
    isOneTime?: boolean;
  };
}

/** `parse` for `readJson`. A non-object body parses to `{}` (no `success`). */
export function parseTokenGateResponse(value: unknown): TokenGateResponse {
  if (!isJsonRecord(value)) return {};
  const { success, hasAccess, message, item } = value;
  const isOneTime = isJsonRecord(item) ? item.isOneTime : undefined;
  return {
    ...(typeof success === "boolean" ? { success } : {}),
    ...(typeof hasAccess === "boolean" ? { hasAccess } : {}),
    ...(typeof message === "string" ? { message } : {}),
    ...(isJsonRecord(item)
      ? { item: typeof isOneTime === "boolean" ? { isOneTime } : {} }
      : {}),
  };
}
