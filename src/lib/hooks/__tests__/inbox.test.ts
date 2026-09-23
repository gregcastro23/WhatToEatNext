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
  CLAIM_INSERT_SQL,
  CLAIM_RETRY_SQL,
  MARK_DUPLICATE_SQL,
} from "@/lib/hooks/inbox";
import type { HookEvent } from "@/lib/hooks/types";

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
