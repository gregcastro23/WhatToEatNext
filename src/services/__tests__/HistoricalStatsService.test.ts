/**
 * @jest-environment node
 */

jest.mock("next/cache", () => ({
  unstable_cache: <T extends (...args: unknown[]) => unknown>(fn: T): T => fn,
}));

jest.mock("@/lib/logger", () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

import {
  getCachedHistoricalStats,
  parseBulkPositionsPayload,
  sanitizePositions,
} from "../HistoricalStatsService";

describe("HistoricalStatsService parsers", () => {
  it("strips non-planet entries like legacy _aspects arrays and invalid positions", () => {
    const cleaned = sanitizePositions({
      Sun: {
        sign: "aries",
        degree: 15,
        minute: 30,
        isRetrograde: false,
        exactLongitude: 15.5,
        distance: 1.0,
      },
      Moon: {
        sign: "taurus",
        degree: 8,
      },
      _aspects: [{ type: "conjunction" }],
      badNumber: { sign: "leo", degree: Number.POSITIVE_INFINITY, minute: 0 },
      badSign: { sign: 123, degree: 10, minute: 0 },
      primitive: "aries",
    });

    expect(Object.keys(cleaned)).toEqual(["Sun", "Moon"]);
    expect(cleaned.Sun).toEqual({
      sign: "aries",
      degree: 15,
      minute: 30,
      isRetrograde: false,
      exactLongitude: 15.5,
      distance: 1.0,
    });
    expect(cleaned.Moon).toEqual({
      sign: "taurus",
      degree: 8,
      minute: 0,
    });
  });

  it("parses valid bulk positions payloads", () => {
    const payload = parseBulkPositionsPayload({
      success: true,
      data: {
        "2026-11-01T00:00:00.000Z": {
          Sun: { sign: "scorpio", degree: 9, minute: 12 },
          _aspects: [],
        },
        "2026-11-01T12:00:00.000Z": {
          Sun: { sign: "scorpio", degree: 9, minute: 42 },
        },
      },
    });

    expect(payload.success).toBe(true);
    expect(Object.keys(payload.data)).toEqual([
      "2026-11-01T00:00:00.000Z",
      "2026-11-01T12:00:00.000Z",
    ]);
    expect(payload.data["2026-11-01T00:00:00.000Z"]).toEqual({
      Sun: { sign: "scorpio", degree: 9, minute: 12 },
    });
  });

  it("rejects null, array, non-success, or missing data payloads", () => {
    const parsedNull: unknown = JSON.parse("null");
    expect(() => parseBulkPositionsPayload(parsedNull)).toThrow(
      "Invalid structure from bulk query",
    );
    expect(() => parseBulkPositionsPayload([])).toThrow(
      "Invalid structure from bulk query",
    );
    expect(() => parseBulkPositionsPayload({ success: false, data: {} })).toThrow(
      "Invalid structure from bulk query",
    );
    expect(() => parseBulkPositionsPayload({ success: true, data: null })).toThrow(
      "Invalid structure from bulk query",
    );
  });

  it("returns null from getCachedHistoricalStats when backend responds with invalid JSON or error status", async () => {
    const originalFetch = globalThis.fetch;
    try {
      Object.defineProperty(globalThis, "fetch", {
        value: jest.fn().mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => JSON.parse("null"),
        }),
        writable: true,
        configurable: true,
      });

      await expect(getCachedHistoricalStats()).resolves.toBeNull();
    } finally {
      Object.defineProperty(globalThis, "fetch", {
        value: originalFetch,
        writable: true,
        configurable: true,
      });
    }
  });
});
