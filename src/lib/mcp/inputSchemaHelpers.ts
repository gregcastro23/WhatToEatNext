/** The JSON Schema subset enforced by validation.ts; no SDK dependency. */
export interface JsonSchema {
  [key: string]: unknown;
  type?:
    | "object"
    | "array"
    | "string"
    | "number"
    | "integer"
    | "boolean"
    | "null";
  description?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  additionalProperties?: boolean | JsonSchema;
  items?: JsonSchema;
  anyOf?: JsonSchema[];
  enum?: string[];
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  minProperties?: number;
  maxProperties?: number;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  format?: "date-time";
  pattern?: string;
}

export const text = (maxLength: number, description?: string): JsonSchema => ({
  type: "string",
  minLength: 1,
  maxLength,
  ...(description ? { description } : {}),
});

export const identifier = text(200);
export const credential = text(512);

export const meta: JsonSchema = {
  type: "object",
  properties: {
    apiKey: credential,
    authKey: credential,
    caller: text(64),
    correlationId: text(128),
    requestId: text(128),
    traceId: text(128),
    evidenceSnapshotId: text(128),
    idempotencyKey: {
      ...text(200),
      pattern: "^[A-Za-z0-9._:~-]+$",
      description:
        "Optional retry key for paid tools. Reusing it with identical arguments within 24 hours replays the original settlement instead of charging again; reusing it with different arguments, or later, is rejected.",
    },
    internalSecret: credential,
  },
  additionalProperties: false,
};

export const coordinates: Record<string, JsonSchema> = {
  latitude: {
    type: "number",
    minimum: -90,
    maximum: 90,
    description: "Observer latitude; default 40.7498 (NYC).",
  },
  longitude: {
    type: "number",
    minimum: -180,
    maximum: 180,
    description: "Observer longitude; default -73.7976 (NYC).",
  },
};

export const element: JsonSchema = {
  type: "string",
  enum: ["Fire", "Water", "Earth", "Air"],
};

export function input(
  properties: Record<string, JsonSchema>,
  required: string[] = [],
): JsonSchema & { type: "object" } {
  return {
    type: "object",
    properties: {
      ...properties,
      _meta: meta,
      _authKey: credential,
      _apiKey: credential,
    },
    required,
    additionalProperties: false,
  };
}

