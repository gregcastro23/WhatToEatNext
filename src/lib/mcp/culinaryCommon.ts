/**
 * @file src/lib/mcp/culinaryCommon.ts
 *
 * Shared helpers and types for MCP culinary tools.
 */
import type { ToolResult } from "./tools";

export type { ToolResult };

export function toolFailure(
  errorCode: NonNullable<ToolResult["errorCode"]>,
  errorMessage: string,
  remediation?: string,
): ToolResult {
  return {
    ok: false,
    data: null,
    errorCode,
    errorMessage,
    ...(remediation ? { remediation } : {}),
    summary: { reason: errorCode.toLowerCase() },
  };
}

export function toStringArray(val: unknown): string[] {
  if (!Array.isArray(val)) return [];
  const result: string[] = [];
  for (const item of val) {
    if (typeof item === "string") {
      result.push(item);
    }
  }
  return result;
}

