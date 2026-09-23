/**
 * @jest-environment node
 *
 * Tests for POST /api/internal/users/check-shared:
 * - 401 on missing or invalid X-Sync-Secret.
 * - 400 on malformed body or batch > 1,000.
 * - 200 with intersection of emails.
 * - 500 on database error.
 */

const mockExecuteQuery = jest.fn();
jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...args: unknown[]): unknown => mockExecuteQuery(...args),
}));

import { NextRequest } from "next/server";
import { POST } from "../route";

const TEST_SECRET = "check-shared-secret-555";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function makeCheckRequest(
  body: unknown,
  secretHeader?: string,
): NextRequest {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (secretHeader !== undefined) {
    headers["x-sync-secret"] = secretHeader;
  }
  return new NextRequest("http://localhost/api/internal/users/check-shared", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

describe("POST /api/internal/users/check-shared", () => {
  const origSecret = process.env.ALCHM_KITCHEN_SYNC_SECRET;

  beforeEach(() => {
    process.env.ALCHM_KITCHEN_SYNC_SECRET = TEST_SECRET;
    mockExecuteQuery.mockReset();
  });

  afterAll(() => {
    process.env.ALCHM_KITCHEN_SYNC_SECRET = origSecret;
  });

  it("returns 401 when X-Sync-Secret is missing or incorrect", async () => {
    const req1 = makeCheckRequest({ emails: ["test@example.com"] });
    const res1 = await POST(req1);
    expect(res1.status).toBe(401);

    const req2 = makeCheckRequest({ emails: ["test@example.com"] }, "wrong");
    const res2 = await POST(req2);
    expect(res2.status).toBe(401);
  });

  it("returns 400 when body does not contain an emails array", async () => {
    const req = makeCheckRequest({ notEmails: [] }, TEST_SECRET);
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when emails array exceeds batch cap of 1,000", async () => {
    const bigList: string[] = [];
    for (let i = 0; i < 1001; i++) {
      bigList.push(`user${i}@example.com`);
    }
    const req = makeCheckRequest({ emails: bigList }, TEST_SECRET);
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 200 with empty sharedEmails when input array is empty", async () => {
    const req = makeCheckRequest({ emails: [] }, TEST_SECRET);
    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(isRecord(data)).toBe(true);
    if (isRecord(data)) {
      expect(data.success).toBe(true);
      expect(data.sharedEmails).toEqual([]);
    }
    expect(mockExecuteQuery).not.toHaveBeenCalled();
  });

  it("returns 200 with matching shared emails in lowercase", async () => {
    mockExecuteQuery.mockResolvedValueOnce({
      rows: [{ email: "alice@alchm.kitchen" }],
    });

    const req = makeCheckRequest(
      { emails: ["Alice@Alchm.Kitchen", "bob@external.com"] },
      TEST_SECRET,
    );
    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(isRecord(data)).toBe(true);
    if (isRecord(data)) {
      expect(data.success).toBe(true);
      expect(data.sharedEmails).toEqual(["alice@alchm.kitchen"]);
    }

    expect(mockExecuteQuery).toHaveBeenCalledWith(
      expect.stringContaining("WHERE LOWER(email) = ANY"),
      [["alice@alchm.kitchen", "bob@external.com"]],
    );
  });

  it("returns 500 when query fails", async () => {
    mockExecuteQuery.mockRejectedValueOnce(new Error("DB failure"));
    const req = makeCheckRequest({ emails: ["alice@test.com"] }, TEST_SECRET);
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});
