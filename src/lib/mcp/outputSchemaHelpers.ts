import type { JsonSchema } from "./inputSchemaHelpers";

/** Stable `errorCode` values; ToolResult derives its union from this list. */
export const TOOL_ERROR_CODES = [
  "INVALID_ARGS",
  "QUOTA",
  "INTERNAL",
  "NOT_FOUND",
  "RATE_LIMIT",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "UNAVAILABLE",
  "BUSY",
  "CANCELLED",
  "CONFLICT",
] as const;

export type ToolErrorCode = (typeof TOOL_ERROR_CODES)[number];

/** What a paid tool did about payment for this response. */
export const BILLING_STATUSES = ["charged", "replayed", "not_charged"] as const;

export type BillingStatus = (typeof BILLING_STATUSES)[number];

export const string: JsonSchema = { type: "string" };
export const number: JsonSchema = { type: "number" };
export const integer: JsonSchema = { type: "integer" };
export const boolean: JsonSchema = { type: "boolean" };
export const object: JsonSchema = { type: "object" };
export const array: JsonSchema = { type: "array" };
export const timestamp: JsonSchema = { type: "string", format: "date-time" };

export const nullable = (schema: JsonSchema): JsonSchema => ({
  anyOf: [schema, { type: "null" }],
});

export const shape = (
  properties: Record<string, JsonSchema>,
  required: string[] = Object.keys(properties),
): JsonSchema & { type: "object" } => ({ type: "object", properties, required });

export const basket = shape({
  spirit: number,
  essence: number,
  matter: number,
  substance: number,
});

export const billing = shape(
  {
    status: { type: "string", enum: [...BILLING_STATUSES] },
    reason: string,
    amounts: nullable(basket),
    idempotencyKey: nullable(string),
  },
  ["status", "amounts", "idempotencyKey"],
);

export const errorEnvelope = shape(
  {
    errorCode: { type: "string", enum: [...TOOL_ERROR_CODES] },
    message: string,
    remediation: string,
    correlationId: string,
    // Partial evidence a failed call still produced (e.g. a partial snapshot).
    data: {},
    retryAfterSec: number,
    billing,
  },
  ["errorCode", "message", "correlationId"],
);

export function result(
  success: JsonSchema & { type: "object" },
  paid = false,
): JsonSchema & { type: "object" } {
  const properties = {
    ...success.properties,
    correlationId: string,
    ...(paid ? { billing } : {}),
  };
  return {
    type: "object",
    anyOf: [
      {
        ...success,
        properties,
        required: [...(success.required ?? []), "correlationId"],
      },
      errorEnvelope,
    ],
  };
}

