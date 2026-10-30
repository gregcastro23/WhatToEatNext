import { Buffer } from "node:buffer";
import { TOOL_DEFINITIONS, type JsonSchema, type ToolName } from "./catalog";

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Input contracts are bounded even where a schema omits a limit; output
 * conformance checks only what the advertised schema states.
 */
interface ValidationOptions {
  bounded: boolean;
}

function validateObjectProperty(
  schema: JsonSchema,
  key: string,
  value: unknown,
  path: string,
  depth: number,
  options: ValidationOptions,
): string | null {
  const childSchema =
    schema.properties && Object.hasOwn(schema.properties, key)
      ? schema.properties[key]
      : undefined;
  if (childSchema)
    return validate(childSchema, value, `${path}.${key}`, depth + 1, options);
  if (schema.additionalProperties === false)
    return `${path} contains an unsupported property`;
  if (isRecord(schema.additionalProperties))
    return validate(
      schema.additionalProperties,
      value,
      `${path}.${key}`,
      depth + 1,
      options,
    );
  return null;
}

function validateObject(
  schema: JsonSchema,
  value: unknown,
  path: string,
  depth: number,
  options: ValidationOptions,
): string | null {
  if (!isRecord(value)) return `${path} must be an object`;
  // An undefined property is absent in JSON; in-process callers can pass one.
  const entries = Object.entries(value).filter(
    ([, child]) => child !== undefined,
  );
  const maxProperties =
    schema.maxProperties ?? (options.bounded ? 100 : Infinity);
  if (
    entries.length < (schema.minProperties ?? 0) ||
    entries.length > maxProperties
  )
    return `${path} has an invalid number of properties`;
  for (const key of schema.required ?? []) {
    if (!Object.hasOwn(value, key) || value[key] === undefined)
      return `${path}.${key} is required`;
  }
  for (const [key, child] of entries) {
    const error = validateObjectProperty(
      schema,
      key,
      child,
      path,
      depth,
      options,
    );
    if (error) return error;
  }
  return null;
}

function validateArray(
  schema: JsonSchema,
  value: unknown,
  path: string,
  depth: number,
  options: ValidationOptions,
): string | null {
  if (!Array.isArray(value)) return `${path} must be an array`;
  const maxItems = schema.maxItems ?? (options.bounded ? 100 : Infinity);
  if (value.length < (schema.minItems ?? 0) || value.length > maxItems)
    return `${path}[] has an invalid number of items`;
  if (schema.items) {
    for (let i = 0; i < value.length; i++) {
      const error = validate(
        schema.items,
        value[i],
        `${path}[${i}]`,
        depth + 1,
        options,
      );
      if (error) return error;
    }
  }
  return null;
}

function validateString(
  schema: JsonSchema,
  value: unknown,
  path: string,
  options: ValidationOptions,
): string | null {
  if (typeof value !== "string") return `${path} must be a string`;
  if (schema.pattern && !new RegExp(schema.pattern).test(value))
    return `${path} has an invalid format`;
  const maxLength = schema.maxLength ?? (options.bounded ? 10000 : Infinity);
  if (
    value.trim().length < (schema.minLength ?? 0) ||
    value.length > maxLength
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

/** Enforce the JSON Schema subset advertised by tools/list. */
function validate(
  schema: JsonSchema,
  value: unknown,
  path: string,
  depth: number,
  options: ValidationOptions,
): string | null {
  if (depth > 12) return `${path} exceeds the maximum nesting depth`;
  if (
    schema.anyOf &&
    !schema.anyOf.some(
      (candidate) =>
        validate(candidate, value, path, depth + 1, options) === null,
    )
  )
    return `${path} does not match an accepted shape`;
  if (schema.enum && !schema.enum.some((candidate) => candidate === value))
    return `${path} has an invalid value`;
  switch (schema.type) {
    case "object":
      return validateObject(schema, value, path, depth, options);
    case "array":
      return validateArray(schema, value, path, depth, options);
    case "string":
      return validateString(schema, value, path, options);
    case "number":
    case "integer":
      return validateNumber(schema, value, path);
    case "boolean":
      return typeof value === "boolean" ? null : `${path} must be a boolean`;
    case "null":
      return value === null ? null : `${path} must be null`;
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
  return validate(definition.inputSchema, args, "arguments", 0, {
    bounded: true,
  });
}

/**
 * Check a structured result against the tool's advertised outputSchema. MCP
 * clients reject non-conforming structuredContent, so tests hold every result
 * to the published contract.
 */
export function validateToolOutput(
  name: ToolName,
  structuredContent: unknown,
): string | null {
  const definition = TOOL_DEFINITIONS.find((tool) => tool.name === name);
  if (!definition) return "Unknown tool";
  return validate(definition.outputSchema, structuredContent, "result", 0, {
    bounded: false,
  });
}
