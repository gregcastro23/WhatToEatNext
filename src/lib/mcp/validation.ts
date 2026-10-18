import { Buffer } from "node:buffer";
import { TOOL_DEFINITIONS, type JsonSchema, type ToolName } from "./catalog";

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateObjectProperty(
  schema: JsonSchema,
  key: string,
  value: unknown,
  path: string,
  depth: number,
): string | null {
  const childSchema =
    schema.properties && Object.hasOwn(schema.properties, key)
      ? schema.properties[key]
      : undefined;
  if (childSchema) return validate(childSchema, value, `${path}.${key}`, depth + 1);
  if (schema.additionalProperties === false)
    return `${path} contains an unsupported property`;
  if (isRecord(schema.additionalProperties))
    return validate(schema.additionalProperties, value, `${path}.${key}`, depth + 1);
  return null;
}

function validateObject(
  schema: JsonSchema,
  value: unknown,
  path: string,
  depth: number,
): string | null {
  if (!isRecord(value)) return `${path} must be an object`;
  const entries = Object.entries(value);
  if (
    entries.length < (schema.minProperties ?? 0) ||
    entries.length > (schema.maxProperties ?? 100)
  )
    return `${path} has an invalid number of properties`;
  for (const key of schema.required ?? []) {
    if (!Object.hasOwn(value, key) || value[key] === undefined)
      return `${path}.${key} is required`;
  }
  for (const [key, child] of entries) {
    const error = validateObjectProperty(schema, key, child, path, depth);
    if (error) return error;
  }
  return null;
}

function validateArray(
  schema: JsonSchema,
  value: unknown,
  path: string,
  depth: number,
): string | null {
  if (!Array.isArray(value)) return `${path} must be an array`;
  if (
    value.length < (schema.minItems ?? 0) ||
    value.length > (schema.maxItems ?? 100)
  )
    return `${path}[] has an invalid number of items`;
  if (schema.items) {
    for (let i = 0; i < value.length; i++) {
      const error = validate(schema.items, value[i], `${path}[${i}]`, depth + 1);
      if (error) return error;
    }
  }
  return null;
}

function validateString(
  schema: JsonSchema,
  value: unknown,
  path: string,
): string | null {
  if (typeof value !== "string") return `${path} must be a string`;
  if (schema.pattern && !new RegExp(schema.pattern).test(value))
    return `${path} has an invalid format`;
  if (
    value.trim().length < (schema.minLength ?? 0) ||
    value.length > (schema.maxLength ?? 10000)
  )
    return `${path} has an invalid length`;
  if (
    schema.format === "date-time" &&
    (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(?:[.][0-9]+)?(?:Z|[+-][0-9]{2}:[0-9]{2})$/.test(
      value,
    ) ||
      !Number.isFinite(Date.parse(value)))
  )
    return `${path} must be an ISO timestamp with a timezone`;
  return null;
}

function validateNumber(
  schema: JsonSchema,
  value: unknown,
  path: string,
): string | null {
  if (typeof value !== "number" || !Number.isFinite(value))
    return `${path} must be a finite number`;
  if (schema.type === "integer" && !Number.isInteger(value))
    return `${path} must be an integer`;
  if (
    value < (schema.minimum ?? -Infinity) ||
    value > (schema.maximum ?? Infinity) ||
    (schema.exclusiveMinimum !== undefined && value <= schema.exclusiveMinimum)
  )
    return `${path} is outside the allowed range`;
  return null;
}

/** Enforce the same bounded JSON Schema contract advertised by tools/list. */
function validate(
  schema: JsonSchema,
  value: unknown,
  path: string,
  depth = 0,
): string | null {
  if (depth > 12) return `${path} exceeds the maximum nesting depth`;
  if (
    schema.anyOf &&
    !schema.anyOf.some(
      (candidate) => validate(candidate, value, path, depth + 1) === null,
    )
  )
    return `${path} does not match an accepted shape`;
  if (schema.enum && !schema.enum.some((candidate) => candidate === value))
    return `${path} has an invalid value`;
  switch (schema.type) {
    case "object":
      return validateObject(schema, value, path, depth);
    case "array":
      return validateArray(schema, value, path, depth);
    case "string":
      return validateString(schema, value, path);
    case "number":
    case "integer":
      return validateNumber(schema, value, path);
    case "boolean":
      return typeof value === "boolean" ? null : `${path} must be a boolean`;
    default:
      return null;
  }
}

export function validateToolArguments(
  name: ToolName,
  args: Record<string, unknown>,
): string | null {
  const definition = TOOL_DEFINITIONS.find((tool) => tool.name === name);
  if (!definition) return "Unknown tool";
  try {
    if (Buffer.byteLength(JSON.stringify(args), "utf8") > 65536)
      return "arguments exceed the 64 KiB limit";
  } catch {
    return "arguments must be serializable JSON";
  }
  return validate(definition.inputSchema, args, "arguments");
}
