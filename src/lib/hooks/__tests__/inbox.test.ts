/**
 * @jest-environment node
 *
 * The claim sequence (insert → re-claim → duplicate) with the database mocked.
 * The statements themselves are exercised against a real PostgreSQL (PGlite)
 * in the PR's verification; this pins the branching around them.
 */

const mockExecuteQuery = jest.fn();
jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...a: unknown[]): unknown => mockExecuteQuery(...a),
}));
jest.mock("@/lib/logger", () => ({
  _logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

import {
  boundedSummary,
  claimWebhookEvent,
  completeWebhookEvent,
  failWebhookEvent,
  formatErrorProvenance,
  CLAIM_INSERT_SQL,
  CLAIM_RETRY_SQL,
  COMPLETE_SQL,
  FAIL_SQL,
  MARK_DUPLICATE_SQL,
} from "@/lib/hooks/inbox";
import type { HookEvent, InboxClaim } from "@/lib/hooks/types";

const EVENT: HookEvent = {
  source: "stripe",
  id: "evt_1",
  type: "invoice.paid",
  subjectId: "in_1",
  occurredAt: new Date("2026-09-22T00:00:00Z"),
  summary: { type: "invoice.paid" },
  data: null,
};

function rows(...r: unknown[]): { rows: unknown[] } {
  return { rows: r };
}

beforeEach(() => {
  mockExecuteQuery.mockReset();
});

describe("claimWebhookEvent", () => {
  it("claims a first delivery with the insert alone", async () => {
    mockExecuteQuery.mockResolvedValueOnce(rows({ id: "11", attempts: 1 }));
    const claim = await claimWebhookEvent(EVENT);
    expect(claim).toMatchObject({ kind: "claimed", rowId: 11, attempt: 1 });
    expect(mockExecuteQuery).toHaveBeenCalledTimes(1);
    expect(mockExecuteQuery.mock.calls[0]?.[0]).toBe(CLAIM_INSERT_SQL);
  });

  it("re-claims a redelivery of a FAILED event, so the provider's retry runs", async () => {
    mockExecuteQuery.mockResolvedValueOnce(rows()).mockResolvedValueOnce(rows({ id: 11, attempts: 2 }));
    const claim = await claimWebhookEvent(EVENT);
    expect(claim).toMatchObject({ kind: "claimed", rowId: 11, attempt: 2 });
    expect(mockExecuteQuery.mock.calls[1]?.[0]).toBe(CLAIM_RETRY_SQL);
  });

  it("reports a redelivery of a finished event as a duplicate, with its status", async () => {
    mockExecuteQuery.mockResolvedValueOnce(rows()).mockResolvedValueOnce(rows()).mockResolvedValueOnce(rows({ status: "processed" }));
    const claim = await claimWebhookEvent(EVENT);
    expect(claim).toEqual({ kind: "duplicate", status: "processed" });
    expect(mockExecuteQuery.mock.calls[2]?.[0]).toBe(MARK_DUPLICATE_SQL);
  });

  it("never calls an unverifiable duplicate done — a vanished row processes, unrecorded", async () => {
    mockExecuteQuery.mockResolvedValue(rows());
    const claim = await claimWebhookEvent(EVENT);
    expect(claim.kind).toBe("unrecorded");
  });

  it("never throws: a database error yields unrecorded, and delivery proceeds", async () => {
    mockExecuteQuery.mockRejectedValue(new Error("Query read timeout"));
    const claim = await claimWebhookEvent(EVENT);
    expect(claim).toMatchObject({ kind: "unrecorded", error: "Query read timeout" });
  });
});

describe("boundedSummary", () => {
  it("stores small summaries verbatim and replaces oversized ones with their size", () => {
    expect(boundedSummary({ a: 1 })).toBe('{"a":1}');
    const big = boundedSummary({ blob: "x".repeat(10_000) });
    expect(JSON.parse(big)).toEqual({ truncated: true, bytes: 10_011 });
  });
});

describe("formatErrorProvenance", () => {
  it("captures stack trace when err is an Error", () => {
    const err = new Error("Database deadlock");
    const formatted = formatErrorProvenance(err);
    expect(formatted.includes("Database deadlock")).toBe(true);
    expect(formatted.includes("Error:")).toBe(true);
  });

  it("falls back to name: message when stack is empty", () => {
    const err = new Error("Synthetic error");
    err.stack = "";
    expect(formatErrorProvenance(err)).toBe("Error: Synthetic error");
  });

  it("records string error reason verbatim up to limit", () => {
    expect(formatErrorProvenance("rejected:422")).toBe("rejected:422");
    expect(formatErrorProvenance("rejected:404")).toBe("rejected:404");
    expect(formatErrorProvenance("rejected:500")).toBe("rejected:500");
  });

  it("formats non-error values as strings", () => {
    expect(formatErrorProvenance(404)).toBe("404");
  });
});

describe("failWebhookEvent", () => {
  it("settles claimed event as failed with explicit rejection reason", async () => {
    mockExecuteQuery.mockResolvedValueOnce(rows());
    const claim: InboxClaim = { kind: "claimed", rowId: 99, attempt: 1, startedAt: Date.now() - 50 };
    await failWebhookEvent(claim, "rejected:422");
    expect(mockExecuteQuery).toHaveBeenCalledTimes(1);
    expect(mockExecuteQuery.mock.calls[0]?.[0]).toBe(FAIL_SQL);
    const args = mockExecuteQuery.mock.calls[0]?.[1];
    expect(Array.isArray(args) && args[0]).toBe(99);
    expect(Array.isArray(args) && args[2]).toBe("rejected:422");
  });

  it("settles claimed event with error stack provenance when Error is thrown", async () => {
    mockExecuteQuery.mockResolvedValueOnce(rows());
    const claim: InboxClaim = { kind: "claimed", rowId: 101, attempt: 1, startedAt: Date.now() - 100 };
    const err = new Error("Unique constraint violation");
    await failWebhookEvent(claim, err);
    expect(mockExecuteQuery).toHaveBeenCalledTimes(1);
    expect(mockExecuteQuery.mock.calls[0]?.[0]).toBe(FAIL_SQL);
    const args = mockExecuteQuery.mock.calls[0]?.[1];
    expect(Array.isArray(args) && args[0]).toBe(101);
    expect(typeof (Array.isArray(args) && args[2]) === "string").toBe(true);
    const recordedError = String(Array.isArray(args) && args[2]);
    expect(recordedError.includes("Unique constraint violation")).toBe(true);
  });

  it("safely no-ops for non-claimed events (duplicate or unrecorded)", async () => {
    const dupClaim: InboxClaim = { kind: "duplicate", status: "processed" };
    await failWebhookEvent(dupClaim, "rejected:500");
    const unrecClaim: InboxClaim = { kind: "unrecorded", startedAt: Date.now() };
    await failWebhookEvent(unrecClaim, "rejected:500");
    expect(mockExecuteQuery).not.toHaveBeenCalled();
  });
});

describe("completeWebhookEvent", () => {
  it("marks a claimed event processed with bounded summary of result", async () => {
    mockExecuteQuery.mockResolvedValueOnce(rows());
    const claim: InboxClaim = { kind: "claimed", rowId: 88, attempt: 1, startedAt: Date.now() - 25 };
    await completeWebhookEvent(claim, "processed", { success: true });
    expect(mockExecuteQuery).toHaveBeenCalledTimes(1);
    expect(mockExecuteQuery.mock.calls[0]?.[0]).toBe(COMPLETE_SQL);
    const args = mockExecuteQuery.mock.calls[0]?.[1];
    expect(Array.isArray(args) && args[0]).toBe(88);
    expect(Array.isArray(args) && args[1]).toBe("processed");
    expect(Array.isArray(args) && args[3]).toBe('{"success":true}');
  });
});
