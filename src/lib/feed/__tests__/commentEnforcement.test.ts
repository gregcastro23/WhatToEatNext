/**
 * commentEnforcement — body sanitation + blocked-pair predicate (PR 5).
 * Fixture identities are the historical-agent roster (design-spec §4.8):
 * Marie Curie ↔ Nikola Tesla.
 */

jest.mock("@/lib/database", () => ({
  executeQuery: jest.fn(),
}));

import { executeQuery } from "@/lib/database";
import { isBlockedBetween, sanitizeCommentBody } from "@/lib/feed/commentEnforcement";

const CURIE = "11111111-1111-4111-8111-111111111111";
const TESLA = "22222222-2222-4222-8222-222222222222";
const mockQuery = executeQuery as jest.Mock;

describe("sanitizeCommentBody", () => {
  it("trims and keeps a normal body", () => {
    expect(sanitizeCommentBody("  Radium tart, exquisite  ")).toBe("Radium tart, exquisite");
  });

  it("rejects non-strings and empties", () => {
    expect(sanitizeCommentBody(42)).toBeNull();
    expect(sanitizeCommentBody("")).toBeNull();
    expect(sanitizeCommentBody("   ")).toBeNull();
  });

  it("strips control chars but preserves newline/tab content", () => {
    // "a" + NUL + "b" + BEL + "c" + tab + "d" + newline + "e"
    const nul = String.fromCharCode(0);
    const bel = String.fromCharCode(7);
    const input = "a" + nul + "b" + bel + "c" + "\t" + "d" + "\n" + "e";
    expect(sanitizeCommentBody(input)).toBe("abc\td\ne");
  });

  it("rejects bodies over 1000 chars", () => {
    expect(sanitizeCommentBody("x".repeat(1001))).toBeNull();
    expect(sanitizeCommentBody("x".repeat(1000))).toHaveLength(1000);
  });
});

describe("isBlockedBetween", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns false for self / empty without a query", async () => {
    expect(await isBlockedBetween(CURIE, CURIE)).toBe(false);
    expect(await isBlockedBetween("", TESLA)).toBe(false);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("returns true when a blocked row exists (either direction)", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ 1: 1 }] });
    expect(await isBlockedBetween(CURIE, TESLA)).toBe(true);
    const [sql, params] = mockQuery.mock.calls[0];
    expect(sql).toContain("status = 'blocked'");
    expect(params).toEqual([CURIE, TESLA]);
  });

  it("returns false when no blocked row exists", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    expect(await isBlockedBetween(CURIE, TESLA)).toBe(false);
  });

  it("FAILS CLOSED — propagates DB errors so the route can 500 (never allow)", async () => {
    mockQuery.mockRejectedValueOnce(new Error("connection reset"));
    await expect(isBlockedBetween(CURIE, TESLA)).rejects.toThrow("connection reset");
  });
});
