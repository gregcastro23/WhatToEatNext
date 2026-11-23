/**
 * @jest-environment node
 *
 * Provenance of the MCP network summary: classifying why Planetary Agents was not
 * used, describing it for an operator, and logging it without flooding the log
 * (the admin page polls, so an outage would otherwise log on every poll).
 *
 * @file src/services/__tests__/mcpFallback.test.ts
 */
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockLoggerError = jest.fn<(...args: unknown[]) => void>();

jest.mock("@/lib/logger", () => ({
  _logger: {
    error: (...args: unknown[]) => mockLoggerError(...args),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

import {
  describeFallbackReason,
  logMcpFallback,
  reasonFromError,
  reasonFromStatus,
  resetMcpFallbackLog,
} from "@/services/mcpFallback";

const MINUTE = 60_000;

beforeEach(() => {
  mockLoggerError.mockReset();
  resetMcpFallbackLog();
});

describe("reasonFromError", () => {
  it("calls a TimeoutError or AbortError a timeout", () => {
    expect(reasonFromError(new DOMException("timed out", "TimeoutError"))).toBe("timeout");
    expect(reasonFromError(new DOMException("aborted", "AbortError"))).toBe("timeout");
  });

  it("calls an unreadable body malformed, not a network failure", () => {
    expect(reasonFromError(new SyntaxError("Unexpected token"))).toBe("malformed_response");
    const zod = new Error("invalid");
    zod.name = "ZodError";
    expect(reasonFromError(zod)).toBe("malformed_response");
  });

  it("calls any other failure unreachable (a control)", () => {
    expect(reasonFromError(new TypeError("fetch failed"))).toBe("unreachable");
    expect(reasonFromError("boom")).toBe("unreachable");
  });
});

describe("reasonFromStatus", () => {
  it("carries the status", () => {
    expect(reasonFromStatus(401)).toBe("http_401");
    expect(reasonFromStatus(503)).toBe("http_503");
  });
});

describe("describeFallbackReason", () => {
  it.each([
    ["no_internal_secret", "WTEN has no INTERNAL_API_SECRET to call it with"],
    ["timeout", "the call timed out"],
    ["unreachable", "the call failed at the network level"],
    ["malformed_response", "it answered with a body WTEN could not read"],
    ["pa_not_live", "it reported itself not live"],
    ["pa_reported_no_calls", "it reported no MCP calls in this window"],
    ["http_401", "it answered HTTP 401"],
    ["http_503", "it answered HTTP 503"],
  ])("explains %s", (reason, text) => {
    expect(describeFallbackReason(reason)).toBe(text);
  });

  it("says so when no reason was recorded, and passes an unknown reason through (controls)", () => {
    expect(describeFallbackReason(undefined)).toBe("the reason was not recorded");
    expect(describeFallbackReason("something_new")).toBe("something_new");
  });
});

describe("logMcpFallback", () => {
  it("logs the reason with its explanation, as an error (warn is silent in production)", () => {
    logMcpFallback("admin/mcp-summary", "http_401", 0);

    expect(mockLoggerError).toHaveBeenCalledTimes(1);
    expect(mockLoggerError.mock.calls[0]?.[0]).toBe(
      "[admin/mcp-summary] Planetary Agents MCP summary not used: http_401 (it answered HTTP 401)",
    );
  });

  it("logs a repeating reason once per 10 minutes, not on every poll", () => {
    logMcpFallback("admin/mcp-summary", "timeout", 0);
    logMcpFallback("admin/mcp-summary", "timeout", 30_000);
    logMcpFallback("admin/mcp-summary", "timeout", 9 * MINUTE);
    expect(mockLoggerError).toHaveBeenCalledTimes(1);

    logMcpFallback("admin/mcp-summary", "timeout", 10 * MINUTE);
    expect(mockLoggerError).toHaveBeenCalledTimes(2);
  });

  it("logs a different reason, or the same reason from another scope, straight away", () => {
    logMcpFallback("admin/mcp-summary", "timeout", 0);
    logMcpFallback("admin/mcp-summary", "http_401", 1_000);
    logMcpFallback("mcpNetworkService", "timeout", 2_000);

    expect(mockLoggerError).toHaveBeenCalledTimes(3);
  });

  it("never logs an idle PA, which is not a failure (a control)", () => {
    logMcpFallback("admin/mcp-summary", "pa_reported_no_calls", 0);

    expect(mockLoggerError).not.toHaveBeenCalled();
  });
});
