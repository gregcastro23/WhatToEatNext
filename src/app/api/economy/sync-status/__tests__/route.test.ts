/**
 * @jest-environment node
 *
 * Tests for GET /api/economy/sync-status:
 * - 401 on missing or invalid X-Sync-Secret.
 * - 400 on missing idempotencyKey.
 * - 200 applied: true when found in token_transactions or webhook_events.
 * - 200 applied: false when absent.
 * - 500 on database error (CRITICAL: never applied: false on error).
 */

const mockExecuteQuery = jest.fn();
jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...args: unknown[]): unknown => mockExecuteQuery(...args),
}));

import { NextRequest } from "next/server";
import { GET } from "../route";

const TEST_SECRET = "sync-status-secret-123";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function makeStatusRequest(
  idempotencyKey?: string,
  secretHeader?: string,
): NextRequest {
  const url = new URL("http://localhost/api/economy/sync-status");
  if (idempotencyKey !== undefined) {
    url.searchParams.set("idempotencyKey", idempotencyKey);
  }
  const headers: Record<string, string> = {};
  if (secretHeader !== undefined) {
    headers["x-sync-secret"] = secretHeader;
  }
  return new NextRequest(url.toString(), {
    method: "GET",
    headers,
  });
}

describe("GET /api/economy/sync-status", () => {
  const origSecret = process.env.ALCHM_KITCHEN_SYNC_SECRET;

  beforeEach(() => {
    process.env.ALCHM_KITCHEN_SYNC_SECRET = TEST_SECRET;
    mockExecuteQuery.mockReset();
  });

  afterAll(() => {
    process.env.ALCHM_KITCHEN_SYNC_SECRET = origSecret;
  });

  it("returns 401 when X-Sync-Secret is missing or incorrect", async () => {
    const req1 = makeStatusRequest("conv-1");
    const res1 = await GET(req1);
    expect(res1.status).toBe(401);

    const req2 = makeStatusRequest("conv-1", "wrong-secret");
    const res2 = await GET(req2);
    expect(res2.status).toBe(401);
  });

  it("returns 400 when idempotencyKey query param is missing or empty", async () => {
    const req = makeStatusRequest(undefined, TEST_SECRET);
    const res = await GET(req);
    expect(res.status).toBe(400);

    const reqEmpty = makeStatusRequest("   ", TEST_SECRET);
    const resEmpty = await GET(reqEmpty);
    expect(resEmpty.status).toBe(400);
  });

  it("returns applied: true when found in token_transactions", async () => {
    mockExecuteQuery.mockResolvedValueOnce({ rows: [{ id: "tx-999" }] });

    const req = makeStatusRequest("pentacle_conv:escrow-1", TEST_SECRET);
    const res = await GET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(isRecord(data)).toBe(true);
    if (isRecord(data)) {
      expect(data.ok).toBe(true);
      expect(data.idempotencyKey).toBe("pentacle_conv:escrow-1");
      expect(data.applied).toBe(true);
    }
  });

  it("returns applied: true when found in webhook_events", async () => {
    // 1. token_transactions probe returns empty
    mockExecuteQuery.mockResolvedValueOnce({ rows: [] });
    // 2. webhook_events probe returns row
    mockExecuteQuery.mockResolvedValueOnce({ rows: [{ id: 456 }] });

    const req = makeStatusRequest("pentacle_conv:escrow-2", TEST_SECRET);
    const res = await GET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(isRecord(data)).toBe(true);
    if (isRecord(data)) {
      expect(data.ok).toBe(true);
      expect(data.idempotencyKey).toBe("pentacle_conv:escrow-2");
      expect(data.applied).toBe(true);
    }
  });

  it("returns applied: false when neither token_transactions nor webhook_events has it", async () => {
    mockExecuteQuery.mockResolvedValueOnce({ rows: [] });
    mockExecuteQuery.mockResolvedValueOnce({ rows: [] });

    const req = makeStatusRequest("unapplied-key", TEST_SECRET);
    const res = await GET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(isRecord(data)).toBe(true);
    if (isRecord(data)) {
      expect(data.ok).toBe(true);
      expect(data.idempotencyKey).toBe("unapplied-key");
      expect(data.applied).toBe(false);
    }
  });

  it("CRITICAL: returns 500 on database error, NEVER applied: false", async () => {
    mockExecuteQuery.mockRejectedValueOnce(new Error("Connection reset"));

    const req = makeStatusRequest("error-key", TEST_SECRET);
    const res = await GET(req);
    expect(res.status).toBe(500);

    const data = await res.json();
    expect(isRecord(data)).toBe(true);
    if (isRecord(data)) {
      expect(data.ok).toBe(false);
      expect(data.applied).toBeUndefined();
    }
  });
});
